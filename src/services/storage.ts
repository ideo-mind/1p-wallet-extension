// Type-safe Chrome Storage Service

import { StorageSchema } from '@/types/storage';

export class TypedStorage {
  async get<K extends keyof StorageSchema>(
    keys: K[]
  ): Promise<Partial<Pick<StorageSchema, K>>> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result as Partial<Pick<StorageSchema, K>>);
        }
      });
    });
  }

  async set<K extends keyof StorageSchema>(
    items: Partial<Pick<StorageSchema, K>>
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(items, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  async remove(keys: (keyof StorageSchema)[]): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(keys as string[], () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.clear(() => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  onChange(
    callback: (changes: {
      [K in keyof StorageSchema]?: chrome.storage.StorageChange;
    }) => void
  ): void {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        callback(changes);
      }
    });
  }
}

export const storage = new TypedStorage();

