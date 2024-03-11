import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Relation, ManyToMany } from 'typeorm';

import { Item } from './Item';
import { Mall } from './Mall';
import { User } from './User';

@Entity()
export class Store {
  @PrimaryGeneratedColumn('uuid')
  storeId: string;

  @Column({ unique: true })
  storeName: string;

  @Column({ unique: true })
  location: string;

  @Column({ unique: true })
  phone: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: 0 })
  profileViews: number;

  @OneToMany(() => Item, (item) => item.store, { cascade: ['insert', 'update'] })
  items: Relation<Item>[];

  @ManyToMany(() => Mall, (mall) => mall.stores, { cascade: ['insert', 'update'] })
  malls: Relation<Mall>[];

  @ManyToMany(() => User, (user) => user.favStore, { cascade: ['insert', 'update'] })
  favorite: Relation<User>[];
}
