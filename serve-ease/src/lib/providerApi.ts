const DEFAULT_API_BASE_URL = 'http://localhost:5000';

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
}

function extractErrorMessage(payload: unknown, status: number): string {
  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const body = payload as Record<string, unknown>;
    const message = body.message;

    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    if (Array.isArray(message)) {
      const joined = message.filter((entry): entry is string => typeof entry === 'string').join(', ');
      if (joined) {
        return joined;
      }
    }

    if (message && typeof message === 'object' && !Array.isArray(message)) {
      const nestedMessage = (message as Record<string, unknown>).message;
      if (typeof nestedMessage === 'string' && nestedMessage.trim()) {
        return nestedMessage;
      }
    }

    if (typeof body.error === 'string' && body.error.trim()) {
      return body.error;
    }
  }

  return `Request failed with status ${status}`;
}

export async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, init);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(extractErrorMessage(payload, response.status));
  }

  return payload as T;
}
