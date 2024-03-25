import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
// import argon2 from 'argon2';
import {
  addStore,
  getStoreByName,
  incrementProfileViews,
  getAllStores,
  getStoreByNumber,
  getStoreById,
  generateStore,
} from '../models/StoreModel';

async function getAllStoreProfiles(req: Request, res: Response): Promise<void> {
  res.json(await getAllStores());
}

async function storeCreator(req: Request, res: Response): Promise<void> {
  const { storeNumber, storeName, location, phone, email } = req.body as NewStoreRequest;

  const storeExist = await getStoreByName(storeName);

  if (!storeExist) {
    await addStore(storeNumber, storeName, location, phone, email);
  }

  res.redirect('/users/userAccountsPage');
}

async function getStoreProfileData(req: Request, res: Response): Promise<void> {
  try {
    const { targetStoreNumber } = req.params as unknown as ParamsDictionary & StoreNumberParam;

    // Get the store
    let store = await getStoreByNumber(targetStoreNumber);

    if (!store) {
      res.redirect('/index'); // 404 Not Found
      return;
    }

    // Now update their profile views
    store = await incrementProfileViews(store);

    const { isLoggedIn, authenticatedStore } = req.session;
    const viewingStore = await getStoreByNumber(authenticatedStore.storeNumber);

    res.render('storeInfo', {
      store,
      authenticatedNumber: viewingStore.storeNumber,
      loggedIn: isLoggedIn,
    });
  } catch (error) {
    console.error('Error fetching store profile data:', error);
    res.status(500).send('Internal Server Error');
  }
}

async function renderStoreInfoPage(req: Request, res: Response): Promise<void> {
  try {
    const { authenticatedStore } = req.session;

    if (!authenticatedStore || !authenticatedStore.storeNumber) {
      console.error('Authenticated store is not set or does not have storeNumber property');
      // Handle the error or redirect the user appropriately
      res.redirect('/login'); // Redirect to login page or handle the error
      return;
    }

    const { storeId } = authenticatedStore;

    // Assuming you have a function to retrieve store data by storeId
    const store = await getStoreById(storeId);

    // Assuming you have a function to retrieve all stores
    const allStores = await getAllStores();

    res.render('storeInfo', { store, allStores });
  } catch (error) {
    console.error('Error rendering store info page:', error);
    res.status(500).send('Internal Server Error');
  }
}

async function getStoreDetails(req: Request, res: Response): Promise<void> {
  try {
    const storeNumber = parseInt(req.query.storeNumber as string, 10);
    const storeData = await generateStore(storeNumber);

    // Render a view with the store data
    res.render('storePage', { storeData });
  } catch (error) {
    console.error('Error fetching store details:', error);
    res.status(500).send('Internal Server Error');
  }
}

export {
  getAllStoreProfiles,
  storeCreator,
  getStoreProfileData,
  renderStoreInfoPage,
  getStoreDetails,
};
