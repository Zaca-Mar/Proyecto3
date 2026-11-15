import { useMemo, useState } from 'react';
import { api, mensajeDeError } from '../../api/cliente';
import type { Ejercicio } from '../../dominio/modelos';
import { crearEjercicioSchema } from '../../esquemas/ejercicio.schema';

interface Props {
  ejercicios: Ejercicio[];
  onRecargar: () => Promise<void> | void;
}

const VACIO = { nombre: '', grupoMuscular: '', videoUrl: '', zonas: '' };

export default function CatalogoPage({ ejercicios, onRecargar }: Props) {
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [guardando, setGuardando] = useState(false);
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

  async function crear() {
    setError('');
    setExito('');
    const validado = crearEjercicioSchema.safeParse(form);
    if (!validado.success) {
      return setError(validado.error.issues[0].message);
    }

    setGuardando(true);
    try {
      const zonas = validado.data.zonas
        .split(',')
        .map((z) => z.trim())
        .filter(Boolean);

      await api<Ejercicio>('/ejercicios', {
        method: 'POST',
        body: {
          nombre: validado.data.nombre,
          grupoMuscular: validado.data.grupoMuscular,
          videoUrl: validado.data.videoUrl || undefined,
          zonas,
          incremento: 2.5,
        },
      });

      setExito(`“${validado.data.nombre}” agregado al catálogo.`);
      setForm(VACIO);
      await onRecargar();
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="pagina catalogo-pagina">
      <div className="catalogo-grid">
        <section className="card">
          <div className="fila">
            <h2>Biblioteca</h2>
            <span className="pill">{filtrados.length} ejercicios</span>
          </div>

          <div className="buscador filtros-fila">
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre…"
            />
            <select value={grupo} onChange={(e) => setGrupo(e.target.value)}>
              <option value="">Todos los grupos</option>
              {grupos.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="tabla-scroll catalogo-tabla">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Ejercicio</th>
                  <th>Grupo</th>
                  <th>Zonas</th>
                  <th>Video</th>
                  <th>Incremento</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <b>{e.nombre}</b>
                    </td>
                    <td>{e.grupoMuscular}</td>
                    <td>
                      <div className="zonas">
                        {(e.zonas ?? []).map((z) => (
                          <span className="pill mini-pill" key={z}>
                            {z}
                          </span>
                        ))}
                        {(e.zonas ?? []).length === 0 && <span className="mu">—</span>}
                      </div>
                    </td>
                    <td>{e.videoUrl ? 'Sí' : '—'}</td>
                    <td>{e.incremento} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <h2>Agregar ejercicio</h2>
          <p className="mu">
            Aparece al instante en la biblioteca del planificador para todos los entrenadores.
          </p>
          <label>
            Nombre
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </label>
          <label>
            Grupo muscular
            <input
              value={form.grupoMuscular}
              onChange={(e) => setForm({ ...form, grupoMuscular: e.target.value })}
              placeholder="Ej.: Pecho, Espalda, Piernas, Hombros, Brazos, Core, Movilidad"
            />
          </label>
          <label>
            Link de video (opcional)
            <input
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              placeholder="https://..."
              inputMode="url"
            />
          </label>
          <label>
            Zonas relacionadas (separadas por coma)
            <input
              value={form.zonas}
              onChange={(e) => setForm({ ...form, zonas: e.target.value })}
              placeholder="hombro, codo"
            />
          </label>
          {error && <div className="aviso">⚑ {error}</div>}
          {exito && <div className="exito">✓ {exito}</div>}
          <button className="btn" onClick={crear} disabled={guardando} type="button">
            {guardando ? 'Guardando…' : 'Agregar al catálogo'}
          </button>
        </section>
      </div>
    </div>
  );
}
