import { APIRequestContext, APIResponse } from '@playwright/test';
import { config } from '../../config/config';

/**
 * ApiClient — a thin wrapper over Playwright's `request` fixture for seeding and
 * cleaning up test data via the API instead of slow, flaky UI flows.
 *
 * Prefer this over driving the UI for setup/teardown. Wire real endpoints as the
 * application exposes them; the methods below are the intended shape.
 *
 * Usage (from a step or hook):
 *   Before(async ({ api }) => { await api.get('/health'); });
 */
export class ApiClient {
  private readonly request: APIRequestContext;
  private readonly baseUrl: string;

  constructor(request: APIRequestContext) {
    this.request = request;
    this.baseUrl = config.AppSettings.apiBaseUrl;
  }

  private url(path: string): string {
    return path.startsWith('http') ? path : `${this.baseUrl}${path}`;
  }

  async get(path: string): Promise<APIResponse> {
    return this.request.get(this.url(path));
  }

  async post(path: string, data?: unknown): Promise<APIResponse> {
    return this.request.post(this.url(path), data === undefined ? undefined : { data });
  }

  async delete(path: string): Promise<APIResponse> {
    return this.request.delete(this.url(path));
  }
}
