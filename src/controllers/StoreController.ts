import { Request, Response } from 'express';
//import argon2 from 'argon2';

import {addStore, getStoreByName} from '../models/StoreModel';

async function storeCreator(req: Request, res: Response): Promise<void> {
    
    const { storeName, location, phone, email } = req.body as NewStoreRequest;
  
    const storeExist = await getStoreByName(storeName);

    if(!storeExist){
    await addStore(storeName, location, phone, email);
    }

    res.redirect('/users/userAccountsPage');

  }

export { storeCreator };
