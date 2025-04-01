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

interface Formula1Document {
  id: string;
  type: string;
  title?: string;
  content: string;
  date?: string;
  editedDate?: string;
  imageUrl?: string;
  isDraft?: boolean; // Added isDraft property
}

const Formula1 = () => {
  const [data, setData] = useState<Formula1Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const category = 'formula1';
  const specificPostIds = ['02V6uLUBhnKstE8ofH6H']; // Center this specific post
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 10;
  const searchParams = useSearchParams();

  useEffect(() => {
    // Sync the current page from the URL query param
    const pageFromUrl = searchParams.get('page');
    setCurrentPage(pageFromUrl ? parseInt(pageFromUrl) : 1); // Default to page 1 if no query parameter

    const fetchData = async () => {
      try {
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(
          collection(db, category),
        );
        const items: Formula1Document[] = querySnapshot.docs.map((doc) => {
          const data = doc.data() as Formula1Document;
          return {
            id: doc.id,
            type: data.type,
            title: data.title,
            content: data.content,
            date: data.date,
            editedDate: data.editedDate,
            imageUrl: data.imageUrl,
            isDraft: data.isDraft || false, // Default to false if not present
          };
        });

        const sortedItems = sortPostsByDate(items, 'date');

        // Pagination
        const startIndex = (currentPage - 1) * postsPerPage;
        const paginatedPosts = sortedItems.slice(
          startIndex,
          startIndex + postsPerPage,
        );

        setData(paginatedPosts);
        setTotalPages(Math.ceil(sortedItems.length / postsPerPage));
      } catch (error) {
        setError('Error fetching Formula 1 data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category, currentPage, searchParams]);

  const handleBack = () => {
    router.back();
  };

  const handleCreatePost = () => {
    router.push('/create-post');
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
      const docRef = doc(db, category, id);
      await deleteDoc(docRef);
      setData(data.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Failed to delete post.');
    }
  };

  // Added: Update the URL when navigating between pages
  const goToPage = (page: number) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('page', page.toString());
    window.history.pushState({}, '', '?' + searchParams.toString());
  };

  if (loading)
    return (
      <p className="text-center text-custom-green">
        Loading Formula 1 posts...
      </p>
    );
  if (error) return <p>{error}</p>;

  return (
    <div className="lg:mx-auto lg:max-w-screen-lg lg:p-8">
      <h1 className="page-title">Formula 1</h1>
      <div className="mb-4 flex justify-between">
        <button
          onClick={handleBack}
          className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        >
          Back
        </button>
        {isAuthenticated && (
          <button
            onClick={handleCreatePost}
            className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          >
            Create Post
          </button>
        )}
      </div>

      {data.length === 0 ? (
        <p>No Formula 1 posts yet</p>
      ) : (
        data.map((item) => {
          // Only show draft posts if the user is authenticated
          if (item.isDraft && !isAuthenticated) return null;

          return (
            <div key={item.id} className="card mb-4">
              {item.imageUrl && (
                <div className="lg:h-70 relative h-48 w-full overflow-hidden md:h-56">
                  <Image
                    src={item.imageUrl}
                    alt={item.title || 'Formula 1 post image'}
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
                      objectPosition: specificPostIds.includes(item.id)
                        ? 'center'
                        : 'top center',
                    }}
                    className="card-img"
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

              <a href={`/interests/formula1/${item.id}`} className="card-link">
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

export default Formula1;
