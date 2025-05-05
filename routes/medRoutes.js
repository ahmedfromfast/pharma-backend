const medController = require('../controllers/medController');
const uploads = require('../middleware/upload');
const express = require('express');
const router = express.Router();

router.post('/create',uploads.single('image') , medController.createMedicine);
router.get('/', medController.getAllMedicines);
router.get('/:id', medController.getMedicineById);
router.delete('/delete/:id', medController.deleteMedicine);
router.put('/update/:id', uploads.single('image'), medController.updateMedicine);
router.put('/updateStock/:id', medController.updateStock);

module.exports = router;
