'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';

const FeedbackForm = () => {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const searchParams = useSearchParams();
  const postId = searchParams.get('postId');
  const category = searchParams.get('category');

  // Fetch the post title using the category and postId
  useEffect(() => {
    const fetchPostTitle = async () => {
      if (category && postId) {
        const postRef = doc(db, category, postId);
        try {
          const postSnap = await getDoc(postRef);
          if (postSnap.exists()) {
            const postData = postSnap.data();
            setPostTitle(postData.title || 'Unknown Post Title');
          } else {
            console.warn('No such document!', postRef);
            setPostTitle('Unknown Post Title');
          }
        } catch (error) {
          console.error('Error fetching post title:', error);
          setPostTitle('Error fetching title');
        }
      } else {
        console.warn('No category or postId provided.');
      }
    };

    fetchPostTitle();
  }, [category, postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/sendFeedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, message, name, postTitle }),
    });

    if (res.ok) {
      setStatus('Feedback sent!');
      setMessage('');
      setEmail('');
      setName(''); // Reset the name field
    } else {
      setStatus('Error sending feedback.');
    }
  };

  return (
    <div className="blog-home">
      <header className="category-header about-header">
        <div className="category-header-content">
          <span className="section-eyebrow">FEEDBACK</span>
          <h1 className="category-title">Comment</h1>
        </div>
      </header>

      <div className="feedback-content">
        {postId && postTitle && (
          <div className="feedback-post">
            <span className="section-eyebrow">COMMENTING ON</span>
            <p>{postTitle}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="feedback-field">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div className="feedback-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              required
            />
          </div>

          <div className="feedback-field">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your feedback"
              required
            />
          </div>

          <div className="feedback-note">
            <strong>Note:</strong> If you want to send or submit any attachments
            like images or documents, please email them to{' '}
            <a href="mailto:crystal@loglapandover.co.nz">
              crystal@loglapandover.co.nz
            </a>
            . Also refer to the post title (or general feedback if not attached
            to one) in your email so that I can identify which post you are
            referring to, and check your spam if I reply and you don't see it.
            Thank you!
          </div>

          <button type="submit" className="feedback-button">
            Send Feedback
          </button>
        </form>

        {status && (
          <p
            className={`feedback-status ${
              status ===
              'Error sending feedback. Contact crystal@loglapandover.co.nz for assistance.'
                ? 'feedback-status-error'
                : ''
            }`}
          >
            {status}
          </p>
        )}
      </div>
    </div>
  );
};

export default FeedbackForm;
