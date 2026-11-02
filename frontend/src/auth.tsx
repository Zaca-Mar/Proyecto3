import { createContext, useContext, useState, type ReactNode } from 'react';
import { api } from './api';
import type { RegistroDatos, Usuario } from './tipos';

interface Ctx {
  usuario: Usuario | null;
  ingresar: (email: string, password: string) => Promise<void>;
  registrar: (datos: RegistroDatos) => Promise<void>;
  salir: () => void;
}

const AuthCtx = createContext<Ctx>(null!);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('usuario') ?? 'null');
    } catch {
      return null;
    }
  });

  async function ingresar(email: string, password: string) {
    const respuesta = await api<{ token: string; usuario: Usuario }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    localStorage.setItem('token', respuesta.token);
    localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));
    setUsuario(respuesta.usuario);
  }

  async function registrar(datos: RegistroDatos) {
    await api<Usuario>('/auth/registro', { method: 'POST', body: datos });
    await ingresar(datos.email, datos.password);
  }

  function salir() {
    localStorage.clear();
    setUsuario(null);
  }

  return (
    <AuthCtx.Provider value={{ usuario, ingresar, registrar, salir }}>
      {children}
    </AuthCtx.Provider>
  );
}
