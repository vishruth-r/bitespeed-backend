import { Request, Response } from 'express';
import { supabase } from '../db/supabase';

export const getAllContacts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase.from('contact').select('*');
    
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    
    res.json(data);
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
