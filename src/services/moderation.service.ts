import { supabase, SUPABASE_ANON_KEY, SUPABASE_URL } from '../lib/supabase';

const rpc = (fn: string, args?: Record<string, unknown>) => (supabase.rpc as any)(fn, args);

async function call<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await rpc(fn, args);
  if (error) throw error;
  return data as T;
}

/** Member functions answer { success, error } for problems the member can act on. */
async function memberCall(fn: string, args: Record<string, unknown>): Promise<Record<string, any>> {
  const result = await call<Record<string, any>>(fn, args);
  if (!result?.success) throw new Error(result?.error || 'Something went wrong. Please try again.');
  return result;
}

export interface QueueProfile {
  id: string;
  user_id: string;
  profile_id: string | null;
  first_name: string | null;
  last_name: string | null;
  gender: string | null;
  age: number | null;
  city: string | null;
  state: string | null;
  occupation: string | null;
  education: string | null;
  community: string | null;
  marital_status: string | null;
  about_me: string | null;
  avatar_url: string | null;
  photos: string[] | null;
  aadhaar_last4: string | null;
  verification_status: string | null;
  profile_status: string;
  rejection_reason: string | null;
  updated_at: string;
  created_at: string;
}

export interface VerificationItem {
  id: string;
  user_id: string;
  status: string;
  notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  document_count: number;
  profile_id: string | null;
  profile_code: string | null;
  first_name: string | null;
  last_name: string | null;
  gender: string | null;
  age: number | null;
  date_of_birth: string | null;
  city: string | null;
  avatar_url: string | null;
  aadhaar_last4: string | null;
}

export interface ReportItem {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  admin_notes: string | null;
  action_taken: string | null;
  reviewed_at: string | null;
  reporter_name: string | null;
  reporter_code: string | null;
  target_profile_id: string | null;
  target_user_id: string | null;
  target_code: string | null;
  target_first_name: string | null;
  target_last_name: string | null;
  target_avatar_url: string | null;
  target_blocked: boolean;
  target_report_count: number;
}

export interface QueuePage<T> {
  total: number;
  counts: Record<string, number>;
  items: T[];
}

export interface ProfileReview {
  kind: 'rejected' | 'correction';
  note: string | null;
  fields: string[];
  created_at: string;
}

export interface MyVerification {
  status: string;
  aadhaar_last4: string | null;
  latest: { status: string; notes: string | null; submitted_at: string; reviewed_at: string | null } | null;
}

const ID_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_ID_BYTES = 5 * 1024 * 1024;

/** Null when the file is fine, otherwise a reason in the member's language. */
export const idFileProblem = (file: File, mr: boolean): string | null => {
  if (!ID_TYPES.includes(file.type)) return mr ? 'फक्त JPG, PNG, WebP किंवा PDF चालेल.' : 'Please use a JPG, PNG, WebP or PDF file.';
  if (file.size > MAX_ID_BYTES) return mr ? 'फाइल ५ MB पेक्षा लहान हवी.' : 'The file must be smaller than 5 MB.';
  return null;
};

export const moderationService = {
  approvalQueue: (tab: string, search: string, page: number, pageSize: number) =>
    call<QueuePage<QueueProfile>>('admin_approval_queue', {
      p_tab: tab, p_search: search || null, p_limit: pageSize, p_offset: page * pageSize,
    }),
  approve: (profileId: string) => call<boolean>('admin_approve_profile', { p_profile_id: profileId }),
  reject: (profileId: string, reason: string) => call<boolean>('admin_reject_profile', { p_profile_id: profileId, p_reason: reason }),
  requestCorrection: (profileId: string, fields: string[], note: string) =>
    call<boolean>('admin_request_correction', { p_profile_id: profileId, p_fields: fields, p_note: note }),

  /** Takes the photo off the profile, then clears the file, since the bucket is public. */
  async removePhoto(profileId: string, url: string, reason: string): Promise<{ fileCleared: boolean }> {
    const { path } = await call<{ path: string | null }>('admin_remove_photo', {
      p_profile_id: profileId, p_url: url, p_reason: reason,
    });
    if (!path) return { fileCleared: true };
    const { error } = await supabase.storage.from('profile-photos').remove([path]);
    return { fileCleared: !error };
  },

  verificationQueue: (status: string, page: number, pageSize: number) =>
    call<QueuePage<VerificationItem>>('admin_verification_queue', { p_status: status, p_limit: pageSize, p_offset: page * pageSize }),

  /** Links expire after five minutes. Each opening is recorded in the audit log. */
  async openDocuments(id: string): Promise<{ path: string; url: string; isPdf: boolean }[]> {
    const paths = await call<string[]>('admin_open_verification_documents', { p_id: id });
    const { data, error } = await supabase.storage.from('verification-documents').createSignedUrls(paths, 300);
    if (error) throw error;
    return (data ?? []).flatMap((d) => (d.signedUrl ? [{
      path: d.path ?? '',
      url: d.signedUrl as string,
      isPdf: (d.path ?? '').toLowerCase().endsWith('.pdf'),
    }] : []));
  },
  reviewVerification: (id: string, approve: boolean, note?: string) =>
    call<boolean>('admin_review_verification', { p_id: id, p_approve: approve, p_note: note ?? null }),

  listReports: (status: string, page: number, pageSize: number) =>
    call<QueuePage<ReportItem>>('admin_list_reports', { p_status: status, p_limit: pageSize, p_offset: page * pageSize }),
  resolveReport: (id: string, status: string, notes: string, action: string | null) =>
    call<boolean>('admin_resolve_report', { p_report_id: id, p_status: status, p_notes: notes, p_action_taken: action }),

  // Member side
  getMyReview: () => call<ProfileReview | null>('get_my_profile_review'),
  getMyVerification: () => call<MyVerification | null>('get_my_verification'),

  async reportMember(targetProfileId: string, reason: string, details: string): Promise<{ alreadyReported: boolean }> {
    const result = await memberCall('report_member', { p_target: targetProfileId, p_reason: reason, p_details: details });
    return { alreadyReported: Boolean(result.already_reported) };
  },

  /** Uploads to the member's own private folder, then asks for review. */
  async submitIdDocument(userId: string, file: File, last4: string | null, onProgress?: (percent: number) => void): Promise<void> {
    const extension = file.type === 'application/pdf' ? 'pdf' : file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${userId}/id_${Date.now()}.${extension}`;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('UPLOAD_FAILED');
    // XMLHttpRequest rather than fetch, because only it reports how much has been sent.
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/verification-documents/${path}`);
      xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
      xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.timeout = 180000;
      xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress?.((e.loaded / e.total) * 100); };
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('UPLOAD_FAILED')));
      xhr.onerror = () => reject(new Error('UPLOAD_FAILED'));
      xhr.ontimeout = () => reject(new Error('UPLOAD_FAILED'));
      xhr.send(file);
    });
    await memberCall('submit_id_verification', { p_paths: [path], p_last4: last4 || null });
  },
};
