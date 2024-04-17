import { Request, Response } from 'express';
import {
  addStore,
  getStoreByName,
  incrementProfileViews,
  getAllStores,
  getStoreById,
} from '../models/StoreModel';
import { getItemByStoreId } from '../models/ItemModel';

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
  const { storeName } = req.body as NewStoreRequest;

  const store = await getStoreByName(storeName);
  if (store) {
    await incrementProfileViews(store);

    const itemList = await getItemByStoreId(store.storeId);

    res.render(`storePage`, { store, itemList });
  } else {
    res.redirect('/');
  }
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

// Define the ChartData interface
interface ChartData {
  labels: string[];
  profileViews: number[];
}

// Use the ChartData interface as a type annotation
async function generateStoreChart(req: Request, res: Response): Promise<void> {
  try {
    // Retrieve data from the database
    const stores = await getAllStores();

    // Format data as JSON
    const chartData: ChartData = {
      labels: stores.map((store) => store.storeName),
      profileViews: stores.map((store) => store.profileViews),
    };

    // Send JSON response
    res.json(chartData);
  } catch (error) {
    // Handle errors
    console.error('Error generating store chart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export {
  getAllStoreProfiles,
  storeCreator,
  getStoreProfileData,
  renderStorePage,
  renderStoreAnalysisPage,
  generateStoreChart,
};
