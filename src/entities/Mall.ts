import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Mall {
  @PrimaryGeneratedColumn('uuid')
  mallId: string;

  @Column({ unique: true })
  mallName: string;

  @Column({ unique: true })
  location: string;
}
