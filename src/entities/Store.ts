import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Relation, ManyToMany } from 'typeorm';

import { Item } from './Item';
import { Mall } from './Mall';

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

  @OneToMany(() => Item, (item) => item.store)
  items: Relation<Item>[];

  @ManyToMany(() => Mall, (mall) => mall.stores, { cascade: ['insert', 'update'] })
  malls: Relation<Mall>[];
}
