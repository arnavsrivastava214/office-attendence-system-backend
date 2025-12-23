const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(), // 🔥 IMPORTANT
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

module.exports = upload;
