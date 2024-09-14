import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

interface CreateFormProps {
  category: string;
}

const CreateForm = ({ category }: CreateFormProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, category), {
        title,
        content,
        date,
      });

      // Redirect after successful creation
      router.push(`/interests/${category}`);
    } catch (error) {
      console.error('Error creating document:', error);
      setError('Failed to create document. Please try again.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="create-form">
        <h1 className="create-form-title">Create {category} Post</h1>
        {error && <p className="create-form-error">{error}</p>}
        <div className="mb-4">
          <label htmlFor="title" className="create-form-label">Title:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="create-form-input"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="content" className="create-form-label">Content:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="create-form-textarea"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="date" className="create-form-label">Date:</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="create-form-input"
          />
        </div>
        <button
          type="submit"
          className="create-form-button"
        >
          Create Post
        </button>
      </form>
    </div>
  );
};

export default CreateForm;
