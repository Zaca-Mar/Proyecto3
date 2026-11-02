import { useEffect, useState } from 'react';
import { api, mensajeDeError } from '../../api';
import { useAuth } from '../../auth';
import { fmt, type Sugerencia } from '../../tipos';

interface Props {
  volver: () => void;
}

export default function ResumenSesion({ volver }: Props) {
  const { usuario } = useAuth();
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api<Sugerencia[]>('/sugerencias')
      .then((lista) => setSugerencias(lista.filter((s) => s.estado === 'pendiente' || s.estado === 'aprobada')))
      .catch((e) => setError(mensajeDeError(e)))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="pantalla pantalla-alumno">
      <div className="avatar avatar-gr exito-avatar">✓</div>
      <div className="mu">Sesión cerrada</div>
      <h1>Buen trabajo, {usuario!.nombre}.</h1>
      <p className="mu">Estas son tus sugerencias de carga para la próxima vez.</p>

      {error && <div className="aviso">⚑ {error}</div>}
      {cargando && <p className="mu">Buscando sugerencias…</p>}

      {!cargando && sugerencias.length === 0 && (
        <section className="card">
          <h2>Sin cambios por ahora</h2>
          <p className="mu">
            La progresión no propuso cambios todavía. Seguí registrando tus series con RPE para que
            haya más información.
          </p>
        </section>
      )}

      {sugerencias.slice(0, 6).map((s) => (
        <article key={s.id} className={`card ${s.aviso ? 'mol' : s.accion === 'subir' ? 'hl' : ''}`}>
          <div className="fila">
            <h2 className={s.aviso ? 'ambar' : ''}>{s.ejercicioNombre}</h2>
            <span className={`pill ${s.estado === 'aprobada' ? 'l' : ''}`}>
              {s.estado === 'aprobada' ? 'Aprobada' : 'Pendiente'}
            </span>
          </div>
          <div className="eyebrow">Próxima vez</div>
          <div className="grande">{fmt(s.carga)} kg</div>
          <p>{s.explicacion}</p>
          {s.aviso && <div className="aviso">⚑ {s.aviso}</div>}
        </article>
      ))}

      <button className="btn" onClick={volver} type="button">
        Volver a hoy
      </button>
    </div>
  );
}
