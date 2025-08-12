import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

import contactRoutes from './routes/contactRoutes';
import identityRoutes from './routes/identityRoutes';
import healthRoutes from './routes/healthRoutes';
import { PORT } from './config/server';

const app = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello World!' });
});

app.use('/api', contactRoutes);
app.use('/api', identityRoutes);
app.use('/api', healthRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
