import { Request, Response } from 'express';
import argon2 from 'argon2';
import { addMinutes, isBefore, parseISO, formatDistanceToNow } from 'date-fns';
import {
  addUser,
  getUserById,
  getUserByEmail,
  allUserData,
  deleteUserById,
  updateEmailAddress,
  updateAdminStatus,
  updateElevationStatus,
  changePassword,
} from '../models/UserModel';
import { parseDatabaseError } from '../utils/db-utils';
import { sendEmail } from '../services/emailService';

// const { GMAIL_USERNAME } = process.env;

async function getAllUserProfiles(req: Request, res: Response): Promise<void> {
  res.json(await allUserData());
}

async function registerUser(req: Request, res: Response): Promise<void> {
  const { email, password, birthday } = req.body as NewUserRequest;

  // Hashes the password
  const passwordHash = await argon2.hash(password);

  const user = await getUserByEmail(email);
  
  if(!user){
    // Stores the hash in the place of the password
    await addUser(email, passwordHash, birthday);
    //await sendEmail(email, 'Welcome!', 'You have successfully created your account!');
    res.redirect('/login');
  }else{
    res.redirect('/register');
  }
}

async function logIn(req: Request, res: Response): Promise<void> {
  if (req.session.isLoggedIn === true) {
    const { authenticatedUser } = req.session;
    const user = await getUserById(authenticatedUser.userId);

    if (user.admin) {
      res.render('adminAccountsPage', { user });
    } else {
      res.render('userAccountsPage', { user });
    }
  }

  const now = new Date();
  // NOTES: We need to convert the date string back into a Date() object
  //        `parseISO()` does the conversion
  const logInTimeout = parseISO(req.session.logInTimeout);
  // NOTES: If the client has a timeout set and it has not expired
  if (logInTimeout && isBefore(now, logInTimeout)) {
    // NOTES: This will create a human friendly duration message
    const timeRemaining = formatDistanceToNow(logInTimeout);

    const message = `Log in Time out.You have ${timeRemaining} remaining.`;
    // NOTES: Reject their request
    res.status(429).send(message); // 429 Too Many Requests

    return;
  }
  const { email, password } = req.body as AuthRequest;
  const user = await getUserByEmail(email);

  if (!user) {
    res.redirect('/login');
    return;
  }

  const { passwordHash } = user;
  if (!(await argon2.verify(passwordHash, password))) {
    // NOTES: If they haven't attempted to log in yet
    if (!req.session.logInAttempts) {
      req.session.logInAttempts = 1; // NOTES: Set their attempts to one
    } else {
      req.session.logInAttempts += 1; // NOTES: Otherwise increment their attempts
    }

    // NOTES: If the client has failed five times then we will add a
    //        3 minute timeout
    if (req.session.logInAttempts >= 5) {
      const threeMinutesLater = addMinutes(now, 3).toISOString(); // NOTES: Must convert to a string
      req.session.logInTimeout = threeMinutesLater;
      req.session.logInAttempts = 0; // NOTES: Reset their attempts
    }

    res.redirect('/login'); // 404 Not Found - user with email/pass doesn't exist
    return;
  }
  // NOTES: Remember to clear the session before setting their authenticated session data
  await req.session.clearSession();

  // NOTES: Now we can add whatever data we want to the session
  req.session.authenticatedUser = {
    email: user.email,
    userId: user.userId,
    adminElevation: user.canElevate,
  };
  req.session.isLoggedIn = true;
  res.redirect('/users/userAccountsPage');
}

async function logOut(req: Request, res: Response): Promise<void> {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    // Redirect to login page after logout
    res.redirect('/');
  });
}

async function renderProfilePage(req: Request, res: Response): Promise<void> {
  const { authenticatedUser } = req.session;

  if (!authenticatedUser) {
    // Handle the case where the user is not authenticated
    res.redirect('/login');
    return;
  }

  const user = await getUserById(authenticatedUser.userId);
  if (!user) {
    // Handle the case where the user data is not found
    res.status(404).send('User not found');
    return;
  }

  // Allows a user to access the admin page if they're an admin
  if (user.admin === true) {
    res.render('adminAccountsPage', { user });
  } else {
    res.render('userAccountsPage', { user });
  }
}

async function userHomePage(req: Request, res: Response): Promise<void> {
  let user;

  if (req.session.isLoggedIn) {
    user = await getUserByEmail(req.session.authenticatedUser.email);
  } else {
    res.redirect('/login');
    return;
  }

  res.render('userAccountsPage', { user });
}

async function deleteAccount(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { email, password } = req.body as AuthRequest;

  if (!isLoggedIn) {
    res.redirect('/login'); // not logged in
    return;
  }

  const user = await getUserByEmail(email);

  if (!user) {
    res.redirect('/users/userAccountsPage'); // 404 Not Found - email doesn't exist
    return;
  }

  if (authenticatedUser.userId !== user.userId) {
    res.redirect('/users/userAccountsPage'); // trying to delete someone elses account
    return;
  }

  const { passwordHash } = user;

  if (!(await argon2.verify(passwordHash, password))) {
    res.redirect('/users/userAccountsPage'); // 404 not found - user w/ email/password doesn't exist
  }

  await deleteUserById(user.userId);
  res.redirect('/');
}

async function updateUserEmail(req: Request, res: Response): Promise<void> {
  const { targetUserId } = req.params as UserIdParam;

  // NOTES: Access the data from `req.session`
  const { isLoggedIn, authenticatedUser } = req.session;

  // NOTES: We need to make sure that this client is logged in AND
  //        they are try to modify their own user account
  if (!isLoggedIn || authenticatedUser.userId !== targetUserId) {
    res.sendStatus(403); // 403 Forbidden
    return;
  }

  const { email } = req.body as { email: string };

  // Get the user account
  const user = await getUserById(targetUserId);

  if (!user) {
    res.redirect('/login'); // 404 Not Found
    return;
  }

  // Now update their email address
  try {
    await updateEmailAddress(targetUserId, email);
  } catch (err) {
    // The email was taken so we need to send an error message
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
    return;
  }

  res.sendStatus(200);
}

async function updateUserPassword(req: Request, res: Response): Promise<void> {
  // const { targetUserId } = req.params as UserIdParam;

  // NOTES: Access the data from `req.session`
  const { isLoggedIn, authenticatedUser } = req.session;

  // NOTES: We need to make sure that this client is logged in AND
  //        they are try to modify their own user account
  if (!isLoggedIn) {
    res.redirect('/login');
    return;
  }

  const { password } = req.body as { password: string };
  // Get the user account
  const user = await getUserById(authenticatedUser.userId);
  if (!user) {
    res.redirect('/login'); // 404 Not Found
    return;
  }

  const passwordHash = await argon2.hash(password);
  
  // Now update their password
  try {
    await changePassword(authenticatedUser.userId, passwordHash);
  } catch (err) {
    // The email was taken so we need to send an error message
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
    return;
  }

  res.render('userAccountsPage', { user });
  // res.sendStatus(200);
}

async function updateUserAdminPermissions(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;

  if (isLoggedIn && authenticatedUser.adminElevation === true) {
    // Email of an admin user, grant/take away admin status, grant/take away elevation status
    const { email, adminStatus, elevationStatus } = req.body as newAdmin;

    const user = await getUserByEmail(email);
    if (user) {
      await updateAdminStatus(user.userId, adminStatus);
      await updateElevationStatus(user.userId, elevationStatus);
    }
  }

  const user = await getUserByEmail(authenticatedUser.email);

  if (user.admin) {
    res.render('adminAccountsPage', { user });
  }

}

export {
  getAllUserProfiles,
  registerUser,
  logIn,
  logOut,
  userHomePage,
  deleteAccount,
  renderProfilePage,
  updateUserEmail,
  updateUserPassword,
  updateUserAdminPermissions,
};
