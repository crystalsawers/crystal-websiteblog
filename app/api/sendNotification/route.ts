import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getSubscriberEmails } from '../../../lib/subscriberUtils';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

export async function POST(request: Request) {
  const { postTitle, postUrl, notificationEmail } = await request.json();

  // Log the incoming data for debugging
  console.log('Incoming request:', { postTitle, postUrl, notificationEmail });

  // Create the transporter for sending emails
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.NEXT_PUBLIC_BLOG_EMAIL_USER,
      pass: process.env.BLOG_EMAIL_PASS,
    },
  });

  // Fetch all subscriber emails
  const emails = await getSubscriberEmails();
  console.log('Fetched subscriber emails:', emails);

  // Check if we have subscribers
  if (emails.length === 0) {
    console.warn('No subscribers found. No emails will be sent.');
    return NextResponse.json({
      success: true,
      message: 'No subscribers found.',
    });
  }

  // Check for new subscriber logic
  if (postTitle.startsWith('New Subscriber:')) {
    const newSubscriberEmail = postTitle.split(': ')[1].trim();

    // Notify admin about the new subscriber
    const adminMailOptions = {
      from: process.env.NEXT_PUBLIC_BLOG_EMAIL_USER,
      to: process.env.NEXT_PUBLIC_BLOG_EMAIL_USER, // Admin email
      subject: `New Subscriber: ${newSubscriberEmail}`,
      text: `A new subscriber has joined: ${newSubscriberEmail}.`,
    };

    console.log(
      'Sending notification email to admin about new subscriber:',
      newSubscriberEmail,
    );

    // Send email to the new subscriber
    const subscriberMailOptions = {
      from: process.env.NEXT_PUBLIC_EMAIL_USER,
      to: newSubscriberEmail, // Send to the new subscriber's email
      subject: `Thank you for subscribing to my blog!`,
      text: `Thank you for subscribing! Here is the link to my latest post after you've subscribed: ${postUrl}`,
    };

    try {
      // Send both emails
      await Promise.all([
        transporter.sendMail(adminMailOptions), // Send notification to admin
        transporter.sendMail(subscriberMailOptions), // Send welcome email to subscriber
      ]);

      console.log(
        `Emails sent successfully: ${newSubscriberEmail} and admin notification.`,
      );
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error sending notification emails:', error.message);
        return NextResponse.json({
          success: false,
          error: 'Error sending notification emails: ' + error.message,
        });
      } else {
        console.error('An unknown error occurred:', error);
        return NextResponse.json({
          success: false,
          error: 'An unknown error occurred.',
        });
      }
    }
  }

  // Handle new post notifications
  if (postTitle.startsWith('New Post:')) {
    try {
      // Ensure email sending logic runs once and remove duplicates
      const uniqueEmails = Array.from(new Set(emails));

      const mailOptions = {
        from: process.env.NEXT_PUBLIC_EMAIL_USER,
        bcc: uniqueEmails.join(','), // Use BCC to send one email without exposing addresses
        subject: `${postTitle}`,
        text: `Check out my new post here: ${postUrl}`,
      };

      // Send a single email to all subs in BCC, this is so no emails are exposed
      await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to all subscribers.`);

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error sending email:', error);
      return NextResponse.json({
        success: false,
        error: 'Error sending email',
      });
    }
  }

  // Handle generic subscription request
  if (postTitle === 'New Subscription') {
    // Prevent sending a welcome email here if a new subscriber was just added
    console.log(
      `Ignoring request for new subscription since it's already handled as a new subscriber: ${notificationEmail}`,
    );
    return NextResponse.json({
      success: false,
      error:
        'This subscription has already been processed as a new subscriber.',
    });
  }

  // If the postTitle does not match any expected values
  return NextResponse.json({
    success: false,
    error: 'Invalid post title',
  });
}
