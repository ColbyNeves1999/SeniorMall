import { AppDataSource } from '../dataSource';
import { Item } from '../entities/Item';
import { Store } from '../entities/Store';

import { getStoreByName } from './StoreModel';

const itemRepository = AppDataSource.getRepository(Item);
const storeRepository = AppDataSource.getRepository(Store);

async function getItemById(itemId: string): Promise<Item | null> {
  return await itemRepository.findOne({ where: { itemId } });
}

async function addItem(itemName: string, itemStock: number, itemDescription: string, associatedStore: string): Promise<Item> {

  const thisStore = await getStoreByName(associatedStore);

  // Create the new item object and saves data
  let newItem = new Item();
  newItem.itemName = itemName;
  newItem.stock = itemStock;
  newItem.description = itemDescription;
  newItem.store = thisStore;

  // Then save it to the database
  // NOTES: We reassign to `newItem` so we can access
  // NOTES: the fields the database autogenerates (the id & default columns)
  newItem = await itemRepository.save(newItem);
  thisStore.items.push(newItem);
  await storeRepository.save(thisStore);


  return newItem;
}

// User's associated Mall address
async function setItemStock(itemId: string, stock: number): Promise<void> {
  let item = await getItemById(itemId);
  item.stock = stock;

  item = await itemRepository.save(item);
}

async function getUserByName(itemName: string): Promise<Item | null> {
  return itemRepository.findOne({ where: { itemName } });
}

export { addItem, setItemStock, getUserByName };
