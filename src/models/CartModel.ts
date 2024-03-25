import { AppDataSource } from '../dataSource';
import { cartItem } from '../entities/Cart'; 

export class CartModel {
  private cartItemRepository = AppDataSource.getRepository(cartItem);

  async getItemById(cartItemId: string): Promise<cartItem | null> {
    return await this.cartItemRepository.findOne({ where: { cartItemId } });
  }

  async getItemByName(cartItemName: string): Promise<cartItem | null> {
    return await this.cartItemRepository.findOne({ where: { cartItemName } });
  }

  async addItem(cartItemName: string, quantity: number, description: string, price: number): Promise<cartItem> {
    const newItem = this.cartItemRepository.create({
      cartItemName,
      quantity,
      description,
      price,
      isInCart: true // Setting isInCart to true for items added to the cart
    });
    return await this.cartItemRepository.save(newItem);
  }

  async updateItem(cartItem: cartItem): Promise<cartItem> {
    return await this.cartItemRepository.save(cartItem);
  }

  async removeItem(cartItemId: string): Promise<void> {
    await this.cartItemRepository.delete(cartItemId);
  }

  async getItemsInCart(): Promise<cartItem[]> {
    return await this.cartItemRepository.find({ where: { isInCart: true } });
  }
}
