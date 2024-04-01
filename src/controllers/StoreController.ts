import { Request, Response } from 'express';
import {
  addStore,
  getStoreByName,
  incrementProfileViews,
  getAllStores,
  getStoreById,
} from '../models/StoreModel';

async function getAllStoreProfiles(req: Request, res: Response): Promise<void> {
  res.json(await getAllStores());
}

async function storeCreator(req: Request, res: Response): Promise<void> {
  const { storeName, location, phone, email } = req.body as NewStoreRequest;

  const storeExist = await getStoreByName(storeName);

  if (!storeExist) {
    await addStore(storeName, location, phone, email);
  }

  res.redirect('/users/userAccountsPage');
}

async function getStoreProfileData(req: Request, res: Response): Promise<void> {
  const { targetStoreId } = req.params as StoreIdParam;

  let store = await getStoreById(targetStoreId);

  if (!store) {
    res.redirect('/adminAccountsPage');
    return;
  }

  store = await incrementProfileViews(store);
  res.render('storeInfo', { store });
}

async function renderStorePage(req: Request, res: Response): Promise<void> {
  const { storeIndex } = req.params;

  const stores = await getAllStores();

  // Ensure the store index is within the array bounds
  const index = parseInt(storeIndex, 10);
  if (Number.isNaN(index) || index < 1 || index > stores.length) {
    res.status(404).send('Store not found');
    return;
  }

  const store = stores[index - 1];

  res.render(`store${index}Page`, { store });
}

async function renderStoreAnalysisPage(req: Request, res: Response): Promise<void> {
  try {
    const stores = await getAllStores(); // Retrieve all stores from the database
    res.render('storeInfo', { stores });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
}

export {
  getAllStoreProfiles,
  storeCreator,
  getStoreProfileData,
  renderStorePage,
  renderStoreAnalysisPage,
};
