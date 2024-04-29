import { Request, Response } from 'express';
import {
  addItem, removeItem, getItemsInCart, getItemById,
  orderCloser, getItemsBeingHeld
} from '../models/CartModel';
import { getStoreById, getStoreByName } from '../models/StoreModel';

//Functions retrieves information from request body and creates item using that information
async function addItemToCart(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;

  if (!isLoggedIn) {
    res.redirect('/login'); // 404 Not Found
    return;
  }

  try {

    const { cartItemName, description, price, storeId } = req.body;

    const store = await getStoreById(storeId);

    await addItem(cartItemName, 1, description, price, authenticatedUser.userId, store.storeName);

    res.status(204).end();

  } catch (error) {

    console.error('Error adding item to cart:', error);
    res.status(500).send('Internal server error');

  }

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

//Helps to handle if items get removed from cart properly
async function removeItemFromCart(req: Request, res: Response): Promise<void> {
  try {

    const { isLoggedIn } = req.session;
    const { cartItemId } = req.body;

    if (!isLoggedIn) {
      res.redirect('/login'); // 404 Not Found
      return;
    }

    await removeItem(cartItemId);

    res.redirect('/cart');

    //res.status(204).end();
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).send('Internal server error');
  }
}

async function closingOrder(req: Request, res: Response): Promise<void> {
  try {

    const { isLoggedIn } = req.session;
    const { cartItemId, fulfilled, storeName } = req.body;

    if (!isLoggedIn) {
      res.redirect('/login'); // 404 Not Found
      return;
    }

    //Verifying that the inofrmation is registered as INTs
    const tempItem = await getItemById(cartItemId);
    const tempFulfilled = await parseInt(fulfilled);

    await removeItem(cartItemId);
    await orderCloser(tempItem.cartItemName, tempFulfilled);

    const store = await getStoreByName(storeName);
    if (store) {

      //List of Items that are being held by a store
      const heldList = await getItemsBeingHeld(storeName);

      res.render('heldPage', { store, heldList });
    }else{
      res.redirect('/');
    }

  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).send('Internal server error');
  }
}

async function renderCart(req: Request, res: Response): Promise<void> {

  const { isLoggedIn } = req.session;

  if (!isLoggedIn) {
    res.redirect('/login'); // 404 Not Found
    return;
  }

  try {
    //Retrieves cart items for a store and redirects with that list
    const cartItems = await getItemsInCart();
    res.render('cart', { cartItems });
  } catch (error) {
    console.error('Error rendering cart page:', error);
    res.status(500).send('Internal server error');
  }
}

export { addItemToCart, getItemsInCartHandler, removeItemFromCart, renderCart, closingOrder };
