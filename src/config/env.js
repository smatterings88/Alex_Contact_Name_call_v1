import { exit } from 'process';

const requiredEnvVars = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
  'ULTRAVOX_API_KEY',
  'GHL_API_KEY',
  'GHL_LOCATION_ID'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  exit(1);
}

export const config = {
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER
  },
  ghl: {
    apiKey: process.env.GHL_API_KEY,
    locationId: process.env.GHL_LOCATION_ID,
    apiUrl: 'https://rest.gohighlevel.com/v1'
  },
  ultravox: {
    apiKey: process.env.ULTRAVOX_API_KEY
  },
  server: {
    port: process.env.PORT || 10000
  }
};