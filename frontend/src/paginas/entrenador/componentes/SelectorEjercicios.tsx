import { useMemo, useState } from 'react';
import type { Ejercicio } from '../../../tipos';

interface Props {
  ejercicios: Ejercicio[];
  idsConMolestia: Set<number>;
  onAgregar: (ejercicio: Ejercicio) => void;
}

export default function SelectorEjercicios({ ejercicios, idsConMolestia, onAgregar }: Props) {
  const [busqueda, setBusqueda] = useState('');
  const [grupo, setGrupo] = useState('');

  const grupos = useMemo(
    () => [...new Set(ejercicios.map((e) => e.grupoMuscular))].sort(),
    [ejercicios],
  );

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return ejercicios.filter((e) => {
      const coincideTexto = !q || e.nombre.toLowerCase().includes(q);
      const coincideGrupo = !grupo || e.grupoMuscular === grupo;
      return coincideTexto && coincideGrupo;
    });
  }, [ejercicios, busqueda, grupo]);

  return (
    <div className="card selector-ejercicios">
      <div className="fila">
        <h2>Biblioteca de ejercicios</h2>
        <span className="pill">{filtrados.length} disponibles</span>
      </div>
      <p className="mu">Buscá y tocá un ejercicio para sumarlo al día activo.</p>

      <div className="buscador">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre… (press banca, sentadilla…)"
        />
        <select value={grupo} onChange={(e) => setGrupo(e.target.value)}>
          <option value="">Todos los grupos</option>
          {grupos.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className="lista-ejercicios">
        {filtrados.map((e) => {
          const alerta = idsConMolestia.has(e.id);
          return (
            <button
              className={`ejercicio-opcion ${alerta ? 'con-alerta' : ''}`}
              key={e.id}
              onClick={() => onAgregar(e)}
              type="button"
            >
              <span className="crece">
                <b>{e.nombre}</b>
                <span className="mu">{e.grupoMuscular}</span>
                {e.zonas.length > 0 && (
                  <span className="zonas">
                    {e.zonas.map((z) => (
                      <span className="pill mini-pill" key={z}>{z}</span>
                    ))}
                  </span>
                )}
              </span>
              {alerta && <span className="pill a">⚑ Molestia</span>}
              <span className="mas">＋</span>
            </button>
          );
        })}
        {filtrados.length === 0 && <p className="mu">No hay ejercicios con ese filtro.</p>}
      </div>
    </div>
  );
}
