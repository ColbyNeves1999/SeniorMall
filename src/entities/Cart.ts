import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
// import { User } from './User';

@Entity()
export class Item {
  @PrimaryGeneratedColumn('uuid')
  itemId: string;

  @Column()
  itemName: string;

  @Column()
  quantity: number;

  @Column()
  description: string;

  // Adding price for each item
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  // Adding a flag to mark if the item is in the cart
  @Column({ default: false })
  isInCart: boolean;

  /*
  @ManyToOne(() => User, user => user.cartItems)
  user: User;
  */
}
