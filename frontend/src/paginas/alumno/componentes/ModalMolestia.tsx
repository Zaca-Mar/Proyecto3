import { useState } from 'react';
import { api, mensajeDeError } from '../../../api';
import { ZONAS, type Ejercicio } from '../../../tipos';

interface Props {
  ejercicio: Ejercicio;
  cerrar: () => void;
}

export default function ModalMolestia({ ejercicio, cerrar }: Props) {
  const [zona, setZona] = useState(ejercicio.zonas[0] ?? '');
  const [texto, setTexto] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviada, setEnviada] = useState(false);

  async function enviar() {
    if (!zona) return setError('Elegí la zona del cuerpo donde sentiste la molestia.');
    if (!texto.trim()) return setError('Contanos brevemente qué sentiste.');

    setError('');
    setEnviando(true);
    try {
      await api('/molestias', {
        method: 'POST',
        body: { ejercicioId: ejercicio.id, zona, observacion: texto.trim() },
      });
      setEnviada(true);
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fondo" role="dialog" aria-modal="true">
      <div className="hoja">
        {enviada ? (
          <>
            <div className="avatar avatar-gr exito-avatar">✓</div>
            <h1>Tu entrenador ya recibió el aviso</h1>
            <p className="mu">
              Va a ver tu observación de {ejercicio.nombre.toLowerCase()} dentro de la app. El
              sistema no recomienda alternativas: la decisión es del entrenador.
            </p>
            <div className="card">
              <span className="pill a">{zona}</span>
              <p>“{texto}”</p>
            </div>
            <button className="btn" onClick={cerrar} type="button">
              Volver
            </button>
          </>
        ) : (
          <>
            <div className="fila">
              <h2>⚑ ¿Qué te molesta?</h2>
              <button className="icono-mini" onClick={cerrar} aria-label="Cerrar" type="button">
                ✕
              </button>
            </div>
            <b>{ejercicio.nombre}</b>
            <label>
              Zona del cuerpo
              <select value={zona} onChange={(e) => setZona(e.target.value)}>
                <option value="">Elegí una zona…</option>
                {ZONAS.map((z) => (
                  <option key={z}>{z}</option>
                ))}
              </select>
            </label>
            <label>
              Observación · máximo 140 caracteres
              <textarea
                maxLength={140}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escribí qué sentiste y en qué momento…"
              />
            </label>
            <p className="mu" style={{ textAlign: 'right' }}>
              {texto.length} / 140
            </p>
            {error && <div className="aviso">⚑ {error}</div>}
            <button className="btn" onClick={enviar} disabled={enviando} type="button">
              {enviando ? 'Enviando…' : 'Avisar a mi entrenador'}
            </button>
            <button className="btn sec" onClick={cerrar} type="button">
              Cancelar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
