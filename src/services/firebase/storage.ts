import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

// Upload image to Firebase Storage
export const uploadImage = async (
  path: string,
  file: Blob | Uint8Array | ArrayBuffer,
  metadata?: { contentType?: string }
): Promise<string> => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, metadata);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

// Delete image from Firebase Storage
export const deleteImage = async (path: string): Promise<void> => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};

// Upload profile photo
export const uploadProfilePhoto = async (
  userId: string,
  file: Blob | Uint8Array | ArrayBuffer
): Promise<string> => {
  const path = `profiles/${userId}/${Date.now()}.jpg`;
  return uploadImage(path, file, { contentType: 'image/jpeg' });
};

// Upload post image
export const uploadPostImage = async (
  userIdOrPostId: string,
  file: Blob | Uint8Array | ArrayBuffer,
  isTemp: boolean = false
): Promise<string> => {
  const timestamp = Date.now();
  const path = isTemp 
    ? `posts/temp/${userIdOrPostId}_${timestamp}.jpg`
    : `posts/${userIdOrPostId}/${timestamp}.jpg`;
  return uploadImage(path, file, { contentType: 'image/jpeg' });
};

// Upload matrimonial photo
export const uploadMatrimonialPhoto = async (
  profileId: string,
  file: Blob | Uint8Array | ArrayBuffer,
  index: number
): Promise<string> => {
  const path = `matrimonial/${profileId}/${index}_${Date.now()}.jpg`;
  return uploadImage(path, file, { contentType: 'image/jpeg' });
};

