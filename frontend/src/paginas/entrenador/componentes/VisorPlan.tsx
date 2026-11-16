import { useEffect } from 'react';
import { BLOQUES, fmt, type PlanDetalle } from '../../../dominio/modelos';
import { fechaCorta } from '../../../utils/formato';

interface Props {
  plan: PlanDetalle;
  alumnoNombre: string;
  onCerrar: () => void;
}

/**
 * Vista de solo lectura del plan de un alumno.
 * No toca el editor: el entrenador puede revisar el plan sin abrir una copia editable.
 */
export default function VisorPlan({ plan, alumnoNombre, onCerrar }: Props) {
  useEffect(() => {
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', alPresionar);
    return () => document.removeEventListener('keydown', alPresionar);
  }, [onCerrar]);

  const dias = [...plan.dias].sort((a, b) => a.orden - b.orden);
  const totalEjercicios = dias.reduce((total, dia) => total + dia.ejercicios.length, 0);

  return (
    <div
      className="fondo visor-fondo"
      role="dialog"
      aria-modal="true"
      aria-label={`Plan ${plan.nombre}`}
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onCerrar();
      }}
    >
      <div className="hoja visor-plan">
        <div className="fila visor-cabecera">
          <div className="crece">
            <div className="eyebrow">Plan de entrenamiento</div>
            <h1>{plan.nombre}</h1>
            <p className="mu">
              {alumnoNombre} · {dias.length} {dias.length === 1 ? 'día' : 'días'} ·{' '}
              {totalEjercicios} ejercicios · creado el {fechaCorta(plan.creado.slice(0, 10))}
            </p>
          </div>
          <span className={`pill ${plan.activo ? 'l' : ''}`}>
            {plan.activo ? 'Activo' : 'Inactivo'}
          </span>
          <button className="icono-mini" onClick={onCerrar} aria-label="Cerrar" type="button">
            ✕
          </button>
        </div>

        {dias.length === 0 && (
          <p className="mu">Este plan todavía no tiene días cargados.</p>
        )}

        <div className="visor-dias">
          {dias.map((dia, indice) => {
            const bloques = BLOQUES.map((bloque) => ({
              ...bloque,
              ejercicios: [...dia.ejercicios]
                .filter((e) => e.bloque === bloque.valor)
                .sort((a, b) => a.orden - b.orden),
            })).filter((bloque) => bloque.ejercicios.length > 0);

            return (
              <section className="card visor-dia" key={dia.id}>
                <div className="fila">
                  <h2>
                    Día {indice + 1} · {dia.nombre}
                  </h2>
                  <span className="pill">
                    {dia.ejercicios.length}{' '}
                    {dia.ejercicios.length === 1 ? 'ejercicio' : 'ejercicios'}
                  </span>
                </div>

                {bloques.length === 0 && (
                  <p className="mu">Este día todavía no tiene ejercicios.</p>
                )}

                {bloques.map((bloque) => (
                  <div className="visor-bloque" key={bloque.valor}>
                    <h3 className="visor-bloque-titulo">{bloque.titulo}</h3>
                    <div className="visor-filas">
                      {bloque.ejercicios.map((ejercicio) => (
                        <div className="fila-visor" key={ejercicio.id}>
                          <div className="crece">
                            <b>{ejercicio.ejercicio.nombre}</b>
                            <div className="mu">{ejercicio.ejercicio.grupoMuscular}</div>
                          </div>
                          <div className="visor-datos">
                            <span>
                              {ejercicio.series} ×{' '}
                              {ejercicio.repMin === ejercicio.repMax
                                ? ejercicio.repMin
                                : `${ejercicio.repMin}-${ejercicio.repMax}`}{' '}
                              reps
                            </span>
                            <span>{fmt(ejercicio.cargaObjetivo)} kg</span>
                            <span>descanso {fmt(ejercicio.descanso)} s</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            );
          })}
        </div>

        <div className="acciones-fila">
          <button className="btn sec" onClick={onCerrar} type="button">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
