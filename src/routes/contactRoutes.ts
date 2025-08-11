import express from 'express';
import { getAllContacts } from '../controllers/contactController';

const router = express.Router();

router.get('/contacts', getAllContacts);

export default router;
