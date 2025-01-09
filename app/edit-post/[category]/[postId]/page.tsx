'use client';

import { useState, useEffect } from 'react';
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { db, storage } from '@/lib/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../../components/AuthContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface EditPostPageProps {
  params: {
    category: string;
    postId: string;
  };
}

interface PostData {
  title: string;
  content: string;
  imageUrl?: string;
  type: string;
  date?: string;
  seriesId?: string;
}

interface SeriesData {
  id: string;
  name: string;
}

const EditPostPage = ({ params }: EditPostPageProps) => {
  const { category, postId } = params;
  const [post, setPost] = useState<PostData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [pinned, setPinned] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [seriesList, setSeriesList] = useState<SeriesData[]>([]); // State to store series list
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(''); // State to store selected series
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postRef = doc(db, category, postId);
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
          const postData = postSnap.data();
          setPost(postData as PostData);
          setTitle(postData.title || '');
          setContent(postData.content || '');
          setImageUrl(postData.imageUrl || '');
          setSelectedSeriesId(postData.seriesId || '');
        } else {
          setError('Post not found.');
        }
      } catch (err) {
        setError('Error fetching post.');
        console.error(err);
      }
    };

    const fetchSeries = async () => {
      try {
        const seriesRef = collection(db, 'series');
        const seriesSnapshot = await getDocs(seriesRef);
        const seriesData = seriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setSeriesList(seriesData);
      } catch (err) {
        console.error('Error fetching series:', err);
      }
    };

    fetchPost();
    fetchSeries();
  }, [category, postId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setImageUrl('');
  };

  const handleTogglePin = async () => {
    const settingsRef = doc(db, 'settings', 'siteConfig');
    const settingsSnap = await getDoc(settingsRef);
    const pinnedPostId = settingsSnap.data()?.pinnedPostId;

    if (pinnedPostId && pinnedPostId !== postId && !pinned) {
      setPinError(
        'Another post is already pinned. Unpin it before pinning this one.',
      );
      return;
    }

    setPinError(null);

    if (!pinned) {
      await updateDoc(settingsRef, { pinnedPostId: postId });
    } else {
      await updateDoc(settingsRef, { pinnedPostId: null });
    }

    setPinned(!pinned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

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
      const docRef = doc(db, category, postId);
      let newImageUrl = imageUrl;

      if (file) {
        const imageRef = ref(storage, `images/${file.name}`);
        await uploadBytes(imageRef, file);
        newImageUrl = await getDownloadURL(imageRef);
      }

      // Ensure seriesId is an array, even if it's a single string
      const seriesIds = Array.isArray(selectedSeriesId)
        ? selectedSeriesId // If it's already an array, use it
        : [selectedSeriesId]; // If it's a single string, convert to an array

      // Update the post document with seriesIds as an array
      await updateDoc(docRef, {
        title,
        content,
        imageUrl: newImageUrl,
        isDraft: false,
        editedDate: new Date().toISOString(),
        pinned,
        seriesId: seriesIds, // Store seriesIds as an array
      });

      // Skip the loop if seriesIds contains an empty string
      for (const seriesId of seriesIds.filter((id) => id)) {
        const seriesRef = doc(db, 'series', seriesId);
        const seriesSnap = await getDoc(seriesRef);

        if (seriesSnap.exists()) {
          const seriesData = seriesSnap.data();
          const currentPostIds = seriesData?.postIds || [];

          // Add postId if it's not already in postIds
          if (postId && !currentPostIds.includes(postId)) {
            await updateDoc(seriesRef, {
              postIds: [...currentPostIds, postId],
            });
          }
        } else {
          console.log(`Series document not found for series ${seriesId}.`);
        }
      }

      window.location.href = '/';
    } catch (error) {
      console.error('Error updating document:', error);
      setError('Failed to update post.');
    }
  };

  const handleSaveDraft = async () => {
    if (!isAuthenticated) return;

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
      const docRef = doc(db, category, postId);
      let newImageUrl = imageUrl;

      if (file) {
        const imageRef = ref(storage, `images/${file.name}`);
        await uploadBytes(imageRef, file);
        newImageUrl = await getDownloadURL(imageRef);
      }

      await updateDoc(docRef, {
        title,
        content,
        imageUrl: newImageUrl,
        isDraft: true,
        editedDate: new Date().toISOString(),
        pinned,
        seriesId: selectedSeriesId,
      });

      window.location.href = '/';
    } catch (error) {
      console.error('Error saving draft:', error);
      setError('Failed to save draft.');
    }
  };

  if (error) {
    return <div className="create-post-error">{error}</div>;
  }

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div className="create-post-page">
      <form onSubmit={handleSubmit} className="create-post-form">
        <h2 className="create-post-title">Edit Post</h2>

        {error && <p className="create-post-error">{error}</p>}
        {pinError && <p className="text-red-700">{pinError}</p>}

        <label className="create-post-label" htmlFor="title">
          Title:
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="create-post-input"
        />
        {titleError && <p className="text-red-700">{titleError}</p>}

        <label className="create-post-label" htmlFor="content">
          Content:
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="create-post-textarea"
        />
        {contentError && <p className="text-red-700">{contentError}</p>}

        <label className="create-post-label" htmlFor="series">
          Series:
        </label>
        <select
          id="series"
          value={selectedSeriesId}
          onChange={(e) => setSelectedSeriesId(e.target.value)}
          className="create-post-input"
        >
          <option value="">Select a Series</option>
          {seriesList.map((series) => (
            <option key={series.id} value={series.id}>
              {series.name}
            </option>
          ))}
        </select>

        <label className="create-post-label" htmlFor="file">
          Image:
        </label>
        <div className="create-post-file-input-container">
          <input
            id="file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="create-post-input"
          />
          <span className="file-placeholder">
            {file ? file.name : 'No file selected'}
          </span>
        </div>
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
              className="create-post-remove-button"
            >
              Remove
            </button>
          </div>
        )}
        <div className="create-post-button-group mt-6 flex justify-center space-x-4">
          <button
            type="button"
            onClick={handleTogglePin}
            className={`rounded p-2 ${pinned ? 'bg-red-500' : 'bg-yellow-500'} text-white`}
          >
            {pinned ? 'Unpin Post' : 'Pin Post'}
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="create-post-draft-button"
          >
            Save as Draft
          </button>
          <button type="submit" className="create-post-button">
            Update Post
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPostPage;
