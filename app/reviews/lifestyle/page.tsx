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

interface LifestyleDocument {
  id: string;
  type: string;
  title?: string;
  content: string;
  date?: string;
  editedDate?: string;
  imageUrl?: string;
  isDraft?: boolean;
}

const Lifestyle = () => {
  const [data, setData] = useState<LifestyleDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const category = 'lifestyle';
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
          collection(db, 'lifestyle'),
        );
        const items: LifestyleDocument[] = querySnapshot.docs.map((doc) => {
          const data = doc.data() as LifestyleDocument;
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
        setError('Error fetching Lifestyle data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchParams]);

  const handleCreate = () => {
    router.push('/create-post');
  };

  const handleBack = () => {
    router.back();
  };

  const handleEdit = (id: string) => {
    if (!isAuthenticated) return;

    // Navigate to the edit-post page for the specific post
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
      const docRef = doc(db, 'lifestyle', id);
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
      <p className="text-center text-custom-green">
        Loading Lifestyle posts...
      </p>
    );
  if (error) return <p>{error}</p>;

  return (
    <div className="lg:mx-auto lg:max-w-screen-lg lg:p-8">
      <h1 className="page-title">Lifestyle</h1>
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
        <p>No Lifestyle posts yet</p>
      ) : (
        data.map((item) => {
          if (item.isDraft && !isAuthenticated) return null;

          return (
            <div key={item.id} className="card">
              {item.imageUrl && (
                <div className="lg:h-70 relative h-48 w-full overflow-hidden md:h-56">
                  <Image
                    src={item.imageUrl}
                    alt={item.title || 'Lifestyle post image'}
                    layout="fill"
                    objectFit="cover"
                    className="card-img"
                  />
                </div>
              )}
              {item.title && (
                <div className={item.imageUrl ? 'pt-4' : ''}>
                  <h2 className="card-title">{item.title}</h2>
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
              <a href={`/reviews/lifestyle/${item.id}`} className="card-link">
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

      {/* Pagination Controls */}
      <div className="mt-6 text-center">
        {/* Prev Button */}
        <button
          className={`mr-2 rounded-md bg-emerald-500 px-4 py-2 ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''}`}
          onClick={() => goToPage(Math.max(currentPage - 1, 1))} // Use goToPage for "Prev"
          disabled={currentPage === 1} // Disabled on first page
        >
          Prev
        </button>

        {/* Page Number Display (Page X of Y) */}
        <span className="mx-2 text-lg">
          Page {currentPage} of {totalPages}
        </span>

        {/* Next Button */}
        <button
          className={`ml-2 rounded-md bg-emerald-500 px-4 py-2 ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''}`}
          onClick={() => goToPage(Math.min(currentPage + 1, totalPages))} // Use goToPage for "Next"
          disabled={currentPage === totalPages} // Disabled on last page
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Lifestyle;
