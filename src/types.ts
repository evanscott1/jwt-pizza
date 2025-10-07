// src/types.ts
export enum Role {
  Admin = 'admin',
  Diner = 'diner',
  Franchisee = 'franchisee',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  roles: { role: Role }[];
}