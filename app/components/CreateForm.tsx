import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebaseConfig';
import Image from 'next/image';

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
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();
  const [imageObjectPosition, setImageObjectPosition] = useState('0% 0%');

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

      // Determine the category to use (main page or passed category prop)
      const finalCategory = isMainPage ? selectedCategory : category;

      // Add document to Firestore
      const docRef = await addDoc(collection(db, finalCategory || ''), {
        title,
        content,
        date,
        imageUrl,
      });

    // // Notify subscribers about the new post
    const postId = docRef.id; // Get the ID of the newly created post
    const postUrl = `https://crystal-websiteblog.vercel.app/${finalCategory || ''}/${postId}`;
    console.log('Current post URL:', postUrl);

    await fetch('/api/sendNotification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postTitle: `New Post: ${title}`,  
        postUrl: postUrl,  
        notificationEmail: null,
      }),
    });

      // Redirect logic
      const reviewCategories = ['makeup', 'lifestyle'];
      const interestCategories = ['formula1', 'cricket', 'music'];
      let redirectPath = '';

      if (reviewCategories.includes(finalCategory || '')) {
        redirectPath = `/reviews/${finalCategory}`;
      } else if (interestCategories.includes(finalCategory || '')) {
        redirectPath = `/interests/${finalCategory}`;
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
    <div className="flex w-full max-w-7xl items-center justify-center p-4">
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
        {/* Conditionally render category selection for main page */}
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
              <option value="makeup">Makeup</option>
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
