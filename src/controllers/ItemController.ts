import { Request, Response } from 'express';

import { getItemByName, addItem, updateItemStock, deleteItemById } from '../models/ItemModel';

async function itemCreator(req: Request, res: Response): Promise<void> {
  const { itemName, itemStock, itemDescription, storeName } = req.body as NewItemRequest;
  console.log(itemName, itemStock, itemDescription, storeName);

  const temp = parseInt(itemStock);
  const itemExists = await getItemByName(itemName);

  if (!itemExists) {
    await addItem(itemName, temp, itemDescription, storeName);
  } else {
    await updateItemStock(itemExists, temp, "Add");
  }

  res.redirect('/users/userAccountsPage');
}

async function itemStockModifier(req: Request, res: Response): Promise<void> {
  // Store name is taken for verification purposes that will be added later
  const { itemName, itemStock, itemDescription, storeName } = req.body as NewItemRequest;
  const {subOrAdd} = req.body as {subOrAdd: string};

  const temp = parseInt(itemStock);

  const itemExists = await getItemByName(itemName);

  if (!itemExists) {
    // Need to add something to do if item doesn't exist, such as alert user//
    await addItem(itemName, temp, itemDescription, storeName);
  } else {
    await updateItemStock(itemExists, temp, subOrAdd);
  }

  if(itemExists.stock <= 0){

    await deleteItemById(itemExists.itemId);

  }

  res.redirect('/users/userAccountsPage');
}

export { itemCreator, itemStockModifier };
