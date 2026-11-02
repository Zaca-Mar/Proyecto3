/** Cliente mínimo del backend. Guarda el token en localStorage y traduce los errores a mensajes legibles. */
export async function api<T>(
  ruta: string,
  opciones: { method?: string; body?: unknown } = {},
): Promise<T> {
  const token = localStorage.getItem('token');
  const res = await fetch('/api' + ruta, {
    method: opciones.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: opciones.body ? JSON.stringify(opciones.body) : undefined,
  });

  const datos = await res.json().catch(() => null);
  if (!res.ok) {
    const mensaje = datos?.message;
    throw new Error(
      Array.isArray(mensaje)
        ? [...new Set<string>(mensaje)].join('. ')
        : mensaje ?? 'Algo salió mal. Probá de nuevo.',
    );
  }
  return datos as T;
}

export const mensajeDeError = (error: unknown) =>
  error instanceof Error ? error.message : 'Algo salió mal. Probá de nuevo.';
