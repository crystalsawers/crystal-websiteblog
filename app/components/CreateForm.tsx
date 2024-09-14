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
      console.log('Submitting data to category:', category);
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
    <form onSubmit={handleSubmit}>
      <h1>Create {category} Post</h1>
      {error && <p className="error">{error}</p>}
      <label>
        Title:
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label>
        Content:
        <textarea value={content} onChange={(e) => setContent(e.target.value)} required />
      </label>
      <label>
        Date:
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <button type="submit">Create Post</button>
    </form>
  );
};

export default CreateForm;
