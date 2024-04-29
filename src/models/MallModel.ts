import { AppDataSource } from '../dataSource';
import { Mall } from '../entities/Mall';

const mallRepository = AppDataSource.getRepository(Mall);

async function getMallById(mallId: string): Promise<Mall | null> {
  return await mallRepository.findOne({ where: { mallId } });
}

async function getAllMalls(): Promise<Mall[]> {
  return await mallRepository.find({ relations: ['stores'] });
}

async function addMall(mallname: string): Promise<Mall> {
  // Create the new mall object and saves data
  let newMall = new Mall();
  newMall.mallName = mallname;

  newMall = await mallRepository.save(newMall);

  return newMall;
}

// Store's Location
async function setMallLocation(mallId: string, location: string): Promise<void> {
  let mall = await getMallById(mallId);
  mall.location = location;

  mall = await mallRepository.save(mall);
}

async function getMallByLocation(location: string): Promise<Mall | null> {
  return mallRepository.findOne({ where: { location } });
}

export { addMall, setMallLocation, getMallByLocation, getMallById, getAllMalls };
