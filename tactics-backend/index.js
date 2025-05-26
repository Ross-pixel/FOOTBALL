import express from 'express';
import cors from 'cors';
import fieldRoutes from './routes/field.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/field', fieldRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
