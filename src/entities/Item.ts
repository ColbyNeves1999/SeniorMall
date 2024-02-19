import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';

import { Store } from './Store';

@Entity()
export class Item {
  @PrimaryGeneratedColumn('uuid')
  itemId: string;

  @Column()
  itemName: string;

  @Column()
  stock: number;

  @Column()
  description: string;

  @ManyToOne(() => Store, (store) => store.items)
  store: Relation<Store>;
}
