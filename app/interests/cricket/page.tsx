'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  DocumentData,
  QuerySnapshot,
  doc,
  getDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';
import { formatDate } from '@/lib/utils/formatDate';
import { useAuth } from '../../components/AuthContext';
import { useRouter } from 'next/navigation';
import CreateForm from '../../components/CreateForm';
import EditForm from '../../components/EditForm';
import { sortPostsByDate } from '@/lib/utils/sortPostsByDate';
import renderContent from '@/lib/utils/renderContent';
import { truncateContent } from '@/lib/utils/truncateContent';
import Image from 'next/image';

interface CricketDocument {
  id: string;
  type: string;
  title?: string;
  content: string;
  date?: string;
  editedDate?: string;
  imageUrl?: string;
  isDraft: boolean;
}

const Cricket = () => {
  const [data, setData] = useState<CricketDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState<CricketDocument | null>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const category = 'cricket';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(
          collection(db, 'cricket'),
        );
        const items: CricketDocument[] = querySnapshot.docs.map((doc) => {
          const data = doc.data() as CricketDocument;
          return {
            id: doc.id,
            type: data.type,
            title: data.title,
            content: data.content,
            date: data.date,
            editedDate: data.editedDate,
            imageUrl: data.imageUrl,
            isDraft: data.isDraft || false,
          };
        });

        const sortedItems = sortPostsByDate(items, 'date');
        setData(sortedItems);
      } catch (error) {
        setError('Error fetching Cricket data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreate = () => {
    setIsCreating(true);
  };

  const handleBack = () => {
    router.back();
  };

  const handleCloseForm = () => {
    setIsCreating(false);
    setEditingPost(null);
  };

  const handleEdit = async (id: string) => {
    if (!isAuthenticated) return;

    try {
      const docRef = doc(db, 'cricket', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setEditingPost({
          id: docSnap.id,
          ...(docSnap.data() as Omit<CricketDocument, 'id'>),
        });
      }
    } catch (error) {
      console.error('Error fetching document for editing:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAuthenticated) return;

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this post?',
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const docRef = doc(db, 'cricket', id);
      await deleteDoc(docRef);
      setData(data.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Failed to delete post.');
    }
  };

  if (loading)
    return (
      <p className="text-center text-custom-green">Loading Cricket posts...</p>
    );
  if (error) return <p>{error}</p>;

  return (
    <div className="lg:mx-auto lg:max-w-screen-lg lg:p-8">
      <h1 className="page-title">Cricket</h1>
      <div className="mb-4 flex justify-between">
        <button
          onClick={handleBack}
          className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        >
          Back
        </button>
        {isAuthenticated && !isCreating && (
          <button
            onClick={handleCreate}
            className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          >
            Create Post
          </button>
        )}
      </div>
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <CreateForm category={category} onClose={handleCloseForm} />
        </div>
      )}

      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <EditForm
            category={category}
            postId={editingPost.id}
            initialData={editingPost}
            onClose={handleCloseForm}
          />
        </div>
      )}
      {data.length === 0 ? (
        <p>No Cricket posts yet</p>
      ) : (
        data.map((item) => {
          // Only show draft posts if the user is authenticated
          if (item.isDraft && !isAuthenticated) return null;

          return (
            <div key={item.id} className="card">
              {item.imageUrl && (
                <div className="lg:h-70 relative h-48 w-full overflow-hidden md:h-56">
                  <Image
                    src={item.imageUrl}
                    alt={item.title || 'Cricket post image'}
                    layout="fill"
                    objectFit="cover"
                    className="card-img"
                    objectPosition={'top center'}
                  />
                </div>
              )}
              {item.title && (
                <div className={item.imageUrl ? 'pt-4' : ''}>
                  <h2 className="card-title">{item.title}</h2>
                  {/* Indicate if the post is a draft */}
                  {item.isDraft && (
                    <span className="text-bold text-red-500">Draft</span>
                  )}
                </div>
              )}
              {item.date && (
                <p className="card-text">
                  <strong>Posted:</strong> {formatDate(new Date(item.date))}
                </p>
              )}
              {item.editedDate && (
                <p className="card-text">
                  <strong>Edited:</strong>{' '}
                  {formatDate(new Date(item.editedDate))}
                </p>
              )}
              <p className="card-text">
                {renderContent(truncateContent(item.content, 110))}
              </p>

              <a href={`/interests/cricket/${item.id}`} className="card-link">
                Read more
              </a>

              {isAuthenticated && (
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => handleEdit(item.id)}
                    className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Cricket;
