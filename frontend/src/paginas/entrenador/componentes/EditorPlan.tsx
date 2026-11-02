import { useEffect, useMemo, useState } from 'react';
import { api, mensajeDeError } from '../../../api';
import type {
  Bloque,
  DiaDraft,
  Ejercicio,
  EjercicioDraft,
  Resumen,
} from '../../../tipos';
import { BLOQUES } from '../../../tipos';
import SelectorEjercicios from './SelectorEjercicios';

interface Props {
  alumnoId: number;
  resumen: Resumen | null;
  ejercicios: Ejercicio[];
  onGuardado: () => Promise<void> | void;
}

const clave = () => Math.random().toString(36).slice(2, 10);

function bloqueDeGrupo(grupo: string): Bloque {
  if (grupo === 'Movilidad') return 'movilidad';
  if (grupo === 'Zona media') return 'zona_media';
  return 'musculacion';
}

function nuevoDia(nombre: string): DiaDraft {
  return { key: clave(), nombre, ejercicios: [] };
}

export default function EditorPlan({ alumnoId, resumen, ejercicios, onGuardado }: Props) {
  const [nombre, setNombre] = useState('');
  const [dias, setDias] = useState<DiaDraft[]>([nuevoDia('Día A')]);
  const [diaActivo, setDiaActivo] = useState(0);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [advertencias, setAdvertencias] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setNombre('');
    setDias([nuevoDia('Día A')]);
    setDiaActivo(0);
    setError('');
    setExito('');
    setAdvertencias([]);
  }, [alumnoId]);

  const unreadPorEjercicio = useMemo(() => {
    const mapa = new Map<number, { zona: string; observacion: string }>();
    for (const m of resumen?.molestias ?? []) {
      if (!m.leida && !mapa.has(m.ejercicioId)) {
        mapa.set(m.ejercicioId, { zona: m.zona, observacion: m.observacion });
      }
    }
    return mapa;
  }, [resumen]);

  const idsConMolestia = useMemo(() => new Set(unreadPorEjercicio.keys()), [unreadPorEjercicio]);

  const dia = dias[Math.min(diaActivo, dias.length - 1)];

  function agregarEjercicio(ejercicio: Ejercicio) {
    if (!dia) return;
    if (dia.ejercicios.some((e) => e.ejercicioId === ejercicio.id)) {
      return setError(`“${ejercicio.nombre}” ya está en ${dia.nombre}.`);
    }
    setError('');
    const bloque = bloqueDeGrupo(ejercicio.grupoMuscular);
    const musculacion = bloque === 'musculacion';
    const nuevo: EjercicioDraft = {
      key: clave(),
      ejercicioId: ejercicio.id,
      nombre: ejercicio.nombre,
      grupoMuscular: ejercicio.grupoMuscular,
      bloque,
      series: musculacion ? 3 : 2,
      repMin: musculacion ? 8 : 10,
      repMax: musculacion ? 12 : 10,
      cargaObjetivo: 0,
      descanso: musculacion ? 90 : 0,
    };
    setDias((actuales) =>
      actuales.map((d, i) =>
        i === diaActivo ? { ...d, ejercicios: [...d.ejercicios, nuevo] } : d,
      ),
    );
  }

  function actualizar(key: string, cambios: Partial<EjercicioDraft>) {
    setDias((actuales) =>
      actuales.map((d, i) =>
        i === diaActivo
          ? {
              ...d,
              ejercicios: d.ejercicios.map((e) => (e.key === key ? { ...e, ...cambios } : e)),
            }
          : d,
      ),
    );
  }

  function quitarEjercicio(key: string) {
    setDias((actuales) =>
      actuales.map((d, i) =>
        i === diaActivo
          ? { ...d, ejercicios: d.ejercicios.filter((e) => e.key !== key) }
          : d,
      ),
    );
  }

  function moverEjercicio(index: number, direccion: -1 | 1) {
    const destino = index + direccion;
    if (destino < 0) return;
    setDias((actuales) =>
      actuales.map((d, i) => {
        if (i !== diaActivo || destino >= d.ejercicios.length) return d;
        const lista = [...d.ejercicios];
        [lista[index], lista[destino]] = [lista[destino], lista[index]];
        return { ...d, ejercicios: lista };
      }),
    );
  }

  function agregarDia() {
    const letra = String.fromCharCode(65 + dias.length);
    const nombreNuevo = dias.length < 26 ? `Día ${letra}` : `Día ${dias.length + 1}`;
    setDias((actuales) => [...actuales, nuevoDia(nombreNuevo)]);
    setDiaActivo(dias.length);
  }

  function quitarDia(index: number) {
    if (dias.length === 1) return setError('El plan necesita al menos un día.');
    setDias((actuales) => actuales.filter((_, i) => i !== index));
    setDiaActivo((actual) => Math.max(0, actual >= index ? actual - 1 : actual));
  }

  function renombrarDia(nombreDia: string) {
    setDias((actuales) =>
      actuales.map((d, i) => (i === diaActivo ? { ...d, nombre: nombreDia } : d)),
    );
  }

  async function guardar() {
    setError('');
    setExito('');
    setAdvertencias([]);

    if (!nombre.trim()) return setError('Poné un nombre al plan.');
    if (dias.some((d) => !d.nombre.trim())) return setError('Todos los días necesitan un nombre.');
    if (dias.some((d) => d.ejercicios.length === 0)) {
      return setError('Cada día del plan necesita al menos un ejercicio.');
    }
    for (const d of dias) {
      for (const e of d.ejercicios) {
        if (e.series < 1 || e.repMin < 1 || e.repMax < e.repMin || e.cargaObjetivo < 0 || e.descanso < 0) {
          return setError(`Revisá los valores de “${e.nombre}” en ${d.nombre}.`);
        }
      }
    }

    setGuardando(true);
    try {
      const respuesta = await api<{ plan: { id: number; nombre: string }; advertencias: string[] }>(
        '/planes',
        {
          method: 'POST',
          body: {
            nombre: nombre.trim(),
            alumnoId,
            dias: dias.map((d) => ({
              nombre: d.nombre.trim(),
              ejercicios: d.ejercicios.map((e) => ({
                ejercicioId: e.ejercicioId,
                bloque: e.bloque,
                series: e.series,
                repMin: e.repMin,
                repMax: e.repMax,
                cargaObjetivo: e.cargaObjetivo,
                descanso: e.descanso,
              })),
            })),
          },
        },
      );

      await api(`/planes/${respuesta.plan.id}/asignar`, {
        method: 'POST',
        body: { alumnoId },
      });

      setExito(`Plan “${respuesta.plan.nombre}” creado y asignado. El plan anterior quedó inactivo.`);
      setAdvertencias(respuesta.advertencias);
      setNombre('');
      setDias([nuevoDia('Día A')]);
      setDiaActivo(0);
      await onGuardado();
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setGuardando(false);
    }
  }

  const totalEjercicios = dias.reduce((total, d) => total + d.ejercicios.length, 0);

  return (
    <div className="editor-plan">
      <section className="card">
        <div className="fila">
          <div>
            <h2>Armar plan</h2>
            <p className="mu">
              {resumen
                ? `Para ${resumen.alumno.nombre} ${resumen.alumno.apellido}`
                : 'Elegí un alumno para asignarlo'}
            </p>
          </div>
          <span className="pill l">
            {dias.length} {dias.length === 1 ? 'día' : 'días'} · {totalEjercicios} ejercicios
          </span>
        </div>

        <label>
          Nombre del plan
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej.: Hipertrofia · 3 días"
          />
        </label>

        <div className="tabs-dias">
          {dias.map((d, i) => (
            <button
              key={d.key}
              className={i === diaActivo ? 'on' : ''}
              onClick={() => setDiaActivo(i)}
              type="button"
            >
              {d.nombre || `Día ${i + 1}`}
              <span className="contador">{d.ejercicios.length}</span>
            </button>
          ))}
          <button className="agregar-dia" onClick={agregarDia} type="button">
            ＋ Día
          </button>
        </div>

        {dia && (
          <div className="dia-activo">
            <div className="fila">
              <label className="crece">
                Nombre del día
                <input value={dia.nombre} onChange={(e) => renombrarDia(e.target.value)} />
              </label>
              <button
                className="btn sec mini"
                onClick={() => quitarDia(diaActivo)}
                type="button"
                disabled={dias.length === 1}
              >
                Quitar día
              </button>
            </div>

            {dia.ejercicios.length === 0 && (
              <div className="estado-vacio">
                <b>Este día todavía no tiene ejercicios.</b>
                <p className="mu">Usá la biblioteca de abajo para sumar movilidad, zona media o musculación.</p>
              </div>
            )}

            <div className="filas-ejercicio">
              {dia.ejercicios.map((e, index) => {
                const molestia = unreadPorEjercicio.get(e.ejercicioId);
                return (
                  <div className={`fila-ejercicio ${molestia ? 'con-alerta' : ''}`} key={e.key}>
                    <div className="ejercicio-info">
                      <div className="fila">
                        <b>{e.nombre}</b>
                        <span className="pill">{e.grupoMuscular}</span>
                      </div>
                      {molestia ? (
                        <div className="aviso inline">
                          <b>⚑ Molestia sin leer · {molestia.zona}</b>
                          <span>{molestia.observacion}</span>
                        </div>
                      ) : (
                        <span className="mu">Sin molestias pendientes</span>
                      )}
                    </div>

                    <div className="campos-ejercicio">
                      <label className="campo-mini">
                        Bloque
                        <select
                          value={e.bloque}
                          onChange={(ev) => actualizar(e.key, { bloque: ev.target.value as Bloque })}
                        >
                          {BLOQUES.map((b) => (
                            <option key={b.valor} value={b.valor}>{b.titulo}</option>
                          ))}
                        </select>
                      </label>
                      <label className="campo-mini">
                        Series
                        <input
                          type="number"
                          min={1}
                          value={e.series}
                          onChange={(ev) => actualizar(e.key, { series: Number(ev.target.value) })}
                        />
                      </label>
                      <label className="campo-mini">
                        Rep. mín.
                        <input
                          type="number"
                          min={1}
                          value={e.repMin}
                          onChange={(ev) => actualizar(e.key, { repMin: Number(ev.target.value) })}
                        />
                      </label>
                      <label className="campo-mini">
                        Rep. máx.
                        <input
                          type="number"
                          min={1}
                          value={e.repMax}
                          onChange={(ev) => actualizar(e.key, { repMax: Number(ev.target.value) })}
                        />
                      </label>
                      <label className="campo-mini">
                        Carga (kg)
                        <input
                          type="number"
                          min={0}
                          step={0.5}
                          value={e.cargaObjetivo}
                          onChange={(ev) => actualizar(e.key, { cargaObjetivo: Number(ev.target.value) })}
                        />
                      </label>
                      <label className="campo-mini">
                        Descanso (s)
                        <input
                          type="number"
                          min={0}
                          step={15}
                          value={e.descanso}
                          onChange={(ev) => actualizar(e.key, { descanso: Number(ev.target.value) })}
                        />
                      </label>
                    </div>

                    <div className="acciones-fila">
                      <button
                        className="icono-mini"
                        onClick={() => moverEjercicio(index, -1)}
                        disabled={index === 0}
                        title="Subir"
                        type="button"
                      >
                        ↑
                      </button>
                      <button
                        className="icono-mini"
                        onClick={() => moverEjercicio(index, 1)}
                        disabled={index === dia.ejercicios.length - 1}
                        title="Bajar"
                        type="button"
                      >
                        ↓
                      </button>
                      <button
                        className="icono-mini peligro"
                        onClick={() => quitarEjercicio(e.key)}
                        title="Quitar"
                        type="button"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <SelectorEjercicios
        ejercicios={ejercicios}
        idsConMolestia={idsConMolestia}
        onAgregar={agregarEjercicio}
      />

      {error && <div className="aviso">⚑ {error}</div>}
      {exito && <div className="exito">✓ {exito}</div>}
      {advertencias.length > 0 && (
        <div className="aviso">
          <b>El plan se guardó, pero revisá estas molestias:</b>
          <ul>
            {advertencias.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
      )}

      <div className="acciones-plan">
        <button className="btn" onClick={guardar} disabled={guardando || !resumen}>
          {guardando ? 'Guardando…' : 'Crear y asignar plan'}
        </button>
        <span className="mu">
          Al asignarlo, el plan activo anterior se desactiva y su historial se conserva.
        </span>
      </div>
    </div>
  );
}


