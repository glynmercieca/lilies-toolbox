export interface AppSettings {
  appName: string;
  version: string;
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseProjectId: string;
  firebaseStorageBucket: string;
  firebaseMessagingSenderId: string;
  firebaseAppId: string;
  firebaseMeasurementId: string;
  imgbbApiKey: string;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  appName: 'Lilies Shed',
  version: '1.0.1',
  firebaseApiKey: '',
  firebaseAuthDomain: '',
  firebaseProjectId: '',
  firebaseStorageBucket: '',
  firebaseMessagingSenderId: '',
  firebaseAppId: '',
  firebaseMeasurementId: '',
  imgbbApiKey: '86d672f1de34b21c4f8c2d32ac97b76e',
};

export const APP_SETTINGS: AppSettings = { ...DEFAULT_APP_SETTINGS };

export function applyAppSettings(overrides: Partial<AppSettings>): void {
  Object.assign(APP_SETTINGS, {
    ...DEFAULT_APP_SETTINGS,
    ...overrides,
  });
}
