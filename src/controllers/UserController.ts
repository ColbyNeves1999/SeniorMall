import { Request, Response } from 'express';
import argon2 from 'argon2';

import { addUser, getUserByEmail } from '../models/UserModel';

async function registerUser(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as userLoginInfo;
  const user = await getUserByEmail(email);

  if (user) {
    res.redirect('/register');
    return;
  }

  // IMPORTANT: Hash the password
  const passwordHash = await argon2.hash(password);

  await addUser(email, passwordHash);

  // res.redirect for page will go here//
}

async function logIn(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as userLoginInfo;
  const user = await getUserByEmail(email);

  if (!user) {
    res.redirect('/login');
    return;
  }

  const { passwordHash } = user;

  if (!(await argon2.verify(passwordHash, password))) {
    // res.redirect for page will go here//
    return;
  }

  req.session.authenticatedUser = {
    email: user.email,
    userId: user.userId,
    address: user.address,
    birthday: user.birthday,
    admin: user.admin,
  };
  req.session.isLoggedIn = true;

  res.redirect('/index');
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
