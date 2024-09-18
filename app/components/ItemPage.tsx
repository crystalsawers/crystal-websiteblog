'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import { formatDate } from '@/lib/utils/formatDate';
import renderContent from '../../lib/utils/renderContent';
import NotFound from '../../app/not-found';
import Image from 'next/image';
import EditForm from '../components/EditForm';

interface DocumentData {
  type: string;
  title?: string;
  content: string;
  date?: string;
  imageUrl?: string;
}

const ItemPage = ({ collectionName }: { collectionName: string }) => {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';
  const [data, setData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        if (!db) {
          setFetchError('Firestore instance is not initialized.');
          return;
        }

        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setData(docSnap.data() as DocumentData);
        } else {
          setData(null);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error fetching document:', error.message);
          setFetchError('Error fetching data: ' + error.message);
        } else {
          console.error('An unknown error occurred', error);
          setFetchError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, collectionName]);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);
        router.push('/');
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error deleting document:', error.message);
          setFetchError('Error deleting data: ' + error.message);
        } else {
          console.error('An unknown error occurred', error);
          setFetchError('An unknown error occurred.');
        }
      }
    }
  };

  if (loading)
    return <p className="text-center text-custom-green">Loading...</p>;

  if (fetchError) return <p>{fetchError}</p>;

  if (!data) return <NotFound />;

  return (
    <div className="lg:mx-auto lg:max-w-screen-lg lg:p-8">
      <div className="mb-4 flex justify-between">
        <button
          onClick={handleBack}
          className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        >
          Back
        </button>
        {!editMode && (
          <div>
            <button
              onClick={handleEdit}
              className="mr-2 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {!editMode ? (
        <div className="card flex flex-col">
          {data.date && (
            <p className="card-text mb-4">
              <strong>Posted:</strong> {formatDate(new Date(data.date))}
            </p>
          )}

          {data.imageUrl && (
            <div
              className="relative mb-4 w-full"
              style={{
                maxWidth: '800px',
                margin: '0 auto',
                maxHeight: '400px',
                overflow: 'hidden',
              }}
            >
              <Image
                src={data.imageUrl}
                alt={data.title || 'Image'}
                layout="responsive"
                width={800}
                height={400}
                style={{ maxHeight: '600px', objectFit: 'cover' }}
              />
            </div>
          )}

          <div>
            {data.title && <h1 className="card-title">{data.title}</h1>}
            <div className="card-text">{renderContent(data.content)}</div>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <EditForm
            category={collectionName}
            postId={id}
            initialData={data}
            onClose={() => setEditMode(false)}
          />
        </div>
      )}
    </div>
  );
};

export default ItemPage;
