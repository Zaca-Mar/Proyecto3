import { advertenciasDeMolestias } from './advertencias';

describe('advertenciasDeMolestias', () => {
  it('no advierte sin molestias', () => {
    expect(advertenciasDeMolestias([], [{ id: 1, nombre: 'Sentadilla' }], [1])).toEqual([]);
  });

  it('advierte cuando se elige el mismo ejercicio reportado', () => {
    const resultado = advertenciasDeMolestias(
      [{ ejercicioId: 1, zona: 'rodilla', observacion: 'duele al bajar' }],
      [{ id: 1, nombre: 'Sentadilla' }],
      [1],
    );

    expect(resultado).toHaveLength(1);
    expect(resultado[0]).toContain('Elegiste “Sentadilla”');
    expect(resultado[0]).toContain('duele al bajar');
  });

  it('advierte cuando el ejercicio carga la zona por grupo muscular', () => {
    const resultado = advertenciasDeMolestias(
      [{ ejercicioId: 99, zona: 'rodilla', observacion: '' }],
      [{ id: 2, nombre: 'Prensa', grupoMuscular: 'Cuádriceps' }],
      [2],
    );

    expect(resultado).toHaveLength(1);
    expect(resultado[0]).toContain('“Prensa” puede afectar la zona rodilla');
  });

  it('no advierte por zonas ajenas', () => {
    const resultado = advertenciasDeMolestias(
      [{ ejercicioId: 99, zona: 'hombro', observacion: '' }],
      [{ id: 2, nombre: 'Prensa', grupoMuscular: 'Cuádriceps' }],
      [2],
    );

    expect(resultado).toEqual([]);
  });
});
