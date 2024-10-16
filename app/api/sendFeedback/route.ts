import { NextResponse } from 'next/server';
import { sendEmail } from '../../../lib/utils/sendEmail';

export async function POST(request: Request) {
  const { email, message, postTitle } = await request.json();

  try {
    // Set the subject based on the presence of postTitle
    const subject = postTitle
      ? `Feedback for Post: ${postTitle}`
      : 'General Feedback';

    await sendEmail({
      to: process.env.NEXT_PUBLIC_BLOG_EMAIL_USER!, // Recipient's email
      subject: subject,
      text: `From: ${email}\n\nMessage: ${message}`,
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
