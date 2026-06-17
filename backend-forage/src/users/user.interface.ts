export interface User {
  id: number;
  username: string;
  password: string;
  role: Role;
  created_at: string;
}

export enum Role {
  ADMIN = 'admin',
  EDITOR = 'editor',
  USER = 'user',
  COMMERCIAL = 'commercial',
}