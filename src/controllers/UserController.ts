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

async function getAllUserProfiles(req: Request, res: Response): Promise<void> {
  res.json(await allUserData());
}

async function registerUser(req: Request, res: Response): Promise<void> {
  const { email, password, birthday } = req.body as NewUserRequest;

  // Hashes the password
  const passwordHash = await argon2.hash(password);

  const user = await getUserByEmail(email);

  if (!user) {
    // Stores the hash in the place of the password
    await addUser(email, passwordHash, birthday);
    await sendEmail(email, 'Welcome!', 'You have successfully created your account!');
    res.redirect('/login');
  } else {
    res.redirect('/register');
  }
}

//Helps create a session for users who are logging in
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

  //Gets a the date as a string and parses the information out.
  const now = new Date();
  const logInTimeout = parseISO(req.session.logInTimeout);
  // If the client has a timeout set and it has not expired
  if (logInTimeout && isBefore(now, logInTimeout)) {
    // This will create a human friendly duration message
    const timeRemaining = formatDistanceToNow(logInTimeout);

    const message = `Log in Time out.You have ${timeRemaining} remaining.`;
    // Prevents users from trying to login to many times
    res.status(429).send(message);

    return;
  }
  const { email, password } = req.body as AuthRequest;
  const user = await getUserByEmail(email);

  if (!user) {
    res.redirect('/login');
    return;
  }

  //This helps to try and prevent someone from logging into an account to many times
  const { passwordHash } = user;
  if (!(await argon2.verify(passwordHash, password))) {

    if (!req.session.logInAttempts) {
      req.session.logInAttempts = 1;
    } else {
      req.session.logInAttempts += 1; // Increments on attempts to login
    }

    // A timer of 3 minutes is added if they tried logging in to many times
    // At the end, their attempts are reset
    if (req.session.logInAttempts >= 5) {
      const threeMinutesLater = addMinutes(now, 3).toISOString();
      req.session.logInTimeout = threeMinutesLater;
      req.session.logInAttempts = 0; 
    }

    //Redirects to login page on incorrect login
    res.redirect('/login');
    return;
  }

  await req.session.clearSession();

  // Saves user session data on correct login
  req.session.authenticatedUser = {
    email: user.email,
    userId: user.userId,
    adminElevation: user.canElevate,
  };
  req.session.isLoggedIn = true;
  res.redirect('/users/userAccountsPage');
}

//Destroys a user's sesssion if they logout
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

  // Email doesn't exist
  if (!user) {
    res.redirect('/users/userAccountsPage'); 
    return;
  }

  // Prevents someone from trying to delete someone elses account
  if (authenticatedUser.userId !== user.userId) {
    res.redirect('/users/userAccountsPage');
    return;
  }

  const { passwordHash } = user;

  //Checks to make sure that the user who's logged in has correctly entered their password
  if (!(await argon2.verify(passwordHash, password))) {
    res.redirect('/users/userAccountsPage');
  }

  await deleteUserById(user.userId);
  res.redirect('/');
}

async function updateUserEmail(req: Request, res: Response): Promise<void> {
  const { currEmail, newEmail } = req.body as { currEmail: string, newEmail: string };

  //Access the data from `req.session`
  const { isLoggedIn, authenticatedUser } = req.session;

  // Get the user account
  const user = await getUserByEmail(currEmail);

  // Checks to make sure that the session is currently active and that they're the correct user
  if (!isLoggedIn || authenticatedUser.email !== currEmail) {
    res.render('userAccountsPage', { user }); // Redirects if this isn't their account they're trying to change.
    return;
  }

  if (!user) {
    res.redirect('/login');
    return;
  }

  // Now update their email address
  try {
    await updateEmailAddress(user.userId, newEmail);
    authenticatedUser.email = newEmail;
  } catch (err) {
    // The email was taken so we need to send an error message
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
    return;
  }

  res.redirect('/');
}

async function updateUserPassword(req: Request, res: Response): Promise<void> {

  //Access the data from `req.session`
  const { isLoggedIn, authenticatedUser } = req.session;

  //Makes sure they're logged in to update the password
  if (!isLoggedIn) {
    res.redirect('/login');
    return;
  }

  //Gets the ne user password
  const { passwordNew } = req.body as { passwordNew: string };
  
  // Get the user account
  const user = await getUserById(authenticatedUser.userId);
  
  if (!user) {
    res.redirect('/login'); // 404 Not Found
    return;
  }

  const passwordHash = await argon2.hash(passwordNew);

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
