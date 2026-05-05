import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

import { Equipe } from '../../equipes/entities/equipe.entity';
import { TravauxPhoto } from './travaux-photo.entity';

@Entity({ name: 'travaux' })
export class Travaux {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titre: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['en_cours', 'termine', 'planifie'],
    default: 'planifie',
  })
  status: 'en_cours' | 'termine' | 'planifie';

  @Column({ type: 'date', nullable: true })
  date_debut: string;

  @Column({ type: 'date', nullable: true })
  date_fin: string;

  @Column({ nullable: true })
  localisation: string;

  @Column({ nullable: true })
  photo_principale: string;

  @ManyToOne(() => Equipe, { nullable: true })
  @JoinColumn({ name: 'equipe_id' })
  equipe: Equipe | null;

  @OneToMany(() => TravauxPhoto, (p) => p.travaux, { cascade: true })
  photos: TravauxPhoto[];

  @CreateDateColumn()
  created_at: Date;
}
