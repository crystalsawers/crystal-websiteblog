import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebaseConfig';
import Image from 'next/image';
import { getSubscriberEmails } from '../../lib/firebaseUtils';

interface CreateFormProps {
  category: string;
  onClose: () => void;
  isMainPage?: boolean;
}

const CreateForm = ({
  category,
  onClose,
  isMainPage = false,
}: CreateFormProps) => {
  const reviewCategories = ['misc', 'lifestyle'];
  const interestCategories = ['formula1', 'cricket', 'music'];

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get the current date and time in NZ time (Pacific/Auckland)
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

      const finalCategory = isMainPage ? selectedCategory : category;

      const docRef = await addDoc(collection(db, finalCategory || ''), {
        title,
        content,
        date,
        imageUrl,
        isDraft, // Save whether it's a draft
      });

      if (!isDraft) {
        const subscriberEmails = await getSubscriberEmails();
        const postId = docRef.id;

        const categoryPrefix = reviewCategories.includes(finalCategory || '')
          ? 'reviews'
          : interestCategories.includes(finalCategory || '')
            ? 'interests'
            : '';

        const BASE_URL = 'https://crystal-websiteblog.vercel.app/';

        const postUrl = `${BASE_URL}${categoryPrefix}/${finalCategory || ''}/${postId}`;

        for (const email of subscriberEmails) {
          await fetch('/api/sendNotification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              postTitle: `New Post: ${title}`,
              postUrl: postUrl,
              notificationEmail: email,
            }),
          });
        }
      }

      const redirectPath = finalCategory ? `/${finalCategory}` : '/';
      router.push(redirectPath);
      // window.location.reload();
      onClose();
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  return (
    <div className="flex w-full max-w-7xl items-center justify-center p-4">
      <form onSubmit={(e) => handleSubmit(e, false)} className="create-form">
        <h2 className="create-form-title">Create {category} Post</h2>
        <label htmlFor="title" className="create-form-label">
          Title:
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="create-form-input"
        />
        {titleError && <p className="text-red-700">{titleError}</p>}
        <label htmlFor="content" className="create-form-label">
          Content:
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="create-form-textarea"
        />
        {contentError && <p className="text-red-700">{contentError}</p>}
        <label htmlFor="date" className="create-form-label">
          Date:
        </label>
        <input
          id="date"
          type="datetime-local"
          value={date}
          readOnly
          className="create-form-input"
        />
        {isMainPage && (
          <div>
            <label htmlFor="category" className="create-form-label">
              Category:
            </label>
            <select
              id="category"
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="create-form-input"
            >
              <option value="">Select Category</option>
              <option value="formula1">Formula 1</option>
              <option value="cricket">Cricket</option>
              <option value="music">Music</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="misc">Miscellaneous</option>
            </select>
          </div>
        )}
        <label htmlFor="file" className="create-form-label">
          Image:
        </label>
        <input
          id="file"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="create-form-input"
        />
        {imageUrl && (
          <div className="relative mt-4 h-48 w-full">
            <Image
              src={imageUrl}
              alt="Preview"
              layout="fill"
              objectFit="cover"
              objectPosition="top-center"
              className="h-full w-full"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute right-2 top-2 rounded bg-red-500 p-2 text-white"
            >
              Remove
            </button>
          </div>
        )}
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)} // For saving draft
            className="draft-form-button"
          >
            Save as Draft
          </button>
          <button type="submit" className="create-form-button">
            Create Post
          </button>
        </div>
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Close Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateForm;
