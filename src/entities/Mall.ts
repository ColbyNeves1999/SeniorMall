import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, Relation, JoinTable } from 'typeorm';

import { Store } from './Store';

@Entity()
export class Mall {
  @PrimaryGeneratedColumn('uuid')
  mallId: string;

  @Column({ unique: true })
  mallName: string;

  @Column({ unique: true })
  location: string;

  @ManyToMany(() => Store, (store) => store.malls, { cascade: ['insert', 'update'] })
  @JoinTable()
  stores: Relation<Store>[];
}
