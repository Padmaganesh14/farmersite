const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(`[MULTER] Destination: ${uploadDir}`);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    console.log(`[MULTER] Filename: ${filename}`);
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  console.log(`[MULTER] Received file: ${file.originalname}, mimetype: ${file.mimetype}`);

  // ✅ Allow jfif also
  const allowedTypes = /jpeg|jpg|png|webp|jfif/;

  const ext = path.extname(file.originalname).toLowerCase();
  const extname = allowedTypes.test(ext);

  // ✅ Better mimetype check
  const mimetype = file.mimetype.startsWith('image/');

  if (extname && mimetype) {
    console.log('[MULTER] File accepted');
    cb(null, true);
  } else {
    console.error(`[MULTER] File rejected: ${file.originalname}`);
    cb(new Error('Only images (jpeg, jpg, png, webp, jfif) are allowed!'), false);
  }
};
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

module.exports = upload;
