const Medicine = require('../models/medicine');

exports.createMedicine = async (req, res) => {

    try {
        const { name, description, price, stock, requiresPrescription } = req.body;
        const image = req.file ? req.file.filename : null

        const newMedicine = new Medicine({
            name,
            description,
            price,
            stock,
            requiresPrescription,
            image
        });

        await newMedicine.save();
        res.status(201).json({ message: 'Medicine created', newMedicine });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating medicine' });
    }
}
exports.getAllMedicines = async (req, res) => {
    try {
        const medicines = await Medicine.find();
        res.status(200).json(medicines);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching medicines' });
    }
};
exports.getMedicineById = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
        res.status(200).json(medicine);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching medicine' });
    }
};
exports.updateMedicine = async (req, res) => {
    try {
        const { name, description, price, stock, requiresPrescription } = req.body;
        const medicine = await Medicine.findById(req.params.id);

        if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

        medicine.name = name || medicine.name;
        medicine.description = description || medicine.description;
        medicine.price = price || medicine.price;
        medicine.stock = stock || medicine.stock;
        medicine.requiresPrescription = requiresPrescription !== undefined ? requiresPrescription : medicine.requiresPrescription;

        if (req.file) {
            medicine.image = req.file.filename;
        }

        await medicine.save();
        res.status(200).json({ message: 'Medicine updated', medicine });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating medicine' });
    }
};
exports.deleteMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findByIdAndDelete(req.params.id);
        if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

        res.status(200).json({ message: 'Medicine deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting medicine' });
    }
};
exports.updateStock = async (req, res) => {
    const { id } = req.params;
    const { action } = req.body;

    try {
        const medicine = await Medicine.findById(id);
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        if (action === 'increase') {
            medicine.stock += 1;
        } else if (action === 'decrease') {
            medicine.stock = Math.max(0, medicine.stock - 1); // don't allow negative stock
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        await medicine.save();
        res.status(200).json({ message: 'Stock updated', medicine });
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ message: 'Server error' });
    }
};