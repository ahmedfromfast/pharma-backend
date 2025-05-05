const Report = require('../models/reports');
const { validationResult } = require('express-validator');

// Create a new report
exports.createReport = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, category } = req.body;
        
        const newReport = new Report({
            title,
            description,
            category,
            createdBy: req.user.id,
            status: 'pending' // Initial status
        });

        const savedReport = await newReport.save();
        res.status(201).json({ 
            message: 'Report submitted successfully',
            report: savedReport,
            statusMessage: 'Your report has been received and is under review'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all reports (for admin)
exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('createdBy', 'fullName email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Reports retrieved successfully',
            count: reports.length,
            reports
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user's own reports
exports.getMyReports = async (req, res) => {
    try {
        const reports = await Report.find({ createdBy: req.user.id })
            .sort({ createdAt: -1 });

        if (reports.length === 0) {
            return res.status(200).json({ 
                message: 'You have no submitted reports',
                reports: []
            });
        }

        res.status(200).json({
            message: 'Your reports retrieved successfully',
            count: reports.length,
            reports
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single report
exports.getReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate('createdBy', 'fullName email');

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Check if user owns the report or is admin
        if (report.createdBy._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this report' });
        }

        // Generate appropriate status message
        let statusMessage;
        switch(report.status) {
            case 'pending':
                statusMessage = 'Your report is currently under review';
                break;
            case 'in_progress':
                statusMessage = 'We are currently working on your report';
                break;
            case 'resolved':
                statusMessage = 'Your report has been resolved';
                break;
            case 'rejected':
                statusMessage = 'Your report has been reviewed but not accepted';
                break;
            default:
                statusMessage = 'Report status: ' + report.status;
        }

        res.status(200).json({
            message: 'Report retrieved successfully',
            report,
            statusMessage
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update report status (admin only)
exports.updateReportStatus = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { status, adminComments } = req.body;
        
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Generate appropriate response message
        let responseMessage;
        switch(status) {
            case 'in_progress':
                responseMessage = 'Report status updated to "In Progress"';
                break;
            case 'resolved':
                responseMessage = 'Report marked as resolved';
                break;
            case 'rejected':
                responseMessage = 'Report has been rejected';
                break;
            default:
                responseMessage = 'Report status updated';
        }

        report.status = status;
        if (adminComments) report.adminComments = adminComments;
        report.updatedAt = new Date();

        const updatedReport = await report.save();

        res.status(200).json({
            message: responseMessage,
            report: updatedReport,
            statusMessage: `Report is now ${status.replace('_', ' ')}`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get report status
exports.getReportStatus = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .select('status updatedAt adminComments');

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Check if user owns the report or is admin
        if (report.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this report' });
        }

        let statusMessage;
        switch(report.status) {
            case 'pending':
                statusMessage = 'Your report is in queue for review. Please check back later.';
                break;
            case 'in_progress':
                statusMessage = 'We are currently processing your report. It will be available soon.';
                break;
            case 'resolved':
                statusMessage = 'Your report has been processed and resolved.';
                break;
            case 'rejected':
                statusMessage = 'Your report could not be processed. ' + 
                               (report.adminComments || 'No additional comments provided.');
                break;
            default:
                statusMessage = 'Report status: ' + report.status;
        }

        res.status(200).json({
            message: 'Report status retrieved',
            status: report.status,
            lastUpdated: report.updatedAt,
            statusMessage,
            ...(report.adminComments && { adminComments: report.adminComments })
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};