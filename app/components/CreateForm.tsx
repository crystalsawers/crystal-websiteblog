import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebaseConfig';
import Image from 'next/image';

interface CreateFormProps {
  category: string;
  onClose: () => void;
}

const CreateForm = ({ category, onClose }: CreateFormProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get today's date in NZ time (Pacific/Auckland) and format as YYYY-MM-DD
    const today = new Date();
    const nzDate = today
      .toLocaleDateString('en-GB', { timeZone: 'Pacific/Auckland' })
      .split('/')
      .reverse()
      .join('-');
    setDate(nzDate);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0])); // Preview the image
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setImageUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any previous errors
    setTitleError(null);
    setContentError(null);

    // Validation: Check if title and content are filled
    if (!title.trim()) {
      setTitleError('Title is required.');
    }

    if (!content.trim()) {
      setContentError('Content is required.');
    }

    // If there are errors, stop form submission
    if (!title.trim() || !content.trim()) {
      return;
    }

    try {
      let imageUrl = '';

      // Upload image if file is selected
      if (file) {
        const imageRef = ref(storage, `images/${file.name}`);
        await uploadBytes(imageRef, file);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Add document to Firestore
      await addDoc(collection(db, category), {
        title,
        content,
        date,
        imageUrl,
      });

      // Redirect logic
      const reviewCategories = ['makeup', 'lifestyle'];
      const interestCategories = ['formula1', 'cricket', 'music'];
      let redirectPath = '';

      if (reviewCategories.includes(category)) {
        redirectPath = `/reviews/${category}`;
      } else if (interestCategories.includes(category)) {
        redirectPath = `/interests/${category}`;
      } else {
        redirectPath = '/';
      }

      router.push(redirectPath);
      window.location.reload();
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  return (
    <div className="flex w-full max-w-7xl items-center justify-center p-16">
      <form onSubmit={handleSubmit} className="create-form">
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
        {titleError && <p className="text-red-700">{titleError}</p>}{' '}
        <label htmlFor="content" className="create-form-label">
          Content:
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="create-form-textarea"
        />
        {contentError && <p className="text-red-700">{contentError}</p>}{' '}
        <label htmlFor="date" className="create-form-label">
          Date:
        </label>
        <input
          id="date"
          type="date"
          value={date}
          readOnly
          className="create-form-input"
        />
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
              className="absolute inset-0 h-full w-full"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute right-2 top-2 rounded bg-red-500 p-2 text-white hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        )}
        <div className="mt-6">
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
