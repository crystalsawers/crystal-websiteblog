import { NextResponse } from 'next/server';
import { sendEmail } from '../../../lib/utils/sendEmail';

export async function POST(request: Request) {
  const { email, message, postId } = await request.json();


  try {
    // Modify the email subject and body to include postId
    await sendEmail({
      to: process.env.NEXT_PUBLIC_BLOG_EMAIL_USER!, // Recipient's email
      subject: postId ? `Feedback for Post: ${postId}` : 'General Feedback',
      text: `From: ${email}\n\nMessage: ${message}\n\nPost ID: ${postId || 'Not provided'}`,
      replyTo: email, // User's email for reply
    });

    return NextResponse.json(
      { message: 'Feedback sent successfully!' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error sending feedback:', error);
    return NextResponse.json(
      { error: 'Failed to send feedback.' },
      { status: 500 },
    );
  }
}
