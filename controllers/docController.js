const User = require("../models/user")
const Doc = require("../models/doctor")

exports.registerDoctor = async (req, res) => {
    try {
        const { specialization, qualifications, experience,licenseNumber } = req.body;
        const UserId = req.user.id;
        const existingDoctor = await Doc.findOne({ user: UserId });
        if (existingDoctor) {
            return res.status(400).json({ message: 'You have already registered as a doctor' });
        }
        const doctor = new Doc({
            user: UserId,
            specialization,
            qualifications,
            experience,
            licenseNumber,
        })
        await doctor.save();

        await User.findByIdAndUpdate(UserId, { role: 'doctor' });

        res.status(201).json("Doctor Added Succesfuly waiating for approval")
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}
exports.getApprovedDoctors = async (req, res) => {
    try {
        const doctors = await Doc.find({ isApproved: true }).populate('user', 'name email profile.avatar').exec();
        const doctorDetails = doctors.map(doc => {
            return {
                _id: doc._id,
                name: doc.user.name,           
                email: doc.user.email,         
                specialization: doc.specialization,        
                licenseNumber: doc.licenseNumber,
                avatar:doc.user.profile.avatar
            };
        });
        res.status(200).json(doctorDetails);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getUnApprovedDoctors = async (req, res) => {
    try {
        const doctors = await Doc.find({ isApproved: false })
            .populate('user', 'name email')  
            .exec();
        
        const doctorDetails = doctors.map(doc => {
            return {
                _id: doc._id,
                name: doc.user.name,           
                email: doc.user.email,         
                specialization: doc.specialization,        
                licenseNumber: doc.licenseNumber || "abc"
            };
        });

        res.status(200).json(doctorDetails);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.approveDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;
        await Doc.findByIdAndUpdate(doctorId, { isApproved: true });
        res.status(200).json({ message: 'Doctor approved' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' });
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};