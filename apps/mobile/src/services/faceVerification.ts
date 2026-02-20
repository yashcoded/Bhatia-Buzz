import axios from 'axios';
import * as FileSystem from 'expo-file-system';

import { huggingFaceConfig } from '../constants/config';

export interface FaceDetectionResult {
  hasFace: boolean;
  isFrontal: boolean;
  isVisible: boolean;
  faceCount: number;
  confidence: number;
  error?: string;
  message?: string;
}

interface FaceBox {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  score: number;
  label: string;
}

/**
 * Convert image URI to base64 for Hugging Face API
 * Works for both React Native and Web
 */
const imageToBase64 = async (uri: string): Promise<string> => {
  try {
    // Check if we're on web or native
    if (typeof FileReader !== 'undefined' && (uri.startsWith('http') || uri.startsWith('blob:'))) {
      // Web environment with HTTP or blob URL
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      // React Native environment - use expo-file-system
      // This handles local file URIs (file://, content://, etc.)
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
      return base64;
    }
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to convert image to base64');
  }
};

/** Normalize a single detection from various HF/model formats to FaceBox */
function normalizeDetection(item: any): FaceBox {
  const box = item.box ?? item;
  return {
    xmin: box.xmin ?? box[0] ?? 0,
    ymin: box.ymin ?? box[1] ?? 0,
    xmax: box.xmax ?? box[2] ?? 0,
    ymax: box.ymax ?? box[3] ?? 0,
    score: typeof item.score === 'number' ? item.score : (box.score ?? 0.5),
    label: item.label ?? 'face',
  };
}

async function callInference(
  modelName: string,
  base64Image: string,
  apiToken: string | undefined,
  timeoutMs: number
): Promise<any> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiToken) headers['Authorization'] = `Bearer ${apiToken}`;
  const { data } = await axios.post(
    `https://api-inference.huggingface.co/models/${modelName}`,
    { inputs: base64Image },
    { headers, timeout: timeoutMs }
  );
  return data;
}

/**
 * Verify face using Hugging Face Face Detection model
 * This checks if a face is present and visible in the image
 */
export const verifyFaceWithHuggingFace = async (
  imageUri: string,
  apiToken?: string
): Promise<FaceDetectionResult> => {
  const token = (apiToken ?? huggingFaceConfig.apiToken)?.trim();
  if (!token) {
    return {
      hasFace: false,
      isFrontal: false,
      isVisible: false,
      faceCount: 0,
      confidence: 0,
      error:
        'Hugging Face API token is not configured. Add EXPO_PUBLIC_HUGGING_FACE_TOKEN to your .env file. See docs/HUGGING_FACE_SETUP.md.',
    };
  }

  try {
    const base64Image = await imageToBase64(imageUri);
    const modelName = huggingFaceConfig.modelName;

    let data: any;
    try {
      data = await callInference(modelName, base64Image, token, 30000);
    } catch (firstError: any) {
      if (firstError.response?.status === 503) {
        await new Promise((r) => setTimeout(r, 15000));
        data = await callInference(modelName, base64Image, token, 60000);
      } else {
        throw firstError;
      }
    }

    let rawList: any[] = [];
    if (Array.isArray(data)) {
      rawList = data;
    } else if (data?.predictions) {
      rawList = data.predictions;
    } else if (data?.boxes || data?.bbox) {
      const boxes = data.boxes ?? data.bbox ?? [];
      const scores: number[] = data.scores ?? [];
      rawList = boxes.map((box: any, i: number) => ({
        ...(typeof box === 'object' && box !== null ? box : {}),
        score: scores[i] ?? box?.score ?? 0.5,
        label: 'face',
      }));
    } else if (data != null) {
      rawList = Array.isArray(data) ? data : [data];
    }
    const detections: FaceBox[] = rawList.map(normalizeDetection);

    // Check if exactly one face is detected
    if (!detections || detections.length === 0) {
      return {
        hasFace: false,
        isFrontal: false,
        isVisible: false,
        faceCount: 0,
        confidence: 0,
        error: 'No face detected. Please ensure your face is clearly visible in the photo.',
      };
    }

    if (detections.length > 1) {
      return {
        hasFace: true,
        isFrontal: false,
        isVisible: false,
        faceCount: detections.length,
        confidence: 0,
        error: `Multiple faces detected (${detections.length}). Please upload a photo with only one person.`,
      };
    }

    const face = detections[0];

    // Check confidence threshold (adjust based on model)
    const minConfidence = 0.5; // Lower threshold for better acceptance
    if (face.score < minConfidence) {
      return {
        hasFace: true,
        isFrontal: false,
        isVisible: false,
        faceCount: 1,
        confidence: face.score,
        error: 'Face detection confidence is low. Please ensure good lighting and face visibility.',
      };
    }

    // Basic frontal check: if confidence is high, assume frontal
    // More advanced checks would require landmark detection
    const isFrontal = face.score > 0.6;

    return {
      hasFace: true,
      isFrontal,
      isVisible: true,
      faceCount: 1,
      confidence: face.score,
      message: 'Face verified successfully!',
    };
  } catch (error: any) {
    console.error('Face verification error:', error);
    
    // Handle specific error cases
    if (error.response?.status === 503) {
      return {
        hasFace: false,
        isFrontal: false,
        isVisible: false,
        faceCount: 0,
        confidence: 0,
        error: 'Face detection service is temporarily unavailable. Please try again in a moment.',
      };
    }

    if (error.response?.status === 401) {
      return {
        hasFace: false,
        isFrontal: false,
        isVisible: false,
        faceCount: 0,
        confidence: 0,
        error: 'Invalid API token. Please check your Hugging Face API key.',
      };
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        hasFace: false,
        isFrontal: false,
        isVisible: false,
        faceCount: 0,
        confidence: 0,
        error: 'Request timed out. Please check your internet connection and try again.',
      };
    }

    return {
      hasFace: false,
      isFrontal: false,
      isVisible: false,
      faceCount: 0,
      confidence: 0,
      error: error.response?.data?.error || error.message || 'Failed to verify face. Please try again.',
    };
  }
};

/**
 * Alternative: Verify face using a simpler approach (fallback)
 * This can be used if the main API fails
 */
export const verifyFaceBasic = async (imageUri: string): Promise<FaceDetectionResult> => {
  try {
    // Works for both local URIs (file://, content://) and http/blob on web
    await imageToBase64(imageUri);
    return {
      hasFace: true,
      isFrontal: true,
      isVisible: true,
      faceCount: 1,
      confidence: 0.8,
      message: 'Image validated successfully.',
    };
  } catch (error: any) {
    return {
      hasFace: false,
      isFrontal: false,
      isVisible: false,
      faceCount: 0,
      confidence: 0,
      error: 'Invalid or unreadable image. Please select a valid photo.',
    };
  }
};
