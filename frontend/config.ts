/* eslint-disable */

export const Config = Object.freeze({
  NODE_ENV: process.env.NODE_ENV || 'development',
  RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY || '',
  FIREBASE_APPCHECK_DEBUG_TOKEN: process.env.FIREBASE_APPCHECK_DEBUG || '',
})
