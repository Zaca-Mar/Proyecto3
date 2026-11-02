import { useState } from 'react';
import { useAuth } from '../../auth';
import type { Sesion } from '../../tipos';
import Gym from './Gym';
import Historial from './Historial';
import Hoy from './Hoy';
import Progreso from './Progreso';
import ResumenSesion from './ResumenSesion';

type Tab = 'hoy' | 'historial' | 'progreso';
type Modo = 'app' | 'gym' | 'resumen';

const TABS: { id: Tab; icono: string; titulo: string }[] = [
  { id: 'hoy', icono: '◉', titulo: 'Hoy' },
  { id: 'historial', icono: '☰', titulo: 'Historial' },
  { id: 'progreso', icono: '↗', titulo: 'Progreso' },
];

export default function AlumnoApp() {
  const { usuario, salir } = useAuth();
  const [tab, setTab] = useState<Tab>('hoy');
  const [modo, setModo] = useState<Modo>('app');
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [version, setVersion] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);

  function entrarAlGym(nueva: Sesion) {
    setSesion(nueva);
    setModo('gym');
    setMenuAbierto(false);
  }

  function volverDeGym() {
    setModo('app');
    setTab('hoy');
    setVersion((v) => v + 1);
  }

  function terminarSesion() {
    setSesion(null);
    setModo('resumen');
  }

  function volverAlInicio() {
    setModo('app');
    setTab('hoy');
    setVersion((v) => v + 1);
  }

  if (modo === 'gym' && sesion) {
    return <Gym sesion={sesion} terminado={terminarSesion} salir={volverDeGym} />;
  }

  if (modo === 'resumen') {
    return <ResumenSesion volver={volverAlInicio} />;
  }

  return (
    <div className="movil">
      <header className="topbar-movil">
        <div className="marca">⌁ FitTracker</div>
        <div className="menu-contenedor">
          <button
            className="avatar chico-avatar"
            onClick={() => setMenuAbierto((v) => !v)}
            aria-label="Menú de usuario"
            type="button"
          >
            {usuario!.nombre[0]}
            {usuario!.apellido[0]}
          </button>
          {menuAbierto && (
            <div className="menu-usuario">
              <b>
                {usuario!.nombre} {usuario!.apellido}
              </b>
              <div className="mu">{usuario!.email}</div>
              <div className="mu">Rol: alumno</div>
              <button className="btn sec chico" onClick={salir} type="button">
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="movil-contenido">
        {tab === 'hoy' && <Hoy key={version} onEntrar={entrarAlGym} />}
        {tab === 'historial' && <Historial />}
        {tab === 'progreso' && <Progreso />}
      </main>

      <nav className="nav-inferior">
        {TABS.map((item) => (
          <button
            key={item.id}
            className={tab === item.id ? 'on' : ''}
            onClick={() => {
              setTab(item.id);
              setMenuAbierto(false);
            }}
            type="button"
          >
            <span className="nav-icono">{item.icono}</span>
            <span>{item.titulo}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
