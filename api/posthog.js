import { PostHog } from 'posthog-node';

let _client;

export function getPostHogClient() {
  if (!_client) {
    _client = new PostHog(process.env.POSTHOG_API_KEY, {
      host: process.env.POSTHOG_HOST,
    });
  }
  return _client;
}
