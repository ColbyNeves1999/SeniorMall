import { AppDataSource } from '../dataSource';
import { cartItem } from '../entities/Cart';

import { getUserById } from './UserModel';
import { getItemByName, updateItemStock } from './ItemModel';

const cartItemRepository = AppDataSource.getRepository(cartItem);

async function getItemById(cartItemId: string): Promise<cartItem | null> {
  return await cartItemRepository.findOne({ where: { cartItemId } });
}

//Adds new item to stock, but if that item already exists, then it's added to that item instead
async function addItem(cartItemName: string, quantity: number, description: string, price: number, userId: string, storeName: string): Promise<cartItem> {
  const user = await getUserById(userId);
  const item = await getItemByName(cartItemName)
  const temp = await cartItemRepository.findOne({ where: { cartItemName: cartItemName, user: user } });

  //Checks if the item already exists
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

//Removes an item from the database
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

//Gets all items in carts that exist for specific user
async function getAllUserItems(userId: string): Promise<cartItem[]> {
  const temp = await cartItemRepository
    .createQueryBuilder('item')
    .where('userUserId = :userId', { userId })
    .getMany();

  return temp;

}

// Gets all items in a store currently requested to be held
async function getItemsBeingHeld(storeName: string): Promise<cartItem[]> {
  const temp = await cartItemRepository
    .createQueryBuilder('item')
    .where('store = :storeName', { storeName })
    .getMany();

  return temp;

}

// Helps manage whether and item is being held or not and what kind of update to
//stock that was provided
async function orderCloser(itemName: string, fulfilled: number): Promise<void> {

  const tempItem = await getItemByName(itemName);

  await updateItemStock(tempItem, fulfilled, "Subtract");

}

export { getItemById, getItemByName, addItem, removeItem, getItemsInCart, getAllUserItems, getItemsBeingHeld, orderCloser };
