const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  allowed.test(path.extname(file.originalname).toLowerCase())
    ? cb(null, true)
    : cb(new Error('Only image files are allowed'));
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });
