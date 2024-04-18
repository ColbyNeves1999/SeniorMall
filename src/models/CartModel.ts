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

  newItem.user = await getUserById(userId);

  return await cartItemRepository.save(newItem);
}

async function updateItem(cartItem: cartItem): Promise<cartItem> {
  return await cartItemRepository.save(cartItem);
}

async function removeItem(cartItemId: string): Promise<void> {
  const itemId = cartItemId;
  await cartItemRepository
    .createQueryBuilder('item')
    .delete()
    .where('cartItemId = :itemId', { itemId })
    .execute();
}

async function getItemsInCart(): Promise<cartItem[]> {
  return await cartItemRepository.find({ where: { isInCart: true } });
}

async function getAllUserItems(userId: string): Promise<cartItem[]> {
  const temp = await cartItemRepository
    .createQueryBuilder('item')
    .where('userUserId = :userId', { userId })
    .getMany();

  return temp;

}

export { getItemById, getItemByName, addItem, updateItem, removeItem, getItemsInCart, getAllUserItems };