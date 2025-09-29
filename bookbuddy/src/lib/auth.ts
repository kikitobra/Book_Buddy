export type AuthUser = { name: string; email: string };
const TOKEN_KEY = "bb_token";
const USER_KEY  = "bb_user";

export function saveSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function isAuthed(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}
export function getToken(): string | null {
  return localStorage.getItem("bb_token");
}
