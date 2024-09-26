// testEmail.ts
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'icefiretiramisu@gmail.com', // Change this to a valid email
    subject: 'Test Email',
    text: 'This is a test email from nodemailer.',
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(`Error: ${error}`);
    }
    console.log(`Email sent: ${info.response}`);
});
