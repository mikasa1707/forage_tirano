import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Travaux } from '../../travaux/entities/travaux.entities';
@Entity('travaux_photos')
export class TravauxPhoto {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Travaux, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'travaux_id' })
  travaux: Travaux;
  @Column()
  image: string;
  @Column({ nullable: true })
  legenda: string;
}
