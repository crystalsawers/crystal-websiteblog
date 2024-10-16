import { NextResponse } from 'next/server';
import { sendEmail } from '../../../lib/utils/sendEmail';

export async function POST(request: Request) {
  const { email, message, postTitle, name } = await request.json();

  try {
    const subject = postTitle
      ? `Feedback for Post: ${postTitle}`
      : 'General Feedback';

    await sendEmail({
      to: process.env.NEXT_PUBLIC_BLOG_EMAIL_USER!,
      subject: subject,
      text: `From: ${name} <${email}>\n\nMessage: ${message}`,
      replyTo: email,
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
