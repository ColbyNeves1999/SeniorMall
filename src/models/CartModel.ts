import { AppDataSource } from '../dataSource';
import { cartItem } from '../entities/Cart';

import { getUserById } from './UserModel';
import { getItemByName } from './ItemModel';

const cartItemRepository = AppDataSource.getRepository(cartItem);

async function getItemById(cartItemId: string): Promise<cartItem | null> {
  return await cartItemRepository.findOne({ where: { cartItemId } });
}

async function addItem(cartItemName: string, quantity: number, description: string, price: number, userId: string, storeName: string): Promise<cartItem> {
  const user = await getUserById(userId);
  const item = await getItemByName(cartItemName)
  const temp = await cartItemRepository.findOne({ where: { cartItemName: cartItemName, user: user } });

  if(!temp){
    const newItem = cartItemRepository.create({
      cartItemName,
      quantity,
      description,
      price,
      isInCart: true,
      store: storeName,
    });
    newItem.user = await getUserById(userId);

    return await cartItemRepository.save(newItem);
  }else{
    if(temp.quantity < item.stock){
      temp.quantity = temp.quantity + 1;
    }
    return await cartItemRepository.save(temp);
  }

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

async function getItemsBeingHeld(storeName: string): Promise<cartItem[]> {
  const temp = await cartItemRepository
    .createQueryBuilder('item')
    .where('store = :storeName', { storeName })
    .getMany();

  return temp;

}

export { getItemById, getItemByName, addItem, updateItem, removeItem, getItemsInCart, getAllUserItems, getItemsBeingHeld };