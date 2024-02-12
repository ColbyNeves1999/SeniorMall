-- Purpose: contains schema for the project database

CREATE TABLE IF NOT EXISTS User (
    userId TEXT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    passwordHash TEXT UNIQUE NOT NULL,
    address VARCHAR(255) NOT NULL,
    birthday INT NOT NULL,
    admin BOOLEAN NOT NULL DEFAULT FALSE,
);

CREATE TABLE IF NOT EXISTS Mall (
    storeId TEXT PRIMARY KEY,
    mallName VARCHAR(255) UNIQUE NOT NULL DEFAULT 'Unknown Mall Name',
    location VARCHAR(255) UNIQUE NOT NULL DEFAULT 'Unknown Mall Location',
);

CREATE TABLE IF NOT EXISTS Store (
    storeId TEXT PRIMARY KEY,
    storeName VARCHAR(255) UNIQUE NOT NULL DEFAULT 'Unknown Store Name',
    location VARCHAR(255) UNIQUE NOT NULL DEFAULT 'Unknown Location',
    phone VARCHAR(255) UNIQUE NOT NULL,
);

CREATE TABLE IF NOT EXISTS Item (
    itemId PRIMARY KEY,
    itemName VARCHAR(255) NOT NULL DEFAULT 'Unknown Item Name',
    stock INT NOT NULL
);
