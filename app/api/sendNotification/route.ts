// /app/api/sendNotification/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer'; 
import { getSubscriberEmails } from '../../../lib/firebaseUtils';

export async function POST(request: Request) {
    const { postTitle, postUrl } = await request.json();

    // Log the incoming data for debugging
    console.log('Incoming request:', { postTitle, postUrl });

    const emails = await getSubscriberEmails(); // Fetch all subscriber emails
    console.log('Fetched subscriber emails:', emails); // Log the fetched emails

    // Check if there are any subscribers
    if (emails.length === 0) {
        console.warn('No subscribers found. No emails will be sent.');
        return NextResponse.json({ success: true, message: 'No subscribers found.' });
    }

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Create an array of email promises
    const emailPromises = emails.map(email => {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Check out my latest post: ${postTitle}`,
            text: `Here is the link to the post: ${postUrl}`,
        };

        // Log the mail options for debugging
        console.log('Sending email to:', email, 'with options:', mailOptions);

        return transporter.sendMail(mailOptions)
            .then(() => {
                console.log(`Email sent successfully to: ${email}`);
            })
            .catch(error => {
                console.error(`Error sending email to ${email}:`, error);
            });
    });

    try {
        await Promise.all(emailPromises); // Send all emails concurrently
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error sending notification emails:', error);
        return NextResponse.json({ success: false, error: 'Error sending notification emails' });
    }
}
