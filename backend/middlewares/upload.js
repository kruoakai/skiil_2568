const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => {
    const unique = 'std-it-' + Date.now() + path.extname(file.originalname);
    cb(null, unique);
  }
});

module.exports = multer({ storage });
