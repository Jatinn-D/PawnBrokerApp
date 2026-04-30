import express from 'express';
import multer from 'multer';
import { supabase } from '../lib/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { folder = 'general' } = req.body;
    const ext = req.file.originalname.split('.').pop();
    const filename = `${req.user.id}/${folder}/${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('vaulta-uploads')
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('vaulta-uploads')
      .getPublicUrl(filename);

    res.json({ url: urlData.publicUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
