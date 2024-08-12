/* eslint-disable */

export const Config = Object.freeze({
  NODE_ENV: process.env.NODE_ENV || 'development',
  RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY || '',
  FIREBASE_APPCHECK_DEBUG_TOKEN: process.env.FIREBASE_APPCHECK_DEBUG || '',
  FIREBASE_API_SITE_KEY: process.env.FIREBASE_API_SITE_KEY || '',
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || '',
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || '',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || '',
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || '',
})
