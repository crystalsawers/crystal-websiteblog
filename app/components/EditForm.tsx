import { useState } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, storage } from '../../lib/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../components/AuthContext';
import Image from 'next/image';
import { getSubscriberEmails } from '../../lib/firebaseUtils';

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
  const [imageObjectPosition, setImageObjectPosition] = useState('0% 0%');

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

  const handleImageMouseDown: React.MouseEventHandler<HTMLImageElement> = (
    event,
  ) => {
    const target = event.target as HTMLElement;
    if (!target || !target.parentNode) return; // add a null check

    const startX = event.clientX;
    const startY = event.clientY;
    const container = target.parentNode as HTMLElement;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const initialObjectPositionX = target.style.left;
    const initialObjectPositionY = target.style.top;
    let isDragging = false;

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;
      const offsetX = event.clientX - startX;
      const offsetY = event.clientY - startY;
      const objectPositionX = `${parseFloat(initialObjectPositionX) + (offsetX / containerWidth) * 100}%`;
      const objectPositionY = `${parseFloat(initialObjectPositionY) + (offsetY / containerHeight) * 100}%`;
      setImageObjectPosition(`${objectPositionX} ${objectPositionY}`);
    };

    const handleMouseUp = () => {
      isDragging = false; // set the flag to false when the user releases the mouse button
      document.removeEventListener('mousemove', handleMouseMove, false);
    };

    const handleMouseDown = () => {
      isDragging = true; // set the flag to true when the user presses the mouse button
    };

    document.addEventListener('mousemove', handleMouseMove, false);
    document.addEventListener('mouseup', handleMouseUp, false);
    target.addEventListener('mousedown', handleMouseDown, false);
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

      // Fetch current post data to check draft status
      const postSnapshot = await getDoc(docRef);
      const currentPostData = postSnapshot.data();

      let newImageUrl = imageUrl;

      // Upload new image if file is selected
      if (file) {
        const imageRef = ref(storage, `images/${file.name}`);
        await uploadBytes(imageRef, file);
        newImageUrl = await getDownloadURL(imageRef);
      }

      // Check if post was initially a draft
      const wasDraft = currentPostData?.isDraft;

      await updateDoc(docRef, {
        title,
        content,
        imageUrl: newImageUrl,
        isDraft: false,
        editedDate: new Date().toISOString(),
      });

      // If the post was a draft and is now being published, notify subscribers
      if (wasDraft) {
        const subscriberEmails = await getSubscriberEmails();
        const postId = postSnapshot.id;

        const BASE_URL = 'https://crystal-websiteblog.vercel.app/';
        const postUrl = `${BASE_URL}posts/${postId}`;

        // Send notifications to all subscriber emails
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

      window.location.reload();
      onClose();
    } catch (error) {
      console.error('Error updating document:', error);
      setError('Failed to update post.');
    }
  };

  const handleSaveDraft = async () => {
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

    // Stop if there are validation errors
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
        draft: true, // Mark as draft
        editedDate: new Date().toISOString(),
      });

      window.location.reload();
      onClose();
    } catch (error) {
      console.error('Error saving draft:', error);
      setError('Failed to save draft.');
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
              objectPosition={imageObjectPosition}
              className="h-full w-full"
              onMouseDown={handleImageMouseDown}
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

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="draft-form-button"
          >
            Save as Draft
          </button>
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
