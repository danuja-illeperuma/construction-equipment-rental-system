import { equipmentApi } from '../modules/equipment/api/equipmentApi';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dodbtc6xc';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'cerms_equipment';

/**
 * Uploads a single image file to Cloudinary using an unsigned upload preset.
 * If Cloudinary upload is unavailable or preset is not yet created,
 * it seamlessly falls back to the backend upload endpoint.
 *
 * @param {File} file
 * @returns {Promise<string>} Secure image URL
 */
export const uploadImageFile = async (file) => {
  if (!file) return null;

  // 1. Attempt upload to Cloudinary CDN
  if (CLOUD_NAME && UPLOAD_PRESET) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'cerms/equipment');

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.secure_url) {
          console.info('Image uploaded to Cloudinary successfully:', data.secure_url);
          return data.secure_url;
        }
      } else {
        const errorJson = await response.json().catch(() => ({}));
        console.warn(
          `Cloudinary upload error (${response.status}):`,
          errorJson.error?.message || 'Preset not created or unauthorized. Falling back to server storage.'
        );
      }
    } catch (err) {
      console.warn('Cloudinary upload network error, falling back to server storage:', err.message);
    }
  }

  // 2. Fallback to local server filesystem upload
  try {
    const backendFormData = new FormData();
    backendFormData.append('files', file);
    const res = await equipmentApi.uploadImages(backendFormData);
    const urls = res.data || res || [];
    return urls[0] || null;
  } catch (err) {
    console.error('Local server upload fallback failed:', err.message);
    throw new Error('Failed to upload image. Please check your connection or preset settings.');
  }
};

/**
 * Uploads multiple image files concurrently.
 *
 * @param {File[]} files
 * @returns {Promise<string[]>} Array of uploaded image URLs
 */
export const uploadMultipleImageFiles = async (files) => {
  if (!files || files.length === 0) return [];
  const uploadPromises = Array.from(files).map((file) => uploadImageFile(file));
  const results = await Promise.all(uploadPromises);
  return results.filter(Boolean);
};
