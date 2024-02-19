import './config';
import 'express-async-errors';
import express, { Express } from 'express';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';

import {
  getAllUserProfiles,
  registerUser,
  logIn,
  userHomePage,
  deleteAccount,
  renderProfilePage,
} from './controllers/UserController';

const app: Express = express();
const { PORT, COOKIE_SECRET } = process.env;

const SQLiteStore = connectSqlite3(session);

const sessionMiddleware = session({
  store: new SQLiteStore({ db: 'sessions.sqlite' }),
  secret: COOKIE_SECRET,
  cookie: { maxAge: 8 * 60 * 60 * 1000 }, // 8 hours
  name: 'session',
  resave: false,
  saveUninitialized: false,
});

app.use(sessionMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public', { extensions: ['html'] }));
app.set('view engine', 'ejs');

// endpoints
app.get('/api/users', getAllUserProfiles);

app.post('/registerUser', registerUser); // Registers a user
app.post('/login', logIn); // Lets a user login

app.get('/users/userAccountsPage', renderProfilePage);

app.post('/users/delete', deleteAccount);

app.get('/userHomepage', userHomePage); // Displays the user's homepage

// Route to handle GET requests to "/search"
app.get('/search', (req, res) => {
  // Retrieve the search query from the request
  const query = req.query.q;

  // database

  // Return the search results
  res.send(`Search results for: ${query}`);
});

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
