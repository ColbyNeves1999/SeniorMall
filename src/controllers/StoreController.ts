import { Request, Response } from 'express';
import {
  addStore,
  getStoreByName,
  incrementProfileViews,
  getAllStores,
  getStoreById,
} from '../models/StoreModel';
import { getItemByStoreId } from '../models/ItemModel';
import { getItemsBeingHeld } from '../models/CartModel';

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

//Retrieves the views that are used to display how frequently a store is checked
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

//Renders store pages that display the store and their items
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

//Renders the page that show items in carts that are being held
async function renderHeldPage(req: Request, res: Response): Promise<void> {
  const { storeName } = req.body as NewStoreRequest;
  const { authenticatedUser } = req.session;

  if(authenticatedUser){
    const store = await getStoreByName(storeName);
    if (store) {

      const heldList = await getItemsBeingHeld(storeName);

      res.render('heldPage', { store, heldList });
    } else {
      res.redirect('/');
    }
  }
  
  
}

// Retrieve all stores from the database and displays them to the user
async function renderStoreAnalysisPage(req: Request, res: Response): Promise<void> {
 try {
    const stores = await getAllStores(); 
    res.render('StoreInfo', { stores });
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
  renderHeldPage
};
