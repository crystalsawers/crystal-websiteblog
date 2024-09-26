import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getSubscriberEmails } from '../../../lib/firebaseUtils';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

export async function POST(request: Request) {
  const { postTitle, postUrl, notificationEmail } = await request.json();

  // Log the incoming data for debugging
  console.log('Incoming request:', { postTitle, postUrl, notificationEmail });

  const emails = await getSubscriberEmails(); // Fetch all subscriber emails
  console.log('Fetched subscriber emails:', emails);

  // Check if there are any subscribers
  if (emails.length === 0) {
    console.warn('No subscribers found. No emails will be sent.');
    return NextResponse.json({
      success: true,
      message: 'No subscribers found.',
    });
  }

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.NEXT_PUBLIC_EMAIL_USER,
      pass: process.env.NEXT_PUBLIC_EMAIL_PASS,
    },
  });

  // Send notification email to subscribers about the new post
  const emailPromises = emails.map((email) => {
    const mailOptions = {
      from: process.env.NEXT_PUBLIC_EMAIL_USER,
      to: email,
      subject: `Check out my latest post: ${postTitle}`, // Use the new post title
      text: `Here is the link to the post: ${postUrl}`,
    };

    console.log('Sending email to:', email, 'with options:', mailOptions);

    return transporter
      .sendMail(mailOptions)
      .then(() => {
        console.log(`Email sent successfully to: ${email}`);
      })
      .catch((error) => {
        console.error(`Error sending email to ${email}:`, error);
      });
  });

  // If the notificationEmail is provided, send a notification to the admin about a new subscriber
  if (notificationEmail) {
    const notificationMailOptions = {
      from: process.env.NEXT_PUBLIC_EMAIL_USER,
      to: process.env.NEXT_PUBLIC_EMAIL_USER, // Admin email to receive notifications
      subject: `New Subscriber: ${notificationEmail}`,
      text: `A new subscriber has joined with the email: ${notificationEmail}`,
    };

    await transporter
      .sendMail(notificationMailOptions)
      .then(() => {
        console.log(`Notification email sent for new subscriber: ${notificationEmail}`);
      })
      .catch((error) => {
        console.error(`Error sending notification email for ${notificationEmail}:`, error);
      });
  }

  try {
    await Promise.all(emailPromises);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending notification emails:', error);
    return NextResponse.json({
      success: false,
      error: 'Error sending notification emails',
    });
  }
}
