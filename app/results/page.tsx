'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatDate } from '@/lib/utils/formatDate';
import renderContent from '@/lib/utils/renderContent';
import { truncateContent } from '@/lib/utils/truncateContent';
import Loading from '../loading';
import { db } from '../../lib/firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

interface Post {
  id: string;
  title?: string;
  imageUrl?: string;
  date?: string;
  editedDate?: string;
  content: string;
  isDraft?: boolean;
  category: string;
}

const isReviewCategory = (category: string): boolean => {
  const reviewCategories = ['lifestyle', 'misc'];
  return reviewCategories.includes(category);
};

const ResultsPage = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = useMemo(
    () => ['cricket', 'formula1', 'music', 'lifestyle', 'misc'],
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
                isDraft: data.isDraft || false,
              });
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
        setPosts(results);
      } catch (error) {
        console.error('Error parsing search query:', error);
        setError('Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [fetchSearchResults, router]);

  if (loading) return <Loading />;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className="mx-auto max-w-4xl">
        <h2 className="page-title mb-6 text-center">Search Results</h2>

        {posts.length === 0 ? (
          <p className="feedback-button text-center">No results found.</p>
        ) : (
          posts.map((post) => {
            const section = isReviewCategory(post.category)
              ? 'reviews'
              : 'interests';

            if (!post.category) {
              console.warn('Category is undefined for post:', post);
              return null; // Skip rendering this post
            }

            return (
              <div key={post.id} className="card mb-4">
                {post.imageUrl && (
                  <div className="lg:h-70 relative h-48 w-full overflow-hidden md:h-56">
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
                      className="card-img"
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
                <p className="card-text">
                  {renderContent(truncateContent(post.content, 110))}
                </p>
                <a
                  href={`/${section}/${post.category}/${post.id}`}
                  className="card-link"
                >
                  Read more
                </a>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
