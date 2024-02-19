import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  Relation,
  JoinTable,
  OneToMany,
} from 'typeorm';

import { Store } from './Store';
import { User } from './User';

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

  @OneToMany(() => User, (user) => user.mall)
  users: Relation<User>[];
}
