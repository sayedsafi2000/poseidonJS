const multer = require('multer');
const path = require('path');

/**
 * Configure multer for file uploads
 */
const storage = multer.memoryStorage();

/**
 * File filter for images only
 */
const fileFilter = (req, file, cb) => {
  console.log('File filter check:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    extname: path.extname(file.originalname).toLowerCase()
  });
  
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    console.log('File accepted');
    cb(null, true);
  } else {
    console.log('File rejected - not an image');
    const error = new Error(`Only image files are allowed (jpeg, jpg, png, gif, webp). Received: ${file.mimetype || 'unknown type'}`);
    error.status = 400;
    cb(error, false);
  }
};

/**
 * Multer upload configuration
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = { upload };

