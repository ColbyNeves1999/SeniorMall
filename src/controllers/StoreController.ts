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
  // only the admin can view this
  if (req.session.isLoggedIn === true) {
    const { authenticatedUser } = req.session;

    // Get the user account
    const user = await getUserById(authenticatedUser.userId);

    if (user && user.admin === true) {
      const { targetStoreId } = req.params as StoreIdParam;

      // Get the store account
      let store = await getStoreById(targetStoreId);

      if (!store) {
        res.redirect('/index'); // 404 Not Found
        return;
      }

      // Now update store profile views
      store = await incrementProfileViews(store);

      res.render('storeAnalysisPage', {
        store,
      });
    } else {
      res.status(403).send('Unauthorized'); // 403 Forbidden
    }
  } else {
    res.status(401).send('Unauthorized'); // 401 Unauthorized
  }
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
