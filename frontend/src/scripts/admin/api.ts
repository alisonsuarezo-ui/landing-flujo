import { API_BASE } from '../../data/content';

/**
 * Cliente de la API del panel. Guarda el JWT en sessionStorage (se borra al
 * cerrar la pestaña) y lo envía como «Authorization: Bearer» en cada petición.
 */

const TOKEN_KEY = 'aia:admin-token';
const ADMIN_KEY = 'aia:admin-info';

export type Lead = {
  id: number;
  nombre: string;
  correo: string;
  telefono: string | null;
  programaInteres: string;
  programaNombre: string;
  estado: string;
  fechaRegistro: string;
  fechaActualizacion: string;
};

export type Seguimiento = {
  id: number;
  leadId: number;
  tipo: 'REGISTRO' | 'CAMBIO_ESTADO' | 'NOTA';
  nota: string | null;
  estadoAnterior: string | null;
  estadoNuevo: string | null;
  fecha: string;
  responsable: string;
};

export type Page<T> = { content: T[]; page: number; size: number; totalElements: number; totalPages: number };

export type Metrics = {
  total: number;
  nuevos: number;
  contactados: number;
  interesados: number;
  inscritos: number;
  descartados: number;
  registrosUltimos7Dias: number;
  tasaConversion: number;
  porEstado: Record<string, number>;
  porPrograma: { programa: string; nombre: string; total: number }[];
  registrosPorDia: { fecha: string; total: number }[];
};

export type AdminInfo = { correo: string; nombre: string };

export type Admin = { id: number; correo: string; nombre: string; activo: boolean; fechaCreacion: string };

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors: Record<string, string> = {},
  ) {
    super(message);
  }
}

const session = {
  get: (k: string) => {
    try {
      return sessionStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      sessionStorage.setItem(k, v);
    } catch {
      /* sin almacenamiento */
    }
  },
  del: (k: string) => {
    try {
      sessionStorage.removeItem(k);
    } catch {
      /* sin almacenamiento */
    }
  },
};

export const auth = {
  token: () => session.get(TOKEN_KEY),
  admin: (): AdminInfo | null => {
    try {
      return JSON.parse(session.get(ADMIN_KEY) ?? 'null');
    } catch {
      return null;
    }
  },
  save(token: string, admin: AdminInfo) {
    session.set(TOKEN_KEY, token);
    session.set(ADMIN_KEY, JSON.stringify(admin));
  },
  clear() {
    session.del(TOKEN_KEY);
    session.del(ADMIN_KEY);
  },
};

/** Se dispara cuando el backend responde 401 (sesión vencida o token inválido). */
export const SESSION_EXPIRED = 'aia:session-expired';

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = auth.token();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.');
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token) document.dispatchEvent(new CustomEvent(SESSION_EXPIRED));
    throw new ApiError(res.status, data?.message ?? `Error ${res.status}`, data?.fieldErrors ?? {});
  }
  return data as T;
}

export const api = {
  login: (correo: string, password: string) =>
    request<{ token: string; expiraEn: string; admin: AdminInfo }>('POST', '/api/auth/login', { correo, password }),
  me: () => request<AdminInfo>('GET', '/api/auth/me'),
  metrics: () => request<Metrics>('GET', '/api/dashboard/metrics'),
  leads: (params: Record<string, string | number>) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== '' && v !== undefined && qs.set(k, String(v)));
    return request<Page<Lead>>('GET', `/api/leads?${qs}`);
  },
  lead: (id: number) => request<Lead>('GET', `/api/leads/${id}`),
  update: (id: number, body: Pick<Lead, 'nombre' | 'correo' | 'telefono' | 'programaInteres'>) =>
    request<Lead>('PUT', `/api/leads/${id}`, body),
  status: (id: number, estado: string, nota: string) =>
    request<Lead>('PATCH', `/api/leads/${id}/status`, { estado, nota: nota || null }),
  note: (id: number, nota: string) => request<Seguimiento>('POST', `/api/leads/${id}/notes`, { nota }),
  history: (id: number) => request<Seguimiento[]>('GET', `/api/leads/${id}/history`),
  admins: () => request<Admin[]>('GET', '/api/admins'),
  createAdmin: (body: { nombre: string; correo: string; password: string }) => request<Admin>('POST', '/api/admins', body),
};
