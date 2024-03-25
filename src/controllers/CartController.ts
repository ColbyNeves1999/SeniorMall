import { Request, Response } from 'express';
import { CartModel } from '../models/CartModel';

export class CartController {
  private cartModel: CartModel;

  constructor() {
    this.cartModel = new CartModel();
  }

  async addItemToCart(req: Request, res: Response): Promise<void> {
    try {
      const { cartItemName, quantity, description, price } = req.body;
      const newItem = await this.cartModel.addItem(cartItemName, quantity, description, price);
      res.status(201).json(newItem);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      res.status(500).send('Internal server error');
    }
  }

  async getItemsInCart(req: Request, res: Response): Promise<void> {
    try {
      const itemsInCart = await this.cartModel.getItemsInCart();
      res.status(200).json(itemsInCart);
    } catch (error) {
      console.error('Error fetching items in cart:', error);
      res.status(500).send('Internal server error');
    }
  }

  async removeItemFromCart(req: Request, res: Response): Promise<void> {
    try {
      const cartItemId = req.params.id;
      await this.cartModel.removeItem(cartItemId);
      res.status(204).end();
    } catch (error) {
      console.error('Error removing item from cart:', error);
      res.status(500).send('Internal server error');
    }
  }
}
