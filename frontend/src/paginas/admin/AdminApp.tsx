import { useCallback, useEffect, useState } from 'react';
import { api, mensajeDeError } from '../../api';
import { useAuth } from '../../auth';
import type { RegistroDatos, Usuario } from '../../tipos';

const VACIO: RegistroDatos = {
  nombre: '',
  apellido: '',
  email: '',
  dni: '',
  telefono: '',
  password: '',
};

export default function AdminApp() {
  const { usuario, salir } = useAuth();
  const [entrenadores, setEntrenadores] = useState<Usuario[]>([]);
  const [form, setForm] = useState<RegistroDatos>(VACIO);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setEntrenadores(await api<Usuario[]>('/auth/entrenadores'));
  }, []);

  useEffect(() => {
    cargar().catch((e) => setError(mensajeDeError(e)));
  }, [cargar]);

  function campo<K extends keyof RegistroDatos>(clave: K, valor: RegistroDatos[K]) {
    setForm((actual) => ({ ...actual, [clave]: valor }));
  }

  async function crear() {
    setError('');
    setExito('');

    if (
      !form.nombre.trim() ||
      !form.apellido.trim() ||
      !form.email.trim() ||
      !form.dni.trim() ||
      !form.telefono.trim() ||
      !form.password
    ) {
      return setError('Completá todos los campos para dar de alta al entrenador.');
    }
    if (!/^\d{7,9}$/.test(form.dni.trim())) {
      return setError('El DNI debe tener entre 7 y 9 números.');
    }

    setGuardando(true);
    try {
      await api<Usuario>('/auth/entrenadores', {
        method: 'POST',
        body: {
          ...form,
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          email: form.email.trim(),
          dni: form.dni.trim(),
          telefono: form.telefono.trim(),
        },
      });
      setExito(`Entrenador ${form.nombre} ${form.apellido} creado con acceso a la app.`);
      setForm(VACIO);
      await cargar();
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="escritorio">
      <aside className="lateral">
        <div className="marca">⌁ FitTracker</div>
        <div className="lateral-perfil">
          <span className="avatar">{usuario!.nombre[0]}{usuario!.apellido[0]}</span>
          <div>
            <b>{usuario!.nombre} {usuario!.apellido}</b>
            <div className="mu">Administrador</div>
          </div>
        </div>
        <nav className="lateral-nav">
          <span className="on">🧑‍🏫 Entrenadores</span>
        </nav>
        <button className="btn sec chico" onClick={salir}>Cerrar sesión</button>
      </aside>

      <main className="contenido-escritorio">
        <header className="topbar">
          <div>
            <div className="eyebrow">Administración</div>
            <h1>Entrenadores del gimnasio</h1>
            <p className="mu">Creá cuentas con rol de entrenador y controlá quiénes tienen acceso.</p>
          </div>
        </header>

        {error && <div className="aviso">⚑ {error}</div>}
        {exito && <div className="exito">✓ {exito}</div>}

        <div className="rejilla-admin">
          <section className="card">
            <div className="fila">
              <h2>Alta de entrenador</h2>
              <span className="pill l">Rol: entrenador</span>
            </div>
            <div className="par">
              <label>Nombre<input value={form.nombre} onChange={(e) => campo('nombre', e.target.value)} /></label>
              <label>Apellido<input value={form.apellido} onChange={(e) => campo('apellido', e.target.value)} /></label>
            </div>
            <div className="par">
              <label>DNI<input value={form.dni} inputMode="numeric" onChange={(e) => campo('dni', e.target.value.replace(/\D/g, ''))} /></label>
              <label>Teléfono<input value={form.telefono} inputMode="tel" onChange={(e) => campo('telefono', e.target.value)} /></label>
            </div>
            <label>Email<input value={form.email} inputMode="email" onChange={(e) => campo('email', e.target.value)} /></label>
            <label>Contraseña inicial<input type="password" value={form.password} onChange={(e) => campo('password', e.target.value)} /></label>
            <button className="btn" onClick={crear} disabled={guardando}>
              {guardando ? 'Guardando…' : 'Crear entrenador'}
            </button>
          </section>

          <section className="card">
            <h2>Entrenadores activos · {entrenadores.length}</h2>
            {entrenadores.length === 0 && <p className="mu">Todavía no hay entrenadores registrados.</p>}
            <div className="lista-simple">
              {entrenadores.map((e) => (
                <div className="fila-item" key={e.id}>
                  <span className="avatar">{e.nombre[0]}{e.apellido[0]}</span>
                  <div className="crece">
                    <b>{e.nombre} {e.apellido}</b>
                    <div className="mu">{e.email} · DNI {e.dni}</div>
                  </div>
                  <span className="pill l">Entrenador</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
