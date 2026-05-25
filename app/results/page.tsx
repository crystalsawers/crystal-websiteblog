'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 10;

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

      try {
        for (const category of categories) {
          const q = query(collection(db, category), orderBy('date', 'desc'));
          const querySnapshot = await getDocs(q);

          querySnapshot.forEach((documentSnapshot) => {
            const data = documentSnapshot.data();

            if (data.isDraft === undefined) {
              console.error(
                `Post ${documentSnapshot.id} is missing the isDraft field.`,
              );
              return;
            }

            // Filter posts based on the search query
            if (titles.some((title) => data.title?.includes(title))) {
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
                seriesIds: data.seriesIds || [], // Ensure seriesIds is included
              } as Post);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        setError('Failed to load results');
      }

      return allPosts;
    },
    [categories],
  );

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const searchQueryString = queryParams.get('results') || '';
        const searchQuery = JSON.parse(searchQueryString); // Parse the JSON string

        // Check if searchQuery is an array and get the titles
        const titles = searchQuery.map((item: { title: string }) => item.title);

        const results = await fetchSearchResults(titles);

        const sortedPosts = sortPostsByDate(results, 'date');

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
  }, [fetchSearchResults, router, currentPage]);

const goToPage = (page: number) => {
  setCurrentPage(page);

  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set('page', page.toString());

  window.history.pushState({}, '', '?' + searchParams.toString());
};


  if (loading) return <Loading />;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className="responsive-container">
        <h2 className="page-title mb-6 text-center">Search Results</h2>

        {posts.length === 0 ? (
          <p className="feedback-button text-center">No results found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {posts.map((post) => {
              const section = isReviewCategory(post.category)
                ? 'reviews'
                : isProjectCategory(post.category)
                  ? 'projects'
                  : 'interests';

              if (!post.category) return null;

              return (
                <div key={post.id} className="card">
                  {post.imageUrl && (
                    <div className="relative h-48 w-full overflow-hidden md:h-56 lg:h-70">
                      <Image
                        src={post.imageUrl}
                        alt={post.title || 'Posted image'}
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

                  {post.title && (
                    <div className={post.imageUrl ? 'pt-4' : ''}>
                      <h2 className="card-title">{post.title}</h2>
                    </div>
                  )}

                  {post.date && (
                    <p className="card-text">
                      <strong>Posted:</strong> {formatDate(new Date(post.date))}
                    </p>
                  )}

                  {post.editedDate && (
                    <p className="card-text">
                      <strong>Edited:</strong>{' '}
                      {formatDate(new Date(post.editedDate))}
                    </p>
                  )}

                  <div className="card-text line-clamp-3">
                    {renderContent(post.content)}
                  </div>

                  <a
                    href={`/${section}/${post.category}/${post.id}`}
                    className="card-link"
                  >
                    Read more
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {posts.length > 0 && (
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
      )}
    </div>
  );
};

export default ResultsPage;
