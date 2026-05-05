import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
@Entity('equipes')
export class Equipe {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  nom: string;
  @Column({ type: 'text', nullable: true })
  description: string;
  @Column({ nullable: true })
  photo: string;
  @CreateDateColumn()
  created_at: Date;
}
