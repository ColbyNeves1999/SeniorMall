import { AppDataSource } from '../dataSource';
import { cartItem } from '../entities/Cart';

import { getUserById } from './UserModel';

const cartItemRepository = AppDataSource.getRepository(cartItem);

async function getItemById(cartItemId: string): Promise<cartItem | null> {
  return await cartItemRepository.findOne({ where: { cartItemId } });
}

async function getItemByName(cartItemName: string): Promise<cartItem | null> {
  return await cartItemRepository.findOne({ where: { cartItemName } });
}

async function addItem(cartItemName: string, quantity: number, description: string, price: number, userId: string): Promise<cartItem> {
  const newItem = cartItemRepository.create({
    cartItemName,
    quantity,
    description,
    price,
    isInCart: true,
  });

  newItem.user = [await getUserById(userId)];

  return await cartItemRepository.save(newItem);
}

async function updateItem(cartItem: cartItem): Promise<cartItem> {
  return await cartItemRepository.save(cartItem);
}

async function removeItem(cartItemId: string): Promise<void> {
  await cartItemRepository.delete(cartItemId);
}

async function getItemsInCart(): Promise<cartItem[]> {
  return await cartItemRepository.find({ where: { isInCart: true } });
}

export { getItemById, getItemByName, addItem, updateItem, removeItem, getItemsInCart };