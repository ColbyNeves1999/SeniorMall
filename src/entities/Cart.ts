import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
// import { User } from './User';

@Entity()
export class cartItem {
  @PrimaryGeneratedColumn('uuid')
  cartItemId: string;

  @Column()
  cartItemName: string;

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

  // // Define Many-to-One relationship with User
  // @ManyToOne(() => User, user => user.cartItems)
  // user: User;
}
