import { AppDataSource } from '../dataSource';
import { Item } from '../entities/Item';

import { getStoreByName, getStoreById } from './StoreModel';

const itemRepository = AppDataSource.getRepository(Item);

async function getItemById(itemId: string): Promise<Item | null> {
  return await itemRepository.findOne({ where: { itemId } });
}

async function getItemByStoreId(storeId: string): Promise<Item[] | null> {

  const store = await getStoreById(storeId);

  return await itemRepository.find({ where: { store } });
}

async function getItemByName(itemName: string): Promise<Item | null> {
  return await itemRepository.findOne({ where: { itemName } });
}

async function addItem(
  itemName: string,
  itemStock: number,
  itemDescription: string,
  associatedStore: string
): Promise<Item> {
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

  return newItem;
}

// User's associated Mall address
async function setItemStock(itemId: string, stock: number): Promise<void> {
  let item = await getItemById(itemId);
  item.stock = stock;

  item = await itemRepository.save(item);
}

async function updateItemStock(item: Item, stock: number): Promise<void> {
  item.stock += stock;

  item = await itemRepository.save(item);
}

async function getUserByName(itemName: string): Promise<Item | null> {
  return itemRepository.findOne({ where: { itemName } });
}

export { getItemById, getItemByName, addItem, setItemStock, getUserByName, updateItemStock, getItemByStoreId };
