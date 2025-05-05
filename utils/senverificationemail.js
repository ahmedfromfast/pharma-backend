const nodemailer = require('nodemailer');

const sendeverificationemail = async (email, verificationCode) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification',
        text: `Your verification code is ${verificationCode}`,
        html: `<p>Your verification code is <strong>${verificationCode}</strong></p>`,

    };

    await transporter.sendMail(mailOptions, (error, info) => {

        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

module.exports = sendeverificationemail;


