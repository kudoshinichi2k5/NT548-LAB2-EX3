require('dotenv').config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport( 
    {
        secure: true,
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    }
);

async function sendOtpEmail(to, otpCode) {
    try {
        await transporter.sendMail({
            to: to,
            subject: "KitchenWhiz - Your OTP Code",
            text: `Your OTP Code is ${otpCode}. It will expire in 5 minutes.`
        });
        console.log('OTP email sent successfully');
    }
    catch (error) {
        console.error('Error sending OTP email:', error);
    }
    
}

async function sendMail(to, sub, msg) {
    await transporter.sendMail({
        to: to,
        subject: sub,
        html: msg
    });
}

module.exports = sendOtpEmail;