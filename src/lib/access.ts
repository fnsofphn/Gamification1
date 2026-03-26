export type ViewerRole = 'manager' | 'learner';

export type ViewerAccess = {
  email: string;
  role: ViewerRole;
  displayName: string;
  unitName: string;
};

const ACCESS_KEY = 'vinabrain_viewer_access';
export const MANAGER_EMAIL = 'daotao@peopleone.com.vn';

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function resolveViewerRole(email: string): ViewerRole {
  return normalizeEmail(email) === MANAGER_EMAIL ? 'manager' : 'learner';
}

export function getViewerAccess(): ViewerAccess | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(ACCESS_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ViewerAccess;
    if (!parsed?.email || !parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setViewerAccess(params: {
  email: string;
  displayName: string;
  unitName?: string;
}) {
  if (typeof window === 'undefined') return null;

  const access = {
    email: normalizeEmail(params.email),
    role: resolveViewerRole(params.email),
    displayName: params.displayName.trim(),
    unitName: params.unitName?.trim() || '',
  } satisfies ViewerAccess;

  window.sessionStorage.setItem(ACCESS_KEY, JSON.stringify(access));
  return access;
}

export function clearViewerAccess() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(ACCESS_KEY);
}

export function getDefaultRoute(access: ViewerAccess | null) {
  return access?.role === 'manager' ? '/dashboard' : '/games';
}
