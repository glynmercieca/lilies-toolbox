import { applyAppSettings, AppSettings, DEFAULT_APP_SETTINGS } from './app-settings';

const CONFIG_URL = '/app-config.json';

export async function loadAppSettings(): Promise<void> {
  try {
    const response = await fetch(CONFIG_URL, {
      cache: 'no-store',
    });

    if (!response.ok) {
      applyAppSettings(DEFAULT_APP_SETTINGS);
      return;
    }

    const overrides = (await response.json()) as Partial<AppSettings>;
    applyAppSettings(overrides);
  } catch {
    applyAppSettings(DEFAULT_APP_SETTINGS);
  }
}
