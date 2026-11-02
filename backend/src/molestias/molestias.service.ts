import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Molestia } from './entities/molestia.entity';
import { Ejercicio } from '../catalogo/entities/ejercicio.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CrearMolestiaDto } from './dto/crear-molestia.dto';
import { VinculosService } from '../common/services/vinculos.service';

@Injectable()
export class MolestiasService {
  constructor(
    @InjectRepository(Molestia)
    private readonly molestias: Repository<Molestia>,
    @InjectRepository(Ejercicio)
    private readonly ejercicios: Repository<Ejercicio>,
    @InjectRepository(Usuario)
    private readonly usuarios: Repository<Usuario>,
    private readonly vinculos: VinculosService,
  ) {}

  /** US8: queda asociada al ejercicio, sin leer, y el entrenador la ve en la app. */
  async crear(alumnoId: number, dto: CrearMolestiaDto) {
    const ejercicio = await this.ejercicios.findOneBy({ id: dto.ejercicioId });
    if (!ejercicio) throw new NotFoundException('Ejercicio no encontrado');
    return this.molestias.save(
      this.molestias.create({ ...dto, alumnoId, leida: false }),
    );
  }

  mias(alumnoId: number) {
    return this.molestias.find({
      where: { alumnoId },
      relations: { ejercicio: true },
      order: { id: 'DESC' },
    });
  }

  /** US14: molestias de mis alumnos, con las pendientes primero. */
  async delEntrenador(entrenadorId: number) {
    const ids = await this.vinculos.alumnosDe(entrenadorId);
    if (!ids.length) return [];

    const alumnos = new Map(
      (await this.usuarios.findBy({ id: In(ids) })).map((a) => [a.id, a]),
    );
    const lista = await this.molestias.find({
      where: { alumnoId: In(ids) },
      relations: { ejercicio: true },
      order: { id: 'DESC' },
    });

    return lista
      .map((m) => ({
        id: m.id,
        alumno: `${alumnos.get(m.alumnoId)!.nombre} ${alumnos.get(m.alumnoId)!.apellido}`,
        alumnoId: m.alumnoId,
        ejercicio: m.ejercicio.nombre,
        ejercicioId: m.ejercicioId,
        zona: m.zona,
        observacion: m.observacion,
        leida: m.leida,
        creada: m.creada,
      }))
      .sort((a, b) => Number(a.leida) - Number(b.leida));
  }

  async marcarLeida(entrenadorId: number, id: number) {
    const molestia = await this.molestias.findOneBy({ id });
    if (!molestia) throw new NotFoundException('Molestia no encontrada');
    await this.vinculos.exigir(entrenadorId, molestia.alumnoId);
    molestia.leida = true;
    return this.molestias.save(molestia);
  }
}
