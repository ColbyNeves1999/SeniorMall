import { AppDataSource } from '../dataSource';
import { Store } from '../entities/Store';

const storeRepository = AppDataSource.getRepository(Store);

async function addStore(mallname: string): Promise<Store> {

    // Create the new store object and saves data
    let newStore = new Store();
    newStore.mallname = mallname;

    // Then save it to the database
    // NOTES: We reassign to `newStore` so we can access
    // NOTES: the fields the database autogenerates (the id & default columns)
    newStore = await storeRepository.save(newStore);

    return newStore;

}

//Store's Location
async function setStoreLocation(storeId: string, location: string): Promise<void> {

    let store = await getStoreById(storeId);
    store.location = location;

    store = await storeRepository.save(store);

}

//User's Admin Status
async function setStorePhone(storeId: string, phone: string): Promise<void> {

    let store = await getStoreById(storeId);
    store.phone = phone;

    store = await storeRepository.save(store);

}

async function getStoreById(storeId: string): Promise<Store | null> {
    return await storeRepository.findOne({ where: { storeId } });
}

async function getStoreByLocation(location: string): Promise<Store | null> {
    return storeRepository.findOne({ where: { location } });
}

export { addStore, setStoreLocation, setStorePhone, getStoreById, getStoreByLocation };