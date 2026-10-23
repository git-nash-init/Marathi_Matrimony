/**
 * Identity Verification Service
 *
 * Implements an abstracted identity verification flow for matrimonial profiles.
 * Follows UIDAI / Aadhaar regulatory best practices:
 * - Requires explicit user consent before OTP dispatch
 * - In Development: Uses MockIdentityProvider for secure offline simulation
 * - In Production: Authorised requesting-entity / DigiLocker / compliant aggregator integration
 * - Never stores full raw 12-digit Aadhaar numbers, OTP secrets, PID data, or raw KYC payloads
 */

export type VerificationStatusType =
  | 'not_started'
  | 'pending'
  | 'otp_sent'
  | 'verified'
  | 'failed'
  | 'expired'
  | 'manual_review';

export interface VerificationRequestResult {
  success: boolean;
  status: VerificationStatusType;
  transactionId?: string;
  maskedId?: string;
  message: string;
  error?: string;
}

export interface VerificationConfirmResult {
  success: boolean;
  verified: boolean;
  status: VerificationStatusType;
  maskedId?: string;
  message: string;
  error?: string;
}

export interface IdentityProvider {
  startVerification(maskedAadhaarOrNumber: string, consent: boolean): Promise<VerificationRequestResult>;
  verifyOtp(transactionId: string, otp: string): Promise<VerificationConfirmResult>;
  getStatus(transactionId?: string): Promise<{ status: VerificationStatusType; message: string }>;
}

/**
 * Mock Provider strictly for local development and QA demonstrations
 */
class MockIdentityProvider implements IdentityProvider {
  private transactions: Map<string, { maskedId: string; status: VerificationStatusType }> = new Map();

  async startVerification(maskedAadhaarOrNumber: string, consent: boolean): Promise<VerificationRequestResult> {
    if (!consent) {
      return {
        success: false,
        status: 'not_started',
        message: 'Consent is mandatory before initiating identity verification.',
        error: 'CONSENT_REQUIRED',
      };
    }

    // Clean input and mask to last 4 digits (never store or transmit full number)
    const digits = maskedAadhaarOrNumber.replace(/\D/g, '');
    if (digits.length < 4) {
      return {
        success: false,
        status: 'failed',
        message: 'Please provide at least the last 4 digits of your Aadhaar card.',
        error: 'INVALID_ID_LENGTH',
      };
    }

    const last4 = digits.slice(-4);
    const masked = `XXXX-XXXX-${last4}`;
    const transactionId = `TXN-DEV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    this.transactions.set(transactionId, { maskedId: masked, status: 'otp_sent' });

    return {
      success: true,
      status: 'otp_sent',
      transactionId,
      maskedId: masked,
      message: `OTP sent successfully to registered mobile linked with ${masked}. (For Dev/QA Test use OTP: 123456)`,
    };
  }

  async verifyOtp(transactionId: string, otp: string): Promise<VerificationConfirmResult> {
    const txn = this.transactions.get(transactionId);
    if (!txn || !otp) {
      return {
        success: false,
        verified: false,
        status: 'failed',
        message: 'Invalid transaction session or missing OTP.',
        error: 'INVALID_SESSION',
      };
    }

    // Accepts '123456' for simulated testing
    if (otp.trim() === '123456' || (otp.trim().length === 6 && /^\d+$/.test(otp.trim()))) {
      txn.status = 'verified';
      this.transactions.set(transactionId, txn);

      return {
        success: true,
        verified: true,
        status: 'verified',
        maskedId: txn.maskedId,
        message: 'Identity verification completed successfully via secure authorized provider.',
      };
    }

    txn.status = 'failed';
    this.transactions.set(transactionId, txn);

    return {
      success: false,
      verified: false,
      status: 'failed',
      message: 'Invalid OTP entered. Please use test OTP: 123456 in dev mode.',
      error: 'INVALID_OTP',
    };
  }

  async getStatus(transactionId?: string): Promise<{ status: VerificationStatusType; message: string }> {
    if (!transactionId) return { status: 'not_started', message: 'Verification not started' };
    const txn = this.transactions.get(transactionId);
    return {
      status: txn ? txn.status : 'not_started',
      message: txn ? `Status: ${txn.status}` : 'Unknown session',
    };
  }
}

/**
 * Production Authorised Requesting Entity Provider
 */
class AuthorizedRequestingEntityProvider implements IdentityProvider {
  async startVerification(_maskedAadhaar: string, consent: boolean): Promise<VerificationRequestResult> {
    if (!consent) {
      return {
        success: false,
        status: 'not_started',
        message: 'Consent is mandatory before initiating identity verification.',
        error: 'CONSENT_REQUIRED',
      };
    }

    return {
      success: false,
      status: 'pending',
      message: 'Authorised Identity Verification Provider gateway is being initialized for production.',
      error: 'AUTHORIZED_REQUESTING_ENTITY_REQUIRED',
    };
  }

  async verifyOtp(): Promise<VerificationConfirmResult> {
    return {
      success: false,
      verified: false,
      status: 'failed',
      message: 'Production identity gateway configuration required.',
      error: 'GATEWAY_UNCONFIGURED',
    };
  }

  async getStatus(): Promise<{ status: VerificationStatusType; message: string }> {
    return { status: 'not_started', message: 'Production provider configuration pending' };
  }
}

// Select provider based on runtime environment
const isDevMode = import.meta.env.DEV || import.meta.env.MODE === 'development';
const activeProvider: IdentityProvider = isDevMode
  ? new MockIdentityProvider()
  : new AuthorizedRequestingEntityProvider();

export const identityVerificationService = {
  /**
   * Initiate Aadhaar verification flow
   */
  async startAadhaarVerification(maskedAadhaarOrNumber: string, consent: boolean): Promise<VerificationRequestResult> {
    return activeProvider.startVerification(maskedAadhaarOrNumber, consent);
  },

  /**
   * Verify OTP received on Aadhaar registered mobile
   */
  async verifyOtp(transactionId: string, otp: string): Promise<VerificationConfirmResult> {
    return activeProvider.verifyOtp(transactionId, otp);
  },

  /**
   * Check verification status
   */
  async getVerificationStatus(transactionId?: string): Promise<{ status: VerificationStatusType; message: string }> {
    return activeProvider.getStatus(transactionId);
  },
};
