import argon2 from 'argon2';
import { AppDataSource } from '../dataSource';
import { User } from '../entities/User';

const { GMAIL_USERNAME, ADMINPASS } = process.env;

const userRepository = AppDataSource.getRepository(User);
async function getUserById(userId: string): Promise<User | null> {
  try {
    return await userRepository.findOneOrFail({ where: { userId } });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
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
  try {
    return await userRepository.findOneOrFail({ where: { email } });
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

async function deleteUserById(userId: string): Promise<void> {
  await userRepository
    .createQueryBuilder('user')
    .delete()
    .where('userId = :userId', { userId })
    .execute();
}

// This function is apart of a daily check that makes sure that there is
// always a user who has admin privileges. The GMAIL_USER should always have admin rights
async function lookForAdmin(): Promise<void> {

  const email = GMAIL_USERNAME;
  const passwordHash = await argon2.hash(ADMINPASS);
  const birthday = 9999;

  let user = await getUserByEmail(email);

  if (!user || user.admin === false || user.canElevate === false) {
    if (!user) {
      await addUser(email, passwordHash, birthday);
    }
    user = await getUserByEmail(email);
    user.admin = true;
    user.canElevate = true;
    user = await userRepository.save(user);
  } else if (user.admin !== true || user.canElevate !== true) {
    user.admin = true;
    user.canElevate = true;
    user = await userRepository.save(user);
  }
}

async function updateEmailAddress(userId: string, newEmail: string): Promise<void> {
  await userRepository
    .createQueryBuilder()
    .update(User)
    .set({ email: newEmail })
    .where({ userId })
    .execute();
}

async function changePassword(userId: string, newPassword: string): Promise<void> {
  const user = await getUserById(userId);
  user.passwordHash = newPassword;

  await userRepository.save(user);
}

async function updateAdminStatus(userId: string, adminStatus: string): Promise<void> {

  const user = await getUserById(userId);

  if (adminStatus === 'elevate') {
    user.admin = true;
  } else if (adminStatus === 'deelevate') {
    user.admin = false;
  }

  await userRepository.save(user);
}

async function updateElevationStatus(userId: string, elevationStatus: string): Promise<void> {
  console.log(elevationStatus);
  const user = await getUserById(userId);
  if (elevationStatus === 'elevate') {
    user.canElevate = true;
  } else if (elevationStatus === 'deelevate') {
    user.canElevate = false;
  }

  await userRepository.save(user);
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
  lookForAdmin,
  updateEmailAddress,
  updateAdminStatus,
  updateElevationStatus,
  changePassword,
};
