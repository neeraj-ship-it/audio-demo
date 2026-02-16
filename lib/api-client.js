/**
 * Lightweight API client wrapper for AudioFlix.
 * Provides automatic JSON parsing, error handling, retry logic,
 * timeout support, and convenience methods for common HTTP verbs.
 *
 * No external dependencies.
 */

// ---------------------------------------------------------------------------
// ApiError
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  /**
   * @param {string}  message  Human-readable error description.
   * @param {number}  status   HTTP status code (0 for network errors).
   * @param {*}       data     Parsed response body, if available.
   */
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_TIMEOUT_MS = 10_000;
const RETRY_DELAY_MS = 1_000;
const MAX_RETRIES = 1;

/**
 * Returns true when the request is eligible for an automatic retry.
 * Network failures (TypeError from fetch) and 5xx server errors qualify.
 */
function isRetryable(error) {
  if (error instanceof TypeError) return true; // network / DNS / CORS errors
  if (error instanceof ApiError && error.status >= 500) return true;
  return false;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

/**
 * Performs a fetch request with automatic JSON handling, timeout, and retry.
 *
 * @param {string} url     Request URL (absolute or relative).
 * @param {object} [opts]  Options forwarded to fetch, plus extras:
 * @param {string} [opts.method]    HTTP method (default "GET").
 * @param {*}      [opts.body]      Request body – objects are JSON-stringified.
 * @param {object} [opts.headers]   Additional headers.
 * @param {string} [opts.userId]    Attached as `x-user-id` header when set.
 * @param {number} [opts.timeout]   Per-attempt timeout in ms (default 10 000).
 * @param {number} [opts.retries]   Max retries on retryable errors (default 1).
 * @returns {Promise<*>} Parsed JSON response body.
 */
export async function apiFetch(url, opts = {}) {
  const {
    userId,
    timeout = DEFAULT_TIMEOUT_MS,
    retries = MAX_RETRIES,
    headers: extraHeaders,
    body,
    ...restOpts
  } = opts;

  const method = (restOpts.method || 'GET').toUpperCase();

  // ---- Build headers ----
  const headers = { ...extraHeaders };

  if (userId) {
    headers['x-user-id'] = userId;
  }

  // Auto-set Content-Type for mutating verbs when body is a plain object.
  if (['POST', 'PUT', 'DELETE'].includes(method) && body !== undefined) {
    if (!headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json';
    }
  }

  // ---- Build fetch options ----
  const fetchOpts = {
    ...restOpts,
    method,
    headers,
  };

  if (body !== undefined) {
    fetchOpts.body =
      typeof body === 'string' ? body : JSON.stringify(body);
  }

  // ---- Execute with retry ----
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    // Wait before retrying (skip delay on first attempt).
    if (attempt > 0) {
      await sleep(RETRY_DELAY_MS);
    }

    try {
      // Timeout via AbortController ---
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      fetchOpts.signal = controller.signal;

      const response = await fetch(url, fetchOpts);

      clearTimeout(timer);

      // ---- Parse response ----
      let data;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        // Attempt loose JSON parse for APIs that forget Content-Type.
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }

      // ---- Handle non-2xx ----
      if (!response.ok) {
        const message =
          (data && (data.error || data.message)) ||
          `Request failed with status ${response.status}`;
        throw new ApiError(message, response.status, data);
      }

      return data;
    } catch (error) {
      lastError = error;

      // Convert abort signal into a friendlier timeout error.
      if (error.name === 'AbortError') {
        lastError = new ApiError(
          `Request timed out after ${timeout}ms`,
          0,
          null,
        );
      }

      // Only retry when the error is retryable and we have attempts left.
      if (!isRetryable(lastError) || attempt >= retries) {
        throw lastError;
      }
    }
  }

  // Should never reach here, but just in case.
  throw lastError;
}

// ---------------------------------------------------------------------------
// Convenience methods
// ---------------------------------------------------------------------------

export const api = {
  /**
   * @param {string} url
   * @param {object} [opts]
   */
  get(url, opts) {
    return apiFetch(url, { ...opts, method: 'GET' });
  },

  /**
   * @param {string} url
   * @param {*}      body
   * @param {object} [opts]
   */
  post(url, body, opts) {
    return apiFetch(url, { ...opts, method: 'POST', body });
  },

  /**
   * @param {string} url
   * @param {*}      body
   * @param {object} [opts]
   */
  put(url, body, opts) {
    return apiFetch(url, { ...opts, method: 'PUT', body });
  },

  /**
   * @param {string} url
   * @param {*}      body
   * @param {object} [opts]
   */
  del(url, body, opts) {
    return apiFetch(url, { ...opts, method: 'DELETE', body });
  },
};
