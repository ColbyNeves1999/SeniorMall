import { Request, Response } from 'express';

import { getItemByName, addItem, updateItemStock, deleteItemById } from '../models/ItemModel';

//Takes information from request body and creates a new item
async function itemCreator(req: Request, res: Response): Promise<void> {
  const { itemName, itemStock, itemDescription, storeName } = req.body as NewItemRequest;

  const temp = parseInt(itemStock);
  const itemExists = await getItemByName(itemName);

  if (!itemExists) {
    await addItem(itemName, temp, itemDescription, storeName);
  } else {
    await updateItemStock(itemExists, temp, "Add");
  }

  res.redirect('/users/userAccountsPage');
}

//Modifies item stocks and calls for removal if the stock is 0 or below
async function itemStockModifier(req: Request, res: Response): Promise<void> {
  
  // Store name is taken for verification purposes that will be added later
  const { itemName, itemStock, itemDescription, storeName } = req.body as NewItemRequest;
  const { subOrAdd } = req.body as { subOrAdd: string };

  const temp = parseInt(itemStock);

  const itemExists = await getItemByName(itemName);

  if (!itemExists) {
    // Need to add something to do if item doesn't exist, such as alert user//
    await addItem(itemName, temp, itemDescription, storeName);
  } else {
    await updateItemStock(itemExists, temp, subOrAdd);
  }

  if (itemExists.stock <= 0) {

    await deleteItemById(itemExists.itemId);

  }

  res.redirect('/users/userAccountsPage');
}

export { itemCreator, itemStockModifier };
