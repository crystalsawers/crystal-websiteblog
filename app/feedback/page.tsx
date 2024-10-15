'use client';
import { useState } from 'react';

const FeedbackForm = () => {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/sendFeedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, message }),
    });

    if (res.ok) {
      setStatus('Feedback sent!');
      setMessage('');
      setEmail('');
    } else {
      setStatus('Error sending feedback.');
    }
  };

  return (
    <div className="create-form mx-auto w-full max-w-lg rounded-lg bg-emerald-500 p-6 shadow-md">
      <h2 className="create-form-title mb-4 text-2xl font-bold text-gray-100">
        Feedback Form
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <label
          className="create-form-label mb-1 text-sm font-medium text-gray-200"
          htmlFor="email"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          required
          className="create-form-input w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label
          className="create-form-label mb-1 text-sm font-medium text-gray-200"
          htmlFor="message"
        >
          Message
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your feedback"
          required
          className="create-form-textarea h-32 w-full rounded-lg border border-gray-300 px-4 py-3 font-medium text-black shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        />

        <button type="submit" className="login-card-button">
          Send Feedback
        </button>
      </form>
      {status && (
        <p
          className={`text-bold mt-4 text-center ${
            status === 'Error sending feedback.' ? 'text-red-500' : 'text-white'
          }`}
        >
          {status}
        </p>
      )}
    </div>
  );
};

export default FeedbackForm;
