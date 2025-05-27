# Guide: Migrating the Project from PostgreSQL to MySQL

This guide will help you transition the project from PostgreSQL (currently used) to MySQL for hosting the database online. It is intended for developers or instructors who wish to adapt the backend to use MySQL.

---

## ⚡ Overview of Changes Required

To migrate this project to MySQL, you will need to:

1. Replace the PostgreSQL driver with MySQL
2. Update the database connection configuration
3. Rewrite SQL queries for MySQL compatibility
4. Adjust the database schema (MySQL doesn't support schemas like PostgreSQL)
5. Create equivalent MySQL tables
6. Update `.env` configuration
7. Test all save/load features thoroughly

---

## 🛠️ Step-by-Step Migration

### 1. Install MySQL Driver

Run this in `tactics-backend`:

```bash
npm install mysql2
```

### 2. Replace `db.js` Connection Code

Old PostgreSQL version:

```js
import pkg from "pg";
const { Pool } = pkg;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
```

New MySQL version:

```js
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;
```

### 3. Update SQL Queries

MySQL syntax differs from PostgreSQL:

- No `RETURNING *` in `INSERT`
- Use `AUTO_INCREMENT` instead of `SERIAL`
- Replace double quotes (`"table"`) with backticks (`table`)

#### Example Change:

```sql
-- PostgreSQL
INSERT INTO player (id_field, coordinates, color) VALUES (...) RETURNING *;

-- MySQL
INSERT INTO player (id_field, coordinates, color) VALUES (...);
-- Optional: SELECT LAST_INSERT_ID();
```

### 4. Remove Schema Usage

PostgreSQL uses schemas like `football.player`. MySQL does not.

- Use `player`, `ball`, etc. directly
- Remove all schema prefixes from code

---

## 🗃️ MySQL Table Structure Examples

```sql
CREATE TABLE field (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  description TEXT
);

CREATE TABLE player (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_field INT,
  coordinates VARCHAR(50),
  color VARCHAR(20)
);

CREATE TABLE ball (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_field INT,
  coordinates VARCHAR(50)
);

CREATE TABLE cone (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_field INT,
  coordinates VARCHAR(50),
  color VARCHAR(20)
);

CREATE TABLE line (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_field INT,
  coordinates_start VARCHAR(50),
  coordinates_end VARCHAR(50),
  color VARCHAR(20),
  type_line VARCHAR(20)
);

CREATE TABLE number (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_field INT,
  coordinates VARCHAR(50),
  color VARCHAR(20),
  number INT
);
```

---

## 📂 Update `.env`

```env
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_HOST=your_mysql_host
DB_PORT=3306
DB_DATABASE=tactics
```

---

## 🚫 PostgreSQL Features to Remove

- `RETURNING` clause in queries
- Schema references (`football.`)
- PostgreSQL-specific data types (use `VARCHAR`, `TEXT`, `INT` in MySQL)

---

## ✅ Testing and Verification

Once changes are made:

1. Start the backend with `npm start`
2. Open frontend `index.html`
3. Test saving a field
4. Test loading a field
5. Ensure drag & drop still works

---

## 🌟 Notes

- Use a MySQL-compatible host like [PlanetScale](https://planetscale.com/), [Railway](https://railway.app/), or your own MySQL VPS
- You can migrate existing data manually or export it from pgAdmin and import to MySQL (after conversion)

---
