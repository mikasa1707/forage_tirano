import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  message!: string;

  @Column({
    type: 'enum',
    enum: ['nouveau', 'lu', 'traite'],
    default: 'nouveau',
  })
  status!: 'nouveau' | 'lu' | 'traite';

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column()
  nom!: string;

  @Column()
  email!: string;

  @Column()
  telephone!: string;

  @Column({ nullable: true })
  sujet!: string;
}
