'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebaseConfig';
import Image from 'next/image';
import { getSubscriberEmails } from '@/lib/firebaseUtils';

const CreatePost = () => {
  const reviewCategories = useMemo(() => ['misc', 'lifestyle'], []);
  const interestCategories = useMemo(
    () => ['formula1', 'cricket', 'music'],
    [],
  );

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const router = useRouter();

  useEffect(() => {
    // Handle the current date formatting to be in the right format
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Pacific/Auckland',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    const nzDateTime = today.toLocaleString('en-GB', options);
    const [datePart, timePart] = nzDateTime.split(', ');

    const formattedDate = datePart.split('/').reverse().join('-');
    const formattedDateTime = `${formattedDate}T${timePart}:00`;

    setDate(formattedDateTime);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setImageUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();

    setTitleError(null);
    setContentError(null);

    if (!title.trim()) {
      setTitleError('Title is required.');
    }

    if (!content.trim()) {
      setContentError('Content is required.');
    }

    if (!title.trim() || !content.trim()) {
      return;
    }

    try {
      let imageUrl = '';

      if (file) {
        const imageRef = ref(storage, `images/${file.name}`);
        await uploadBytes(imageRef, file);
        imageUrl = await getDownloadURL(imageRef);
      }

      const finalCategory = selectedCategory || 'misc';

      const docRef = await addDoc(collection(db, finalCategory), {
        title,
        content,
        date,
        imageUrl,
        isDraft,
      });

      if (!isDraft) {
        const subscriberEmails = await getSubscriberEmails();
        const postId = docRef.id;

        const categoryPrefixFromPath = reviewCategories.includes(finalCategory)
          ? 'reviews'
          : interestCategories.includes(finalCategory)
            ? 'interests'
            : '';

        const BASE_URL = 'https://crystalsawers.co.nz/';
        const postUrl = `${BASE_URL}${categoryPrefixFromPath}/${finalCategory}/${postId}`;

        // Send all subscriber emails in one API call
        await fetch('/api/sendNotification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postTitle: `New Post: ${title}`,
            postUrl,
            notificationEmails: subscriberEmails, // Send all emails at once
          }),
        });
      }

      router.push('/');
      window.location.href = '/';
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  return (
    <div className="create-post-page">
      <div className="create-post-form">
        <h2 className="create-post-title">Create Post</h2>

        <form onSubmit={(e) => handleSubmit(e, false)}>
          <div className="mb-6">
            <label htmlFor="title" className="create-post-label">
              Title:
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="create-post-input"
            />
            {titleError && (
              <p className="create-post-input-error">{titleError}</p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="content" className="create-post-label">
              Content:
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="create-post-textarea"
            />
            {contentError && (
              <p className="create-post-textarea-error">{contentError}</p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="category" className="create-post-label">
              Category:
            </label>
            <select
              id="category"
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="create-post-category-select"
            >
              <option value="">Select Category</option>
              <option value="formula1">Formula 1</option>
              <option value="cricket">Cricket</option>
              <option value="music">Music</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="misc">Miscellaneous</option>
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="file" className="create-post-label">
              Image:
            </label>
            <div className="create-post-file-input-container">
              <input
                id="file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="create-post-input"
              />
              <span className="file-placeholder">
                {file ? file.name : 'No file selected'}
              </span>
            </div>

            {imageUrl && (
              <div className="create-post-image-preview">
                <Image
                  src={imageUrl}
                  alt="Preview"
                  layout="fill"
                  objectFit="cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="create-post-remove-button"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="create-post-button-group mt-6">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              className="create-post-button"
            >
              Create Post
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="create-post-draft-button"
            >
              Save as Draft
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
