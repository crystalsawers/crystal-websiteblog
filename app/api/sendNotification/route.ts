import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getSubscriberEmails } from '../../../lib/subscriberUtils';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

export async function POST(request: Request) {
  const body = await request.json();
  const { postTitle, postUrl, subscriberEmail, subscriberName } = body;

  // Log for debugging
  console.log('Incoming request:', { postTitle, postUrl, subscriberEmail, subscriberName });

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
  if (postTitle.startsWith('NEW SUBSCRIBER:')) {

    const newSubscriberEmail = body.subscriberEmail;
    const newSubscriberName = body.subscriberName;

    // Notify ADMIN about the new subscriber
    const adminMailOptions = {
        from: process.env.NEXT_PUBLIC_BLOG_EMAIL_USER,
        to: process.env.NEXT_PUBLIC_BLOG_EMAIL_USER, // Admin email
        subject: `New Subscriber: ${newSubscriberName} (${newSubscriberEmail})`,
        text: `A new subscriber has joined: ${newSubscriberName} (${newSubscriberEmail}).`,
      };

    console.log(
      'Sending notification email to admin about new subscriber:',
      newSubscriberName,
      newSubscriberEmail,
    );

    // Send email to the NEW SUBSCRIBER
    const subscriberMailOptions = {
      from: process.env.NEXT_PUBLIC_EMAIL_USER,
      to: newSubscriberEmail, // Send to the new subscriber's email
      subject: `Thank you for subscribing, ${newSubscriberName}!`,
      text: `Hi ${newSubscriberName},\n\nThank you for subscribing! Here is the link to my latest post since you've subscribed to this blog: ${postUrl}`,
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
  if (postTitle.startsWith('NEW POST:')) {
    try {
      // Ensure email sending logic runs once and remove duplicates
      const uniqueEmails = Array.from(new Set(emails));

      const mailOptions = {
        from: process.env.NEXT_PUBLIC_EMAIL_USER,
        bcc: uniqueEmails.join(','), // Use BCC to send one email without exposing addresses
        subject: `${postTitle}`,
        text: `Check out my new post here: ${postUrl}, The name Crystal's Blog has now been changed to Log, Lap and Over, go to https://loglapandover.co.nz/, but it's still the same blog.`,
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

  // If the postTitle does not match any expected values
  return NextResponse.json({
    success: false,
    error: 'Invalid post title',
  });
}
