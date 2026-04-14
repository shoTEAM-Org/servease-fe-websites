const AUTH_STORAGE_KEY = "servease.isAuthenticated";

export function isUserAuthenticated() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(AUTH_STORAGE_KEY) === "true";
}

export function setUserAuthenticated(value: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  if (value) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, "true");
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
