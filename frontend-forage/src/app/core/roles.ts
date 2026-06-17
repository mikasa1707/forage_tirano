export const ROLES = ['admin', 'editor', 'user', 'commercial'] as const;

export type Role = typeof ROLES[number];