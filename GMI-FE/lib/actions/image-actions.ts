/**
 * Image Actions
 * Client-side actions for image upload
 */

import {
  uploadImage as apiUploadImage,
  deleteImage as apiDeleteImage,
  type UploadResponse
} from '../api/upload.api'
import { compressImage } from '../utils/image-compression'

/**
 * Upload post image with automatic compression
 */
export async function uploadPostImage(
  file: File,
  walletAddress: string,
  walletSignature: string,
  message?: string
): Promise<string> {
  // Compress image before upload to reduce size and improve speed
  let fileToUpload = file

  try {
    // Only compress if it's an image and larger than 500KB
    if (file.type.startsWith('image/') && file.size > 500 * 1024) {
      console.log(`[Upload] Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
      fileToUpload = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
        maxSizeMB: 1
      })
      console.log(`[Upload] Compressed size: ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`)
    }
  } catch (error) {
    console.warn('[Upload] Compression failed, using original file:', error)
    // Continue with original file if compression fails
  }

  const response = await apiUploadImage(fileToUpload, walletAddress, walletSignature, message)

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to upload image')
  }

  // Return the URL of the uploaded image
  return response.data.url
}

/**
 * Delete image
 */
export async function deleteImage(
  path: string,
  walletAddress: string,
  walletSignature: string
) {
  const response = await apiDeleteImage(path, walletAddress, walletSignature)

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to delete image')
  }

  return response.data
}

// Re-export types
export type { UploadResponse }
