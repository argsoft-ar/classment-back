export enum RoleLevel {
  SUPER_ADMIN = "SuperAdmin",
  DIRECTIVO = "Directivo",
  DOCENTE = "Docente",
  ALUMNO = "Alumno",
}

export const ALL_ROLES: RoleLevel[] = [
  RoleLevel.SUPER_ADMIN,
  RoleLevel.DIRECTIVO,
  RoleLevel.DOCENTE,
  RoleLevel.ALUMNO,
];

/** Roles with administrative access to the academic domain. */
export const ADMIN_ROLES: RoleLevel[] = [
  RoleLevel.SUPER_ADMIN,
  RoleLevel.DIRECTIVO,
];

export type Permission =
  | "institution:read"
  | "institution:write"
  | "users:read"
  | "users:write"
  | "users:write-directivo"
  | "careers:read"
  | "careers:write"
  | "subjects:read"
  | "subjects:write"
  | "correlatives:read"
  | "correlatives:write"
  | "academic-records:read"
  | "academic-records:read-own"
  | "academic-records:write"
  | "periods:read"
  | "periods:write"
  | "offerings:read"
  | "offerings:read-assigned"
  | "offerings:write"
  | "enrollments:read"
  | "enrollments:write-own";

const DIRECTIVO_PERMISSIONS: Permission[] = [
  "institution:read",
  "users:read",
  "users:write",
  "careers:read",
  "careers:write",
  "subjects:read",
  "subjects:write",
  "correlatives:read",
  "correlatives:write",
  "academic-records:read",
  "academic-records:write",
  "periods:read",
  "periods:write",
  "offerings:read",
  "offerings:write",
  "enrollments:read",
];

export const ROLE_PERMISSIONS: Record<RoleLevel, Permission[]> = {
  [RoleLevel.SUPER_ADMIN]: [
    ...DIRECTIVO_PERMISSIONS,
    "institution:write",
    "users:write-directivo",
  ],
  [RoleLevel.DIRECTIVO]: DIRECTIVO_PERMISSIONS,
  [RoleLevel.DOCENTE]: [
    "institution:read",
    "careers:read",
    "subjects:read",
    "correlatives:read",
    "periods:read",
    "offerings:read-assigned",
  ],
  [RoleLevel.ALUMNO]: [
    "institution:read",
    "careers:read",
    "subjects:read",
    "correlatives:read",
    "academic-records:read-own",
    "periods:read",
    "offerings:read",
    "enrollments:write-own",
  ],
};

export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role as RoleLevel);
}
