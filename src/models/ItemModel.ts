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

  newItem = await itemRepository.save(newItem);

  return newItem;
}

// Set's new item stock
async function setItemStock(itemId: string, stock: number): Promise<void> {
  let item = await getItemById(itemId);
  item.stock = stock;

  item = await itemRepository.save(item);
}

// Updates item stock
async function updateItemStock(item: Item, stock: number, subOrAdd: string): Promise<void> {
  if (subOrAdd === "Subtract") {
    item.stock = item.stock - stock;
  } else if (subOrAdd === "Add") {
    item.stock = item.stock + stock;
  }


  item = await itemRepository.save(item);
  if(item.stock <= 0){
    await deleteItemById(item.itemId);
  }
  
}

async function getUserByName(itemName: string): Promise<Item | null> {
  return itemRepository.findOne({ where: { itemName } });
}

async function deleteItemById(itemId: string): Promise<void> {
  await itemRepository
    .createQueryBuilder('user')
    .delete()
    .where('itemId = :itemId', { itemId })
    .execute();
}

export { getItemById, getItemByName, addItem, setItemStock, getUserByName, updateItemStock, getItemByStoreId, deleteItemById };
