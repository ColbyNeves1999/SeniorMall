# SeniorMall

An online catalog and hold-for-pickup system for a physical shopping mall. Shoppers browse the mall's stores, see each store's items and current stock, and add items to a cart to be held for pickup in person; there is no online payment. Mall administrators manage stores and inventory, work through the queue of held items, and record what was picked up, which updates stock automatically. A store-analysis page charts how often each store is viewed.

Built as a Senior Design project at Arkansas State University (February–April 2024) as a team project.

## Features

**Shoppers**
- Browse the mall's stores from the home page, with a map of the mall's location.
- View a store's page with its items, descriptions, and stock levels; each visit counts toward that store's view total.
- Add items to a hold cart. Adding the same item again raises the quantity, capped at the stock on hand.
- Remove items from the cart.
- Register, log in and out, change email or password, and delete the account. Login is locked for three minutes after five failed attempts, and new accounts get a welcome email.

**Administrators**
- Create stores and add items to a store's catalog.
- Add or subtract stock; items that reach zero are removed.
- View the items being held at each store, enter how many units were fulfilled, and close the hold, which subtracts that amount from stock.
- View a bar chart of page views for every store.
- Two permission levels: `admin` grants access to the management tools, and `canElevate` additionally allows promoting or demoting other users.
- A scheduled job runs daily to make sure the configured admin account exists and holds both permissions, so the site can't be left without an administrator.

## How it works

```
 Shopper                                   Admin
 ───────                                   ─────
 Home page ──► Store page ──► Add to cart   Create store / add items / adjust stock
                  │              │                        │
          views +1 (analytics)   ▼                        ▼
                          cartItem rows ◄──────── Held-items page for a store
                          (held for pickup)               │ enter units fulfilled
                                                          ▼
                                            hold removed, item stock reduced
                                            (item deleted if stock reaches 0)
```

The app is a server-rendered Express application. Controllers handle requests and render EJS templates; models wrap TypeORM repositories over a SQLite database. Sessions are stored in SQLite as well, so logins survive server restarts.

### Data model

- `User`: email, argon2 password hash, birthday, address, `admin` and `canElevate` flags; has many cart items, belongs to a mall, and can favorite stores.
- `Store`: name, location, phone, email, and a profile-view counter; has many items and belongs to one or more malls.
- `Item`: name, description, stock, and its store.
- `cartItem`: an item held for a user, with quantity, store name, and description.
- `Mall`: name, location, and its stores.

Tables are generated from the TypeORM entities. `database/schema.sql` is an early draft of the schema and isn't used by the app.

## Tech stack

| Layer | Tools |
|---|---|
| Server | Node.js, Express, TypeScript (ES modules) |
| Database | SQLite via TypeORM |
| Views | EJS templates, HTML, CSS, Bootstrap |
| Auth | express-session with a SQLite session store, argon2 password hashing |
| Email | Nodemailer through Gmail |
| Charts and maps | Chart.js, Leaflet with OpenStreetMap tiles |
| Jobs | node-schedule |
| Tooling | ESLint (Airbnb + TypeScript), Prettier, BrowserSync |

## Project layout

```
src/
  index.ts            Express setup, sessions, routes, daily admin check
  dataSource.ts       TypeORM/SQLite connection
  controllers/        Request handlers: users, stores, items, cart, pages
  models/             Database access and business logic
  entities/           TypeORM entities: User, Store, Item, cartItem, Mall
  services/           Email sending
views/                EJS pages: home, store, cart, held items, account pages, store analysis
public/               Static pages (login, register, settings, help), CSS, store images
database/schema.sql   Early schema draft (unused)
```

## Running locally

Requires Node 18 or later.

Create a `.env` file:

```
PORT=8080
COOKIE_SECRET=some-long-random-string
DATABASE_NAME=seniormall.sqlite
GMAIL_USERNAME=you@gmail.com        # sends email and becomes the guaranteed admin account
GMAIL_APP_PASSWORD=your-app-password
ADMINPASS=password-for-that-admin-account
```

Then:

```
npm install
npm run build
npm start
```

For development, run `npm run compile` (TypeScript watch) alongside `npm run start-dev`, or `npm run start-dev-ui` for BrowserSync live reload.

The admin account is created by the daily job at 3:25 AM. On a fresh install, either wait for that run or register `GMAIL_USERNAME` yourself and let the job grant it admin rights.

## Known limitations

This was a semester-long class project and wasn't developed further after it was presented.

- **Carts aren't separated by user.** The cart page lists every held item in the system, not just the logged-in user's.
- **Account deletion doesn't stop on a wrong password.** The password check redirects but doesn't return, so the account is still deleted.
- **`/api/users` is public** and returns every user record, including password hashes.
- **Items are looked up by name across the whole mall,** so two stores can't each carry an item with the same name.
- **Items have no price,** so cart prices are empty.
- **Admin rights are mall-wide;** there's no per-store staff role, and admins can manage any store.
- **Changing an email address doesn't require the current password.**
- **Several management routes** (creating stores and items, adjusting stock) don't check that the requester is an admin.
- The home page's store list is hardcoded to six stores rather than read from the database.
- No input validation layer and no automated tests.

## Team

| Member | Main areas |
|---|---|
| Colby Neves | Inventory and stock management, hold-for-pickup cart and fulfillment flow, admin dashboard and two-level permission system, scheduled admin check, account access control, home and store page rendering |
| Hwiyoon Kim | Email service, account settings (email and password changes), store model, view tracking and analytics chart data, map, front-end layout |
| Chase Roberson | Initial cart entity, settings, help, and checkout pages, early store pages |
