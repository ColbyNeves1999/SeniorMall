import { AppDataSource } from '../dataSource';
import { User } from '../entities/User';

const userRepository = AppDataSource.getRepository(User);
async function getUserById(userId: string): Promise<User | null> {
  return await userRepository.findOne({ where: { userId } });
}

async function allUserData(): Promise<User[]> {
  return userRepository.find();
}

async function addUser(email: string, passwordHash: string, birthday: number): Promise<User> {
  // Create the new user object and saves data
  let newUser = new User();
  newUser.email = email;
  newUser.passwordHash = passwordHash;
  newUser.birthday = birthday;

  // Then save it to the database
  // NOTES: We reassign to `newUser` so we can access
  // NOTES: the fields the database autogenerates (the id & default columns)
  newUser = await userRepository.save(newUser);
  console.log('5');

  return newUser;
}

// User's associated Mall address
async function setUserMallAddress(userId: string, mallAddress: string): Promise<void> {
  let user = await getUserById(userId);
  user.address = mallAddress;

  user = await userRepository.save(user);
}

// User's Birthday
async function setUserBirthday(userId: string, birthday: number): Promise<void> {
  let user = await getUserById(userId);
  user.birthday = birthday;

  user = await userRepository.save(user);
}

// User's Admin Status
async function setUserAdmin(userId: string, admin: boolean): Promise<void> {
  let user = await getUserById(userId);
  user.admin = admin;

  user = await userRepository.save(user);
}

async function getUserByEmail(email: string): Promise<User | null> {
  return userRepository.findOne({ where: { email } });
}

async function deleteUserById(userId: string): Promise<void> {
  await userRepository
    .createQueryBuilder('user')
    .delete()
    .where('userId = :userId', { userId })
    .execute();
}

export {
  getUserById,
  allUserData,
  addUser,
  setUserMallAddress,
  setUserBirthday,
  setUserAdmin,
  getUserByEmail,
  deleteUserById,
};
