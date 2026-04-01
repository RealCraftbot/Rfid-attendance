type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'PARENT' | 'BURSAR';

export const ROLE_LANDING_PAGES: Record<string, Role[]> = {
  '/login': ['SUPER_ADMIN', 'ADMIN'],
  '/login/teacher': ['TEACHER'],
  '/login/bursar': ['BURSAR'],
  '/login/parent': ['PARENT'],
};

export function isValidRoleForPage(userRole: string, pathname: string): boolean {
  const allowedRoles = ROLE_LANDING_PAGES[pathname];
  if (!allowedRoles) return true;
  return allowedRoles.includes(userRole as Role);
}

export function getRedirectPath(userRole: string): string {
  switch (userRole) {
    case 'SUPER_ADMIN':
      return '/super-admin';
    case 'ADMIN':
      return '/dashboard';
    case 'TEACHER':
      return '/dashboard';
    case 'BURSAR':
      return '/dashboard/bursar';
    case 'PARENT':
      return '/dashboard/parent';
    default:
      return '/dashboard';
  }
}
