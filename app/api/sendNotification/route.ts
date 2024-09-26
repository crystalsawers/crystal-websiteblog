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

  // Create the transporter for sending emails
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.NEXT_PUBLIC_EMAIL_USER,
      pass: process.env.NEXT_PUBLIC_EMAIL_PASS,
    },
  });

  // Check if we have subscribers
  if (emails.length === 0) {
    console.warn('No subscribers found. No emails will be sent.');
    return NextResponse.json({
      success: true,
      message: 'No subscribers found.',
    });
  }

  // Only one email sending logic for new subscriptions
  if (postTitle.startsWith("New Subscriber:")) {
    const newSubscriberEmail = postTitle.split(': ')[1];

    // Send email to the new subscriber
    const subscriberMailOptions = {
      from: process.env.NEXT_PUBLIC_EMAIL_USER,
      to: newSubscriberEmail, // Send to the new subscriber's email
      subject: `Welcome to our newsletter!`,
      text: `Thank you for subscribing! Here is the link to our latest post: ${postUrl}`,
    };

    console.log('Sending email to new subscriber:', newSubscriberEmail);
    
    // Notify admin about the new subscriber
    const adminMailOptions = {
      from: process.env.NEXT_PUBLIC_EMAIL_USER,
      to: process.env.NEXT_PUBLIC_EMAIL_USER, // Admin email
      subject: `New Subscriber: ${newSubscriberEmail}`,
      text: `A new subscriber has joined: ${newSubscriberEmail}.`,
    };

    console.log('Sending notification email to admin about new subscriber:', newSubscriberEmail);

    // Send both emails
    try {
      await Promise.all([
        transporter.sendMail(subscriberMailOptions),
        transporter.sendMail(adminMailOptions),
      ]);

      console.log(`Emails sent successfully: ${newSubscriberEmail} and admin notification.`);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error sending notification emails:', error);
      return NextResponse.json({
        success: false,
        error: 'Error sending notification emails',
      });
    }
  }

  // If it's a generic subscription request
  if (postTitle === "New Subscription") {
    const subscriptionMailOptions = {
      from: process.env.NEXT_PUBLIC_EMAIL_USER,
      to: notificationEmail, // This should be the email of the person subscribing
      subject: `Thank you for subscribing!`,
      text: `Here is the link to our latest post: ${postUrl}`,
    };

    console.log('Sending email to subscriber:', notificationEmail);

    try {
      await transporter.sendMail(subscriptionMailOptions);
      console.log(`Subscription email sent to: ${notificationEmail}`);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error sending subscription email:', error);
      return NextResponse.json({
        success: false,
        error: 'Error sending subscription email',
      });
    }
  }

  // If the postTitle does not match any expected values
  return NextResponse.json({
    success: false,
    error: 'Invalid post title',
  });
}
