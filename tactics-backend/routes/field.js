import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const data = {
      field: null,
      player: [],
      ball: [],
      cone: [],
      line: [],
      number: []
    };

    const fieldRes = await pool.query('SELECT * FROM football.field WHERE id = $1', [id]);
    if (fieldRes.rows.length > 0) {
      data.field = fieldRes.rows[0];
    }

    const tables = ['player', 'ball', 'cone', 'line', 'number'];
    for (const table of tables) {
      const result = await pool.query(`SELECT * FROM football.${table} WHERE id_field = $1`, [id]);
      data[table] = result.rows;
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Virhe kentän latauksessa');
  }
});

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM football.field ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Virhe kenttäluettelossa');
  }
});

router.post('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body;

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(`
        INSERT INTO football.field (id, name, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name, description = EXCLUDED.description
      `, [id, data.field.name, data.field.description]);

      const tables = ['player', 'ball', 'cone', 'line', 'number'];
      for (const table of tables) {
        await client.query(`DELETE FROM football.${table} WHERE id_field = $1`, [id]);
      }

      for (const table of tables) {
        const entries = data[table] || [];
        for (const entry of entries) {
          const keys = Object.keys(entry);
          const values = Object.values(entry);
          const columns = keys.join(',');
          const placeholders = keys.map((_, i) => `$${i + 1}`).join(',');
          await client.query(`INSERT INTO football.${table} (${columns}) VALUES (${placeholders})`, values);
        }
      }

      await client.query('COMMIT');
      res.sendStatus(200);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Virhe kentän tallennuksessa');
  }
});

export default router;
