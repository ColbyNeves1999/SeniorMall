import './config';
import 'express-async-errors';
import express, { Express } from 'express';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';

const app: Express = express();
const { PORT, COOKIE_SECRET } = process.env;

const SQLiteStore = connectSqlite3(session);

app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
});