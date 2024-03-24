import { Request, Response } from 'express';
import { getAllMalls } from '../models/MallModel';

async function getAllMallsWithStores(req: Request, res: Response): Promise<void> {
  res.json(await getAllMalls());
}

export { getAllMallsWithStores };
