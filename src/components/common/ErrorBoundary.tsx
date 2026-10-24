import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FDFBF7',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '540px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '36px 30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            textAlign: 'center',
            border: '1px solid #F1E5D1'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <AlertTriangle size={28} color="#D97706" />
            </div>
            <h2 style={{
              fontSize: '1.4rem',
              color: '#800020',
              fontWeight: 800,
              marginBottom: '8px'
            }}>
              काहीतरी चूक झाली / Something went wrong
            </h2>
            <p style={{
              color: '#64748B',
              fontSize: '0.95rem',
              lineHeight: '1.6',
              marginBottom: '24px'
            }}>
              आम्ही दिलगीर आहोत. कृपया पृष्ठ पुन्हा लोड करा किंवा मुख्यपृष्ठावर परत जा.
              <br />
              <span style={{ fontSize: '0.88rem', color: '#94A3B8' }}>
                An unexpected error occurred. Please reload or return home.
              </span>
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#800020',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  cursor: 'pointer'
                }}
              >
                पृष्ठ पुन्हा लोड करा (Reload)
              </button>
              <button
                type="button"
                onClick={() => { window.location.href = '/'; }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  color: '#800020',
                  border: '1px solid #800020',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  cursor: 'pointer'
                }}
              >
                मुख्यपृष्ठ (Home)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
