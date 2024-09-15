import { useState, useEffect } from 'react';
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

  useEffect(() => {
    // Get today's date in NZ time (Pacific/Auckland) and format as YYYY-MM-DD
    const today = new Date();
    const nzDate = today.toLocaleDateString('en-GB', { timeZone: 'Pacific/Auckland' }).split('/').reverse().join('-');
    setDate(nzDate);
  }, []);
  
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, category), {
        title,
        content,
        date,
      });

      // Define categories for reviews and interests
      const reviewCategories = ['makeup', 'lifestyle'];
      const interestCategories = ['formula1', 'cricket', 'music'];

      // Determine the redirect path based on the category
      let redirectPath = '';
      if (reviewCategories.includes(category)) {
        redirectPath = `/reviews/${category}`;
      } else if (interestCategories.includes(category)) {
        redirectPath = `/interests/${category}`;
      } else {
        redirectPath = '/'; // probably will end up being a custom 404 went wrong page
      }
      router.push(redirectPath);
      window.location.reload();
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
            readOnly
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
