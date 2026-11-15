const colas = new Map<string, Promise<void>>();

/**
 * Serializa tareas que comparten una clave (por ejemplo, asignar planes del
 * mismo alumno) para que no se pisen entre sí dentro de una instancia.
 */
export async function conClave<T>(clave: string, tarea: () => Promise<T>): Promise<T> {
  const previa = colas.get(clave) ?? Promise.resolve();
  let liberar!: () => void;
  const turno = new Promise<void>((resolve) => {
    liberar = resolve;
  });
  const actual = previa.then(() => turno);
  colas.set(clave, actual);

  await previa;
  try {
    return await tarea();
  } finally {
    liberar();
    actual.then(() => {
      if (colas.get(clave) === actual) colas.delete(clave);
    });
  }
}
