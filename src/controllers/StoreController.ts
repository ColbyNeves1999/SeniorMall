import { Request, Response } from 'express';
// import argon2 from 'argon2';

import {
  addStore,
  getStoreByName,
  getStoreById,
  incrementProfileViews,
  getAllStores,
} from '../models/StoreModel';

import { getUserById } from '../models/UserModel';

async function storeCreator(req: Request, res: Response): Promise<void> {
  const { storeNumber, storeName, location, phone, email } = req.body as NewStoreRequest;

  const storeExist = await getStoreByName(storeName);

  if (!storeExist) {
    await addStore(storeNumber, storeName, location, phone, email);
  }

  res.redirect('/users/userAccountsPage');
}

async function getStoreProfileData(req: Request, res: Response): Promise<void> {
  const { targetStoreId } = req.params as StoreIdParam;

  // Get the user account
  let store = await getStoreById(targetStoreId);

  if (!store) {
    res.redirect('/index'); // 404 Not Found
    return;
  }

  // Now update their profile views
  store = await incrementProfileViews(store);

  const { isLoggedIn, authenticatedUser } = req.session;
  const viewingUser = await getUserById(authenticatedUser.userId);

  res.render('storeInfo', {
    store,
    authenticatedId: viewingUser.userId,
    loggedIn: isLoggedIn,
  });
}

async function getStoreAnalysisData(req: Request, res: Response): Promise<void> {
  // Check if the user is an admin
  if (!req.session.isLoggedIn || !req.session.authenticatedUser.adminElevation) {
    res.status(403).send('Unauthorized'); // 403 Forbidden
    return;
  }

  // Get all stores from the database
  const stores = await getAllStores(); // You need to implement this function

  // Render the store analysis page template with the fetched stores data
  res.render('storeAnalysisPage', {
    stores,
  });
}

export { storeCreator, getStoreProfileData, getStoreAnalysisData };
