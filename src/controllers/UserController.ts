import { Request, Response } from 'express';
import argon2 from 'argon2';
import { addMinutes, isBefore, parseISO, formatDistanceToNow } from 'date-fns';
import { addUser, getUserByEmail } from '../models/UserModel';
import { parseDatabaseError } from '../utils/db-utils';
import { sendEmail } from '../services/emailService';

async function registerUser(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as NewUserRequest;

  // IMPORTANT: Hash the password
  const passwordHash = await argon2.hash(password);

  try {
    // IMPORTANT: Store the `passwordHash` and NOT the plaintext password
    await addUser(email, passwordHash);
    await sendEmail(email, 'Welcome!', `You have successfully created your account!`);
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

async function logIn(req: Request, res: Response): Promise<void> {
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
  };
  req.session.isLoggedIn = true;
  res.redirect('/users/PreviewPage');
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

export { registerUser, logIn, userHomePage };
