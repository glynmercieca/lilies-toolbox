import { Injectable } from '@angular/core';

import { APP_SETTINGS } from './app-settings';
import { normalizeImageUrl } from './image-url.util';

interface ImgbbUploadResponse {
  data?: {
    image?: {
      url?: string;
    };
    medium?: {
      url?: string;
    };
    thumb?: {
      url?: string;
    };
    url?: string;
  };
  error?: {
    message?: string;
  };
  success?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  async uploadImage(file: File | null): Promise<string> {
    if (!file) {
      return '';
    }

    const apiKey = APP_SETTINGS.imgbbApiKey.trim();
    if (!apiKey) {
      throw new Error('ImgBB is not configured. Add an API key in app settings.');
    }

    return this.uploadToImgbb(apiKey, file);
  }

  private async uploadToImgbb(apiKey: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', file.name || `tool-image-${Date.now()}`);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      body: formData,
    });

    const payload = (await response.json().catch(() => null)) as ImgbbUploadResponse | null;

    if (!response.ok || !payload?.success) {
      throw new Error(payload?.error?.message || 'ImgBB image upload failed.');
    }

    const imageUrl =
      payload.data?.image?.url ||
      payload.data?.medium?.url ||
      payload.data?.thumb?.url ||
      payload.data?.url;

    if (!imageUrl) {
      throw new Error('ImgBB did not return an image URL.');
    }

    return normalizeImageUrl(imageUrl);
  }
}
