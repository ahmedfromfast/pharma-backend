const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // Your JWT middleware
const profileController = require('../controllers/prfController');
const upload = require("../middleware/uploadimg")

router.get('/', auth, profileController.getProfile);
router.put('/', auth, profileController.updateProfile);
router.delete('/', auth, profileController.deleteProfile);
router.post('/upload-avatar',auth, upload.single('avatar'), profileController.uploadAvatar);
router.get('/address', auth, profileController.getUserAddress);
router.post('/address', auth,profileController.updateUserAddress);
module.exports = router;
