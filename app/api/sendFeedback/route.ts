import { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '../../../lib/utils/sendEmail';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, message, postId } = req.body;

    try {
      await sendEmail({
        to: 'crystal.websiteblog@gmail.com',
        subject: postId ? `Feedback for Post ID: ${postId}` : 'General Feedback',
        text: `From: ${email}\n\nMessage: ${message}`,
      });
      res.status(200).json({ message: 'Feedback sent' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send feedback' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
