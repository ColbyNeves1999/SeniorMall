import './config';
import 'express-async-errors';
import express, { Express } from 'express';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import { scheduleJob } from 'node-schedule';

import { lookForAdmin } from './models/UserModel';
import { renderCart, addItemToCart, removeItemFromCart, closingOrder } from './controllers/CartController';

import {
  getAllUserProfiles,
  registerUser,
  logIn,
  logOut,
  userHomePage,
  deleteAccount,
  renderProfilePage,
  updateUserPassword,
  updateUserAdminPermissions,
} from './controllers/UserController';

import {
  storeCreator,
  renderStoreAnalysisPage,
  renderStorePage,
  generateStoreChart,
  renderHeldPage
} from './controllers/StoreController';
import { itemCreator, itemStockModifier } from './controllers/ItemController';
import { renderMainPage } from './controllers/PageController';

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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function iMakeSureAdminsExist() {
  lookForAdmin();
}

scheduleJob('19 03 * * *', iMakeSureAdminsExist);

app.use(sessionMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public', { extensions: ['html'] }));
app.set('view engine', 'ejs');
// endpoints

app.get('/', renderMainPage); //Generates an ejs for the main page

app.post('/storePage', renderStorePage);
app.post('/heldPage', renderHeldPage);
app.get('/cart', renderCart);

app.get('/api/users', getAllUserProfiles);


app.post('/login', logIn); // Lets a user login
app.get('/logout', logOut); // Lets a user logout

app.get('/users/userAccountsPage', renderProfilePage);

app.post('/users/delete', deleteAccount);
app.post('/users/changePassword', updateUserPassword);
app.get('/cartPage', renderCart); //Renders a user's card

app.get('/userHomepage', userHomePage); // Displays the user's homepage

app.post('/registerUser', registerUser); // Registers a user
app.post('/createStore', storeCreator); // Creates stores
app.post('/createitem', itemCreator); // Creates items


app.post('/itemStockModifier', itemStockModifier);
app.post('/elevate', updateUserAdminPermissions);

app.get('/storeInfo', renderStoreAnalysisPage);
app.get('/store/chart', generateStoreChart);

app.post("/addToCart", addItemToCart)
app.post('/removeFromCart', removeItemFromCart);

app.post('/closeOrder', closingOrder);

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
