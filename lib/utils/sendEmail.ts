import * as nodemailer from 'nodemailer';

// Define the type for the sendEmail function parameters
interface EmailOptions {
  to: string;
  subject: string;
  text: string;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NEXT_PUBLIC_BLOG_EMAIL_USER,
    pass: process.env.BLOG_EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, text }: EmailOptions) => {
  await transporter.sendMail({
    from: process.env.NEXT_PUBLIC_BLOG_EMAIL_USER,
    to,
    subject,
    text,
  });
};
