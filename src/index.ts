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
  updateUserEmail,
} from './controllers/UserController';

import {
  storeCreator,
  renderStoreAnalysisPage,
  renderStorePage,
  generateStoreChart,
  renderHeldPage,
  getAllStoreProfiles
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

//Daily makes sure that an admin exists AND the GMAIL_USER is an admin
scheduleJob('25 03 * * *', iMakeSureAdminsExist);

app.use(sessionMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public', { extensions: ['html'] }));
app.set('view engine', 'ejs');
// endpoints

app.get('/api/users', getAllUserProfiles);

//Creation/destruction of sessions
app.post('/login', logIn); // Lets a user login
app.get('/logout', logOut); // Lets a user logout

// Changes that are being made to user accounts
app.post('/registerUser', registerUser); // Registers a user
app.post('/elevate', updateUserAdminPermissions); // Handles user admin (de)elevation
app.post('/users/delete', deleteAccount); // Deletion of accounts
app.post('/users/changePassword', updateUserPassword); // Updating of passwords
app.post('/users/changeEmail', updateUserEmail); // Updating of email

// Functions handling rendering done
app.get('/', renderMainPage); //Generates an ejs for the main page
app.post('/storePage', renderStorePage); //Store .ejs display
app.post('/heldPage', renderHeldPage); // Items being held .ejs display
app.get('/cart', renderCart); // User's cart page .ejs
app.get('/users/userAccountsPage', renderProfilePage); //Displays user's .ejs page
app.get('/userHomepage', userHomePage); // Displays the user's static homepage

// Handles store creation and item management
app.post('/createStore', storeCreator); // Creates stores
app.post('/createitem', itemCreator); // Creates items
app.post('/itemStockModifier', itemStockModifier); // Handles modifying stock

// Store rendering page for anything that is displayed on store analysis
app.get('/storeInfo', renderStoreAnalysisPage); //Renders the page with store data .ejs
app.get('/store/chart', generateStoreChart); // Handles the rendering of the store chart
app.get('/cartPage', renderCart); //Renders a user's cart

//Functions handling carts
app.post("/addToCart", addItemToCart); //Adds individual items from cart
app.post('/removeFromCart', removeItemFromCart); //Removes individual items from cart
app.post('/closeOrder', closingOrder); //Closes cart requests

//Test for checking stores in database
app.get('/getthemstores', getAllStoreProfiles);

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
