import { Request, Response } from 'express';
import {
  addItem, removeItem, getItemsInCart
} from '../models/CartModel';
import { getItemByStoreId } from '../models/ItemModel';
import { getStoreById } from '../models/StoreModel';

async function addItemToCart(req: Request, res: Response): Promise<void> {

  const { itemCart, storeId } = req.body as { itemCart: string, storeId: string };

  const store = await getStoreById(storeId);
  const itemList = await getItemByStoreId(storeId);

  console.log(itemCart);

  res.render(`storePage`, { store, itemList });

  //console.log(itemCart);
  //res.status(200);
  //try {
  /////FIX USER ID TO CURRENT SESSION ID///////
  //const { cartItemName, quantity, description, price, userId } = req.body;
  //const newItem = await addItem(cartItemName, quantity, description, price, userId);
  //res.status(201).json(newItem);
  //} catch (error) {
  //console.error('Error adding item to cart:', error);
  //res.status(500).send('Internal server error');
  //}



}

async function getItemsInCartHandler(req: Request, res: Response): Promise<void> {
  try {
    const itemsInCart = await getItemsInCart();
    res.status(200).json(itemsInCart);
  } catch (error) {
    console.error('Error fetching items in cart:', error);
    res.status(500).send('Internal server error');
  }
}

async function removeItemFromCart(req: Request, res: Response): Promise<void> {
  try {
    const cartItemId = req.params.id;
    await removeItem(cartItemId);
    res.status(204).end();
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).send('Internal server error');
  }
}

async function renderCart(req: Request, res: Response): Promise<void> {
  try {
    const cartItems = await getItemsInCart();
    res.render('cart', { cartItems });
  } catch (error) {
    console.error('Error rendering cart page:', error);
    res.status(500).send('Internal server error');
  }
}

export { addItemToCart, getItemsInCartHandler, removeItemFromCart, renderCart };