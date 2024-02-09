import { AppDataSource } from '../dataSource';
import { Item } from '../entities/Item';

const itemRepository = AppDataSource.getRepository(Item);

async function addItem(itemName: string): Promise<Item> {

    // Create the new item object and saves data
    let newItem = new Item();
    newItem.itemName = itemName;

    // Then save it to the database
    // NOTES: We reassign to `newItem` so we can access
    // NOTES: the fields the database autogenerates (the id & default columns)
    newItem = await itemRepository.save(newItem);

    return newItem;

}

//User's associated Mall address
async function setItemStock(itemId: string, stock: number): Promise<void> {

    let item = await getItemById(itemId);
    item.stock = stock;

    item = await itemRepository.save(item);

}

async function getItemById(itemId: string): Promise<Item | null> {
    return await itemRepository.findOne({ where: { itemId } });
}

async function getUserByName(itemName: string): Promise<Item | null> {
    return itemRepository.findOne({ where: { itemName } });
}

export { addItem, setItemStock, getUserByName };