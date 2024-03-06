import { Request, Response } from 'express';

import { getItemByName, addItem, updateItemStock } from '../models/ItemModel';

async function itemCreator(req: Request, res: Response): Promise<void> {

  const { itemName, stock, itemDescription, storeName } = req.body as NewItemRequest;

  const itemExists = await getItemByName(itemName);

  if (!itemExists) {
    await addItem(itemName, stock, itemDescription, storeName);
  } else {
    await updateItemStock(itemExists, stock);
  }

  res.redirect('/users/userAccountsPage');

}

export { itemCreator };
