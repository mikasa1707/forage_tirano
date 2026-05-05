import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Travaux } from './travaux.entities';

@Entity({ name: 'travaux_photos' }) // IMPORTANT : ton nom de table
export class TravauxPhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  image: string;

  @Column({ length: 255, nullable: true })
  legenda: string;

  @ManyToOne(() => Travaux, (t) => t.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'travaux_id' })
  travaux: Travaux;
}
