let accessToken = null;
let refreshPromise = null;
let onSessionExpired = () => {};

export class ApiError extends Error {
  constructor(status, message, fields = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export function setAccessToken(token) {
  accessToken = token;
}

export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler;
}

function send(path, { method = "GET", body } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  return fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/auth/refresh", { method: "POST" })
      .then(async (res) => {
        if (!res.ok) {
          accessToken = null;
          return null;
        }
        const data = await res.json();
        accessToken = data.accessToken;
        return accessToken;
      })
      .catch(() => {
        accessToken = null;
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

const NO_AUTO_REFRESH = ["/auth/login", "/auth/signup", "/auth/refresh"];

export async function api(path, options = {}) {
  let res = await send(path, options);

  if (res.status === 401 && !NO_AUTO_REFRESH.includes(path)) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      onSessionExpired();
      throw new ApiError(401, "Session expired. Please log in again.");
    }
    res = await send(path, options);
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.error || "Something went wrong",
      data?.fields || {},
    );
  }
  return data;
}
