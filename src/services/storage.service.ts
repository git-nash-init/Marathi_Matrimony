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
