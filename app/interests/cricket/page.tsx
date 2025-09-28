'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  DocumentData,
  QuerySnapshot,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';
import { formatDate } from '@/lib/utils/formatDate';
import { useAuth } from '../../components/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const category = 'cricket';
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 10;
  const searchParams = useSearchParams();

  useEffect(() => {
    const pageFromUrl = searchParams.get('page');
    setCurrentPage(pageFromUrl ? parseInt(pageFromUrl) : 1);

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

        const startIndex = (currentPage - 1) * postsPerPage;
        const paginatedPosts = sortedItems.slice(
          startIndex,
          startIndex + postsPerPage,
        );

        setData(paginatedPosts);
        setTotalPages(Math.ceil(sortedItems.length / postsPerPage));
      } catch (error) {
        setError('Error fetching Cricket data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams, currentPage]);

  const handleCreate = () => {
    router.push('/create-post');
  };

  const handleBack = () => {
    router.back();
  };

  const handleEdit = (id: string) => {
    if (!isAuthenticated) return;
    router.push(`/edit-post/${category}/${id}`);
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

  const goToPage = (page: number) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('page', page.toString());
    window.history.pushState({}, '', '?' + searchParams.toString());
  };

  if (loading)
    return (
      <p className="text-center text-custom-green">Loading Cricket posts...</p>
    );
  if (error) return <p>{error}</p>;

  return (
    <div className="responsive-container">
      <h1 className="page-title">Cricket</h1>
      <div className="mb-4 flex justify-between">
        <button
          onClick={handleBack}
          className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        >
          Back
        </button>
        {isAuthenticated && (
          <button
            onClick={handleCreate}
            className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          >
            Create Post
          </button>
        )}
      </div>

      {data.length === 0 ? (
        <p>No Cricket posts yet</p>
      ) : (
        <div className="card-grid">
          {data.map((item) => {
            // Only show draft posts if the user is authenticated
            if (item.isDraft && !isAuthenticated) return null;

            return (
              <div key={item.id} className="card">
                {item.imageUrl && (
                  <div className="lg:h-70 relative h-48 w-full overflow-hidden md:h-56">
                    <Image
                      src={item.imageUrl}
                      alt={item.title || 'Cricket post image'}
                      className="card-img"
                      width={500}
                      height={300}
                      priority={true}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'top center',
                      }}
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
                <div className="card-text">
                  {renderContent(truncateContent(item.content, 110))}
                </div>

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
          })}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="mt-6 text-center">
        <button
          className={`mr-2 rounded-md bg-emerald-500 px-4 py-2 ${
            currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
          }`}
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
        >
          First
        </button>
        <button
          className={`mr-2 rounded-md bg-emerald-500 px-4 py-2 ${
            currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
          }`}
          onClick={() => goToPage(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span className="mx-2 text-lg">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className={`ml-2 rounded-md bg-emerald-500 px-4 py-2 ${
            currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''
          }`}
          onClick={() => goToPage(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
        <button
          className={`ml-2 rounded-md bg-emerald-500 px-4 py-2 ${
            currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''
          }`}
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          Last
        </button>
      </div>
    </div>
  );
};

export default Cricket;
