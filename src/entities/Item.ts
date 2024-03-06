import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';

import { Store } from './Store';

@Entity()
export class Item {
  @PrimaryGeneratedColumn('uuid')
  itemId: string;

  @Column({ default: null })
  itemName: string;

  @Column({ default: null })
  stock: number;

  @Column({ default: null })
  description: string;

  @ManyToOne(() => Store, (store) => store.items)
  store: Relation<Store>;
}
