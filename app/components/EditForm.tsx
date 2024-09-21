import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../lib/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../components/AuthContext';
import Image from 'next/image';

interface EditFormProps {
  category: string;
  postId: string;
  initialData: {
    type: string;
    title?: string;
    content: string;
    date?: string;
    imageUrl?: string;
  };
  onClose: () => void;
}

const EditForm = ({
  category,
  postId,
  initialData,
  onClose,
}: EditFormProps) => {
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState(initialData.title || '');
  const [content, setContent] = useState(initialData.content);
  const [imageUrl, setImageUrl] = useState(initialData.imageUrl || '');
  const [file, setFile] = useState<File | null>(null);

  const [titleError, setTitleError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0])); // Preview the image
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setImageUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    // Clear previous errors
    setTitleError(null);
    setContentError(null);

    // Validation: Check if title and content are filled
    if (!title.trim()) {
      setTitleError('Title is required.');
    }
    if (!content.trim()) {
      setContentError('Content is required.');
    }

    // Stop form submission if there are validation errors
    if (!title.trim() || !content.trim()) {
      return;
    }

    try {
      const docRef = doc(db, category, postId);
      let newImageUrl = imageUrl;

      // Upload new image if file is selected
      if (file) {
        const imageRef = ref(storage, `images/${file.name}`);
        await uploadBytes(imageRef, file);
        newImageUrl = await getDownloadURL(imageRef);
      }

      await updateDoc(docRef, {
        title,
        content,
        imageUrl: newImageUrl,
        editedDate: new Date().toISOString(), // Update edited date here
      });

      window.location.reload();
      onClose();
    } catch (error) {
      console.error('Error updating document:', error);
      setError('Failed to update post.');
    }
  };

  return (
    <div className="flex w-full max-w-7xl items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="create-form">
        <h2 className="create-form-title">Edit Post</h2>
        {error && <p className="create-form-error">{error}</p>}

        <label className="create-form-label" htmlFor="title">
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

        <label className="create-form-label" htmlFor="content">
          Content:
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="create-form-textarea"
        />
        {contentError && <p className="text-red-700">{contentError}</p>}

        <label className="create-form-label" htmlFor="file">
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
            Update Post
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

export default EditForm;
