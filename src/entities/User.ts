import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Relation,
  JoinTable,
  ManyToMany,
} from 'typeorm';

import { Mall } from './Mall';
import { Store } from './Store';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: null })
  passwordHash: string;

  @Column({ default: null })
  address: string;

  @Column({ default: null })
  birthday: number;

  @Column({ default: false })
  admin: boolean;

  //Has permission to elevate other users to users
  @Column({ default: false })
  canElevate: boolean;

  @ManyToOne(() => Mall, (mall) => mall.users)
  mall: Relation<Mall>;

  @ManyToMany(() => Store, (store) => store.favorite, { cascade: ['insert', 'update'] })
  @JoinTable()
  favStore: Relation<Store>[];
}
