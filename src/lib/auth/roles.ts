export type UserRole = 'owner' | 'admin' | 'cashier';

export const roleHierarchy: Record<UserRole, number> = {
  owner: 3,
  admin: 2,
  cashier: 1,
};

export const permissions: Record<string, UserRole[]> = {
  // User management
  'user:create': ['owner', 'admin'],
  'user:update': ['owner', 'admin'], 
  'user:delete': ['owner'],
  'user:view': ['owner', 'admin', 'cashier'],
  
  // Product management
  'product:create': ['owner', 'admin'],
  'product:update': ['owner', 'admin'],
  'product:delete': ['owner', 'admin'],
  'product:view': ['owner', 'admin', 'cashier'],
  
  // Sales
  'sale:create': ['owner', 'admin', 'cashier'],
  'sale:update': ['owner', 'admin'],
  'sale:delete': ['owner'],
  'sale:view': ['owner', 'admin', 'cashier'],
  
  // Reports
  'report:view': ['owner', 'admin'],
  'report:export': ['owner', 'admin'],
  
  // Settings
  'settings:view': ['owner'],
  'settings:update': ['owner'],
};

export type Permission = keyof typeof permissions;

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  return permissions[permission].includes(userRole);
}

export function hasRoleOrHigher(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function canAccess(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}