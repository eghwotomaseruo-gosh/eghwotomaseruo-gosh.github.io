import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Alias route for uploaded file references and exact profile serving
app.get(['/seruo-profile.jpg', '/seruo-profile.png', '/file_0000000036008210acd002c9476c569e.png', '/profile.png', '/profile.jpg'], (req, res) => {
  res.set('Cache-Control', 'no-cache, must-revalidate');
  res.sendFile(join(__dirname, 'seruo-profile.jpg'));
});

// Profile photo upload endpoint - handles raw binary and base64 JSON
app.post('/api/upload-profile', express.raw({ type: ['image/*', 'application/octet-stream'], limit: '25mb' }), express.json({ limit: '25mb' }), async (req, res) => {
  try {
    const fs = await import('fs');
    if (Buffer.isBuffer(req.body)) {
      fs.writeFileSync(join(__dirname, 'seruo-profile.jpg'), req.body);
    } else if (req.body && req.body.image) {
      const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(join(__dirname, 'seruo-profile.jpg'), Buffer.from(base64Data, 'base64'));
    }
    res.json({ ok: true, message: 'Profile photo updated successfully' });
  } catch (err) {
    console.error('Failed to save profile photo:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening at http://0.0.0.0:${PORT}`);
});
