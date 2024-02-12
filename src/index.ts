import './config';
import 'express-async-errors';
import express, { Express } from 'express';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';

const app: Express = express();
const { PORT, COOKIE_SECRET } = process.env;

const SQLiteStore = connectSqlite3(session);

import { registerUser, logIn, userHomePage } from './controllers/UserController';

app.use(
  session({
    store: new SQLiteStore({ db: 'sessions.sqlite' }),
    secret: COOKIE_SECRET,
    cookie: { maxAge: 8 * 60 * 60 * 1000 }, // 8 hours
    name: 'session',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public', { extensions: ['html'] }));
app.set('view engine', 'ejs');

app.post('/registerUser', registerUser, registerUser); //Registers a user
app.post('/login', logIn, logIn); //Lets a user login

app.get('/userHomepage', userHomePage); //Displays the user's homepage

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
