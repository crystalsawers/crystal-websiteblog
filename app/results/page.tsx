'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { formatDate } from '@/lib/utils/formatDate';
import renderContent from '@/lib/utils/renderContent';
import Loading from '../loading';
import { db } from '../../lib/firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { sortPostsByDate } from '@/lib/utils/sortPostsByDate';

interface Post {
  id: string;
  title: string;
  content: string;
  date: string;
  editedDate?: string;
  category: string;
  imageUrl?: string;
  type: string;
  isDraft: boolean;
  seriesIds?: string[];
}

const reviewCategories = ['lifestyle', 'misc'];
const projectCategories = ['apps', 'devops', 'embedded'];

const isReviewCategory = (category: string): boolean => {
  return reviewCategories.includes(category);
};

const isProjectCategory = (category: string): boolean => {
  return projectCategories.includes(category);
};

const ResultsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const postsPerPage = 12;

  const categories = useMemo(
    () => [
      'cricket',
      'formula1',
      'music',
      'lifestyle',
      'misc',
      'apps',
      'devops',
      'embedded',
    ],
    [],
  );

  const fetchSearchResults = useCallback(
    async (titles: string[]) => {
      const allPosts: Post[] = [];

      for (const category of categories) {
        const q = query(collection(db, category), orderBy('date', 'desc'));

        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((documentSnapshot) => {
          const data = documentSnapshot.data();

          const title = (data.title || '').toLowerCase().replace(/\s+/g, '');

          if (
            titles.some((t) =>
              title.includes(t.toLowerCase().replace(/\s+/g, '')),
            )
          ) {
            allPosts.push({
              id: documentSnapshot.id,
              title: data.title || '',
              content: data.content || '',
              date: data.date || '',
              editedDate: data.editedDate || '',
              category,
              imageUrl: data.imageUrl || '',
              type: data.type || 'default',
              isDraft: data.isDraft || false,
              seriesIds: data.seriesIds || [],
            });
          }
        });
      }

      return allPosts;
    },
    [categories],
  );

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);

        const searchQuery = queryParams.get('q') || '';

        const results = await fetchSearchResults([searchQuery]);

        const visibleResults = results.filter((post) => !post.isDraft);

        const sortedPosts = sortPostsByDate(visibleResults, 'date');

        const startIndex = (currentPage - 1) * postsPerPage;

        const paginatedPosts = sortedPosts.slice(
          startIndex,
          startIndex + postsPerPage,
        );

        setPosts(paginatedPosts);
        setTotalPages(Math.ceil(sortedPosts.length / postsPerPage));
      } catch (error) {
        console.error('Error parsing search query:', error);
        setError('Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [fetchSearchResults, currentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(page);

    const searchParams = new URLSearchParams(window.location.search);

    searchParams.set('page', page.toString());

    window.history.pushState({}, '', '?' + searchParams.toString());
  };

  if (loading) return <Loading />;

  if (error) return <div>{error}</div>;

  return (
    <div className="blog-home">
      <section className="category-header">
        <div className="category-header-content">
          <span className="section-eyebrow">SEARCH</span>

          <h2 className="section-title">Search Results</h2>
        </div>
      </section>

      {posts.length === 0 ? (
        <div className="empty-posts">
          <p>No results found.</p>
        </div>
      ) : (
        <>
          <div className="modern-post-grid">
            {posts.map((post) => {
              const section = isReviewCategory(post.category)
                ? 'reviews'
                : isProjectCategory(post.category)
                  ? 'projects'
                  : 'interests';

              if (!post.category) return null;

              return (
                <article key={post.id} className="modern-post-card">
                  {post.imageUrl && (
                    <div className="modern-post-image">
                      <Image
                        src={post.imageUrl}
                        alt={post.title || 'Posted image'}
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
                      <span>{post.category}</span>

                      {post.date && (
                        <span>{formatDate(new Date(post.date))}</span>
                      )}
                    </div>

                    {post.title && (
                      <h2 className="modern-post-title">{post.title}</h2>
                    )}

                    {post.editedDate && (
                      <p className="edited-date">
                        Edited {formatDate(new Date(post.editedDate))}
                      </p>
                    )}

                    <div className="modern-post-excerpt">
                      {renderContent(post.content)}
                    </div>

                    <a
                      href={`/${section}/${post.category}/${post.id}`}
                      className="modern-post-link"
                    >
                      Read more →
                    </a>
                  </div>
                </article>
              );
            })}
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

export default ResultsPage;
