import * as nodemailer from 'nodemailer';

interface EmailOptions {
  to: string; // Recipient's email
  subject: string;
  text: string;
  replyTo?: string; // Optional: User's email for reply
}

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NEXT_PUBLIC_BLOG_EMAIL_USER, // This is the recipient's email
    pass: process.env.BLOG_EMAIL_PASS, // Password for the recipient's email
  },
});

export const sendEmail = async ({
  to,
  subject,
  text,
  replyTo,
}: EmailOptions) => {
  await transporter.sendMail({
    from: replyTo || process.env.NEXT_PUBLIC_BLOG_EMAIL_USER!, // Use user's email or fallback to recipient's email
    to,
    subject,
    text,
    replyTo, // Include replyTo if provided
  });
};
