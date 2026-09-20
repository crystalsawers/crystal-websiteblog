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
  const postsPerPage = 12;
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

        const visibleItems = isAuthenticated
          ? sortedItems
          : sortedItems.filter((item) => !item.isDraft);

        const startIndex = (currentPage - 1) * postsPerPage;

        const paginatedPosts = visibleItems.slice(
          startIndex,
          startIndex + postsPerPage,
        );

        setData(paginatedPosts);
        setTotalPages(Math.ceil(visibleItems.length / postsPerPage));
      } catch (error) {
        setError('Error fetching Lifestyle data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchParams, isAuthenticated]);

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
      <p className="text-center text-[#99ffd3]">Loading Lifestyle posts...</p>
    );

  if (error) return <p>{error}</p>;

  return (
    <div className="blog-home">
      <section className="category-header">
        <div className="category-header-content">
          <span className="section-eyebrow">REVIEWS</span>

          <h2 className="section-title">Lifestyle</h2>

          <p className="category-description">
            Lifestyle reviews, recommendations, experiences, opinions, and
            everything else from the world of everyday life.
          </p>
        </div>
      </section>

      <div className="category-controls">
        <button onClick={handleBack} className="category-back-button">
          ← Back
        </button>

        {isAuthenticated && (
          <button onClick={handleCreate} className="admin-button">
            Create Post
          </button>
        )}
      </div>

      {data.length === 0 ? (
        <div className="empty-posts">
          <p>No Lifestyle posts yet.</p>
        </div>
      ) : (
        <>
          <div className="modern-post-grid">
            {data.map((item) => (
              <article key={item.id} className="modern-post-card">
                {item.imageUrl && (
                  <div className="modern-post-image">
                    <Image
                      src={item.imageUrl}
                      alt={item.title || 'Lifestyle post image'}
                      width={500}
                      height={300}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'top center',
                      }}
                    />
                  </div>
                )}

                <div className="modern-post-content">
                  <div className="post-meta">
                    <span>Lifestyle</span>

                    {item.date && (
                      <span>{formatDate(new Date(item.date))}</span>
                    )}
                  </div>

                  {item.title && (
                    <h2 className="modern-post-title">{item.title}</h2>
                  )}

                  {item.isDraft && <span className="draft-label">Draft</span>}

                  {item.editedDate && (
                    <p className="edited-date">
                      Edited {formatDate(new Date(item.editedDate))}
                    </p>
                  )}

                  <div className="modern-post-excerpt">
                    {renderContent(item.content)}
                  </div>

                  <a
                    href={`/reviews/lifestyle/${item.id}`}
                    className="modern-post-link"
                  >
                    Read more →
                  </a>

                  {isAuthenticated && (
                    <div className="post-admin-controls">
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="edit-button"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="modern-pagination">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              First
            </button>

            <button
              onClick={() => goToPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Prev
            </button>

            <span className="pagination-current">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => goToPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Next
            </button>

            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Last
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Lifestyle;
