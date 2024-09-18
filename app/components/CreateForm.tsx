import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import functions for file upload
import { db, storage } from '@/lib/firebaseConfig'; // Import storage
import Image from 'next/image';


interface CreateFormProps {
  category: string;
}

const CreateForm = ({ category }: CreateFormProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState<File | null>(null); // State for file
  const [imageUrl, setImageUrl] = useState<string | null>(null); // State for image URL
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get today's date in NZ time (Pacific/Auckland) and format as YYYY-MM-DD
    const today = new Date();
    const nzDate = today.toLocaleDateString('en-GB', { timeZone: 'Pacific/Auckland' }).split('/').reverse().join('-');
    setDate(nzDate);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0])); // Preview the image
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageUrl = '';

      // Upload image if file is selected
      if (file) {
        const imageRef = ref(storage, `images/${file.name}`);
        await uploadBytes(imageRef, file);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, category), {
        title,
        content,
        date,
        imageUrl, // Save the image URL in Firestore
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
        <div className="mb-4">
          <label htmlFor="file" className="create-form-label">Image:</label>
          <input
            id="file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="create-form-input"
          />
          {imageUrl && (
            <div className="relative w-full h-48">
              <Image
                src={imageUrl}
                alt="Preview"
                layout="fill"
                objectFit="cover"
                className="card-img"
              />
            </div>
          )}
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
