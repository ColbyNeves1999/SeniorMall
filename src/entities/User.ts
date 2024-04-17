import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  Relation,
  JoinTable,
  OneToMany
} from 'typeorm';

import { Mall } from './Mall';
import { Store } from './Store';
import { cartItem } from './Cart';

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

  // Has permission to elevate other users to users
  @Column({ default: false })
  canElevate: boolean;

  // Define One-to-Many relationship with cartItem
  @OneToMany(() => cartItem, (cartItem) => cartItem.user, { cascade: ['insert', 'update'] })
  cartItems: Relation<cartItem>[]; // Define the property to hold related cartItems

  @ManyToOne(() => Mall, (mall) => mall.users)
  mall: Relation<Mall>;

  @ManyToMany(() => Store, (store) => store.favorite, { cascade: ['insert', 'update'] })
  @JoinTable()
  favStore: Relation<Store>[];
}
