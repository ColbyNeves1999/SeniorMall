import { AppDataSource } from '../dataSource';
import { Store } from '../entities/Store';

const storeRepository = AppDataSource.getRepository(Store);

async function getStoreById(storeId: string): Promise<Store | null> {
  return await storeRepository.findOne({ where: { storeId } });
}

async function getAllStores(): Promise<Store[]> {
  return await storeRepository.find();
}

// Recieves information and create store based on information
async function addStore(
  storeName: string,
  location: string,
  phone: string,
  email: string
): Promise<Store> {
  // Create the new store object and saves data
  let newStore = new Store();
  newStore.storeName = storeName;
  newStore.location = location;
  newStore.phone = phone;
  newStore.email = email;

  newStore = await storeRepository.save(newStore);

  return newStore;
}

// Store's Location (if it needed to be changed)
async function setStoreLocation(storeId: string, location: string): Promise<void> {
  let store = await getStoreById(storeId);
  store.location = location;

  store = await storeRepository.save(store);
}

// Store's phone (if it needed to be changed)
async function setStorePhone(storeId: string, phone: string): Promise<void> {
  let store = await getStoreById(storeId);
  store.phone = phone;

  store = await storeRepository.save(store);
}

async function getStoreByLocation(location: string): Promise<Store | null> {
  return storeRepository.findOne({ where: { location } });
}

async function getStoreByName(storeName: string): Promise<Store | null> {
  return storeRepository.findOne({ where: { storeName } });
}

// To see how many people viewed each store
async function incrementProfileViews(storeData: Store): Promise<Store> {
  const updatedStore = storeData;
  updatedStore.profileViews += 1;

  await storeRepository
    .createQueryBuilder()
    .update(Store)
    .set({ profileViews: updatedStore.profileViews })
    .where({ storeId: updatedStore.storeId })
    .execute();

  return updatedStore;
}
export {
  addStore,
  getAllStores,
  setStoreLocation,
  setStorePhone,
  getStoreById,
  getStoreByLocation,
  getStoreByName,
  incrementProfileViews,
};
