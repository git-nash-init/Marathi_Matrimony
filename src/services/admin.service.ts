import { supabase } from '../lib/supabase';

export const adminService = {
  // Requires a super admin who has completed 2-step verification in this session.
  async setMfaRequired(required: boolean): Promise<void> {
    const { error } = await supabase.rpc('admin_set_mfa_required', { p_required: required });
    if (error) throw error;
  },
};
