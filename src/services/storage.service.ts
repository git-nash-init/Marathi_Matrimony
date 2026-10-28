import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UploadResult {
  url: string;
  path: string;
}

export const storageService = {
  /**
   * Upload an image to Supabase Storage bucket 'profile-photos'
   * @param userId Current user ID
   * @param file Image file to upload
   * @param slot Slot type: 'avatar' | 'photo_1' | 'photo_2'
   * @returns Public URL of uploaded image
   */
  async uploadProfilePhoto(
    userId: string,
    file: File,
    slot: 'avatar' | 'photo_1' | 'photo_2'
  ): Promise<string> {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size should be less than 5MB');
    }

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      throw new Error('Only JPEG, PNG, and WebP images are supported');
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${slot}_${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    if (!isSupabaseConfigured()) {
      // Local demo fallback: Convert to Data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    try {
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });

      if (error) {
        console.warn('Supabase storage upload error:', error.message);
        // Fallback to Data URL if upload policy or network blocks
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error('Failed to upload image:', err);
      // Fallback to Data URL
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });
    }
  },

  /**
   * Upload a biodata / horoscope / education document to the private 'profile-documents' bucket.
   * Path is <profile uuid>/<type>-<timestamp>.<ext>; storage policies restrict writes to the owner
   * and reads to the owner, admins and Diamond+ members (for approved profiles).
   */
  async uploadProfileDocument(
    profileId: string,
    docType: 'biodata' | 'horoscope' | 'education',
    file: File
  ): Promise<void> {
    if (file.size > 5 * 1024 * 1024) throw new Error('Document size should be less than 5MB');
    const valid = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!valid.includes(file.type.toLowerCase())) throw new Error('Only PDF, JPG or PNG files are supported');

    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const path = `${profileId}/${docType}-${Date.now()}.${ext}`;

    const { data: existing } = await supabase
      .from('profile_documents')
      .select('storage_path')
      .eq('profile_id', profileId)
      .eq('doc_type', docType)
      .maybeSingle();

    const { error: upErr } = await supabase.storage
      .from('profile-documents')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upErr) throw new Error(upErr.message);

    const { error: rowErr } = await supabase.from('profile_documents').upsert(
      { profile_id: profileId, doc_type: docType, storage_path: path, file_name: file.name, size_bytes: file.size },
      { onConflict: 'profile_id,doc_type' }
    );
    if (rowErr) {
      await supabase.storage.from('profile-documents').remove([path]);
      throw new Error(rowErr.message);
    }
    if (existing?.storage_path) {
      await supabase.storage.from('profile-documents').remove([existing.storage_path]);
    }
  },

  async deleteProfileDocument(profileId: string, docType: 'biodata' | 'horoscope' | 'education'): Promise<void> {
    const { data } = await supabase
      .from('profile_documents')
      .select('storage_path')
      .eq('profile_id', profileId)
      .eq('doc_type', docType)
      .maybeSingle();
    if (data?.storage_path) await supabase.storage.from('profile-documents').remove([data.storage_path]);
    await supabase.from('profile_documents').delete().eq('profile_id', profileId).eq('doc_type', docType);
  },

  /**
   * Delete a photo from Supabase storage
   */
  async deletePhoto(storagePath: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !storagePath) return true;
    try {
      const { error } = await supabase.storage
        .from('profile-photos')
        .remove([storagePath]);
      return !error;
    } catch {
      return false;
    }
  },
};
