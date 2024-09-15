import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import { useAuth } from '../components/AuthContext';


interface EditFormProps {
  category: string; 
  postId: string;
  initialData: {
    type: string;
    title?: string;
    content: string;
    date?: string;
  };
  onClose: () => void;
}

const EditForm = ({ category, postId, initialData, onClose }: EditFormProps) => {
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState(initialData.title || '');
  const [content, setContent] = useState(initialData.content);
  const [error, setError] = useState<string | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    try {
      const docRef = doc(db, category, postId);
      await updateDoc(docRef, { title, content });
      window.location.reload();
      onClose();
    } catch (error) {
      console.error('Error updating document:', error);
      setError('Failed to update post.');
    }
  };

  return (
    <div className="w-full w-full max-w-7xl p-16 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="create-form">
        <h2 className="create-form-title">Edit Post</h2>
        {error && <p className="create-form-error">{error}</p>}
        <label className="create-form-label" htmlFor="title">Title:</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="create-form-input"
        />
        <label className="create-form-label" htmlFor="content">Content:</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="create-form-textarea"
        />
        <div className="mt-6">
          <button type="submit" className="create-form-button">Update Post</button>
        </div>
        <div className="flex justify-center mt-4">
          <button 
            type="button" 
            onClick={onClose}
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Close Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditForm;
