# Tactics Field Editor

A browser-based tactical SVG editor for designing football/soccer field strategies. Built with pure HTML/CSS/JavaScript on the frontend and Node.js + PostgreSQL backend.

GitHub Repository: [https://github.com/Ross-pixel/FOOTBALL](https://github.com/Ross-pixel/FOOTBALL)

---

## 📊 Project Overview

This web application allows users to:

- Draw and manage objects on a football field (players, ball, cones, lines, numbers)
- Save and load fields from a PostgreSQL database
- Move, delete, and highlight objects
- Create different line types (straight, dashed, zigzag)

## ⚡ Requirements

- Node.js (>= 16)
- PostgreSQL (version >= 12 recommended)
- pgAdmin (optional, for DB UI)
- Browser (Chrome or Firefox recommended)

---

## 🛠️ Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Ross-pixel/FOOTBALL.git
cd FOOTBALL
```

### 2. Install Backend Dependencies

```bash
cd tactics-backend
npm install
```

### 3. Setup Environment Variables

Create a `.env` file inside `tactics-backend`:

```
PGUSER=your_username
PGPASSWORD=your_password
PGHOST=localhost
PGPORT=5432
PGDATABASE=tactics
```

### 4. Setup PostgreSQL Database

1. Create database `tactics`
2. Open `pgAdmin`
3. Create schema `football`
4. Import the SQL file:

   - `Football-1748168330.sql`

### 5. Run Backend Server

```bash
npm start
```

Server runs at: `http://localhost:3000`

### 6. Open Frontend

Simply open `index.html` in your browser (double-click or serve via Live Server)

---

## 🗃️ Database Structure

All tables reside in schema `football`:

- `field` (id, name, description)
- `player` (id_field, coordinates, color)
- `ball` (id_field, coordinates)
- `cone` (id_field, coordinates, color)
- `line` (id_field, coordinates_start, coordinates_end, color, type_line)
- `number` (id_field, coordinates, color, number)

Each field saves all related elements (1\:n relation).

---

# Taktinen kenttäeditori (Suomeksi)

Verkkopohjainen SVG-editori jalkapallotaktiikoiden piirtämiseen. Frontend: HTML/CSS/JS. Backend: Node.js + PostgreSQL.

---

## 📊 Projektin kuvaus

Sovelluksella voi:

- Piirtää ja hallita kohteita kentällä (pelaajat, pallo, kartiot, viivat, numerot)
- Tallentaa ja ladata kenttiä tietokannasta
- Siirtää, poistaa ja valita objekteja
- Piirtää suoria, katkoviivoja ja siksak-viivoja

---

## ⚡ Vaatimukset

- Node.js (vähintään 16)
- PostgreSQL (suositus vähintään 12)
- pgAdmin (valinnainen)
- Selain (Chrome tai Firefox)

---

## 🛠️ Asennus ja käyttöönotto

### 1. Kloonaa projekti

```bash
git clone https://github.com/Ross-pixel/FOOTBALL.git
cd FOOTBALL
```

### 2. Asenna backendin riippuvuudet

```bash
cd tactics-backend
npm install
```

### 3. Luo .env-tiedosto

```
PGUSER=oma_kayttaja
PGPASSWORD=salasana
PGHOST=localhost
PGPORT=5432
PGDATABASE=tactics
```

### 4. Tietokannan perustaminen

1. Luo tietokanta `tactics`
2. Avaa `pgAdmin`
3. Luo skeema `football`
4. Tuo SQL-tiedosto:

   - `Football-1748168330.sql`

### 5. Käynnistä backend

```bash
npm start
```

Backend toimii osoitteessa: `http://localhost:3000`

### 6. Avaa frontend

Avaa `index.html` selaimessa

---

## 🗃️ Tietokannan rakenne

Kaikki taulut sijaitsevat skeemassa `football`:

- `field`, `player`, `ball`, `cone`, `line`, `number`

---

# Тактический редактор (Русский)

SVG-редактор для создания тактических схем на футбольном поле. Фронтенд — HTML/CSS/JS, бэкенд — Node.js + PostgreSQL.

---

## 📊 Описание проекта

Позволяет:

- Рисовать игроков, мяч, конусы, линии и цифры
- Сохранять и загружать поля из базы данных
- Перемещать, удалять и выделять объекты
- Создавать разные типы линий (прямые, пунктирные, зигзаги)

---

## ⚡ Требования

- Node.js (не ниже 16)
- PostgreSQL (12 и выше)
- pgAdmin (опционально)
- Браузер (рекомендуется Chrome или Firefox)

---

## 🛠️ Установка и запуск

### 1. Клонируй репозиторий

```bash
git clone https://github.com/Ross-pixel/FOOTBALL.git
cd FOOTBALL
```

### 2. Установи зависимости для backend

```bash
cd tactics-backend
npm install
```

### 3. Создай файл `.env`

```
PGUSER=твой_логин
PGPASSWORD=твой_пароль
PGHOST=localhost
PGPORT=5432
PGDATABASE=tactics
```

### 4. Подключи базу данных

1. Создай БД `tactics`
2. Открой `pgAdmin`
3. Создай схему `football`
4. Импортируй `Football-1748168330.sql`

### 5. Запусти сервер

```bash
npm start
```

Сервер будет доступен на `http://localhost:3000`

### 6. Открой фронтенд

Просто открой `index.html` в браузере

---

## 🗃️ Структура базы данных

Схема: `football`

- `field`, `player`, `ball`, `cone`, `line`, `number`

---

## 🌟 Authors

Powered by Ross-pixel & Irina Frolova.
