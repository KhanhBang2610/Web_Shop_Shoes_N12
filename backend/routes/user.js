const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');

// Cấu hình multer tạm tại đây hoặc import từ file config chung
const upload = multer({ dest: 'uploads/' });

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, upload.single('avatar'), userController.updateProfile);

module.exports = router;