# Tactics Backend

## Käyttöohje

1. Aja PostgreSQL ja luo tietokanta `tactics`
2. Suorita SQL-tiedosto (taulut `field`, `player`, jne) skeemaan `football`
3. Aseta `.env`-tiedosto ympäristömuuttujineen
4. Asenna riippuvuudet ja käynnistä palvelin:

```bash
npm install
npm start
```

API toimii osoitteessa:
- GET /api/field/:id
- POST /api/field/:id
- GET /api/field/ (luettelo kentistä)
