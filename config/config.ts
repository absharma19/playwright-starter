import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  AppSettings: {
    baseUrl: process.env.BASE_URL ?? 'https://example.com',
  },
  TimeOuts: {
    long: parseInt(process.env.TIMEOUT_LONG ?? '60000'),
    medium: parseInt(process.env.TIMEOUT_MEDIUM ?? '30000'),
    short: parseInt(process.env.TIMEOUT_SHORT ?? '5000'),
  },
} as const;
