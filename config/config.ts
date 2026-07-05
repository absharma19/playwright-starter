import * as dotenv from 'dotenv';
dotenv.config({ quiet: true });

export const config = {
  AppSettings: {
    baseUrl: process.env.BASE_URL ?? 'https://example.com',
    apiBaseUrl: process.env.API_BASE_URL ?? process.env.BASE_URL ?? 'https://example.com',
  },
  Credentials: {
    username: process.env.APP_USERNAME ?? '',
    password: process.env.APP_PASSWORD ?? '',
  },
  TimeOuts: {
    long: parseInt(process.env.TIMEOUT_LONG ?? '60000'),
    medium: parseInt(process.env.TIMEOUT_MEDIUM ?? '30000'),
    short: parseInt(process.env.TIMEOUT_SHORT ?? '5000'),
  },
} as const;
