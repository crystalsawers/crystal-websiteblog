'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebaseConfig';
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { sortPostsByDate } from '../lib/utils/sortPostsByDate';
import { formatDate } from '../lib/utils/formatDate';
import renderContent from '@/lib/utils/renderContent';
import { truncateContent } from '@/lib/utils/truncateContent';
import Loading from './loading';
import Image from 'next/image';
import { useAuth } from './components/AuthContext';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { useSearchParams } from 'next/navigation';

const categories = ['cricket', 'formula1', 'music', 'lifestyle', 'misc'];

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

const isReviewCategory = (category: string): boolean => {
  const reviewCategories = ['lifestyle', 'misc'];
  return reviewCategories.includes(category);
};

const fetchPosts = async (
  isAuthenticated: boolean,
  seriesId?: string,
): Promise<Post[]> => {
  const allPosts: Post[] = [];

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

      // Check if the post belongs to the selected series
      const postBelongsToSeries =
        !seriesId ||
        (Array.isArray(data.seriesIds) && data.seriesIds.includes(seriesId));

      if ((isAuthenticated || data.isDraft === false) && postBelongsToSeries) {
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

  return allPosts;
};

const HomePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [pinnedPostId, setPinnedPostId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 10;
  const searchParams = useSearchParams();
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [seriesOptions, setSeriesOptions] = useState<
    { id: string; name: string }[]
  >([]);

  const specificPostIds = [
    'Y4f0mW8ZiX35uLxGyg1S',
    '02V6uLUBhnKstE8ofH6H',
    'vcVid0cpfoGh4KdozgcS',
  ]; // make the ones I want centered

  // fetch the series collection from backend
  useEffect(() => {
    async function fetchSeries() {
      try {
        const seriesSnapshot = await getDocs(collection(db, 'series'));
        const seriesList = seriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || 'Unnamed Series', // Fallback
        }));
        setSeriesOptions(seriesList);
      } catch (error) {
        console.error('Error fetching series:', error);
      }
    }

    fetchSeries();
  }, []); // Runs only once when the component mounts

  useEffect(() => {
    const pageFromUrl = searchParams.get('page');
    setCurrentPage(pageFromUrl ? parseInt(pageFromUrl) : 1);

    async function getPosts() {
      try {
        setLoading(true);

        let seriesPostIds: string[] = [];
        if (selectedSeries) {
          // Fetch postIds for the selected series
          const seriesRef = doc(db, 'series', selectedSeries);
          const seriesSnap = await getDoc(seriesRef);

          if (seriesSnap.exists()) {
            seriesPostIds = seriesSnap.data().postIds || [];
          } else {
            console.warn('Selected series not found in database.');
          }
        }

        // Fetch all posts and filter by seriesPostIds
        const fetchedPosts = await fetchPosts(isAuthenticated);
        const filteredPosts = selectedSeries
          ? fetchedPosts.filter((post) => seriesPostIds.includes(post.id))
          : fetchedPosts;

        // Get site settings for pinned post
        const settingsRef = doc(db, 'settings', 'siteConfig');
        const settingsSnap = await getDoc(settingsRef);
        const pinnedId = settingsSnap.data()?.pinnedPostId || null;
        setPinnedPostId(pinnedId);

        // Sort and paginate the posts
        const sortedPosts = sortPostsByDate(filteredPosts, 'date');
        const startIndex = (currentPage - 1) * postsPerPage;
        const paginatedPosts = sortedPosts.slice(
          startIndex,
          startIndex + postsPerPage,
        );

        setPosts(paginatedPosts);
        setTotalPages(Math.ceil(sortedPosts.length / postsPerPage));
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    }

    getPosts();
  }, [isAuthenticated, currentPage, searchParams, selectedSeries]);

  const handleEdit = (post: Post) => {
    router.push(`/edit-post/${post.category}/${post.id}`);
  };

  const handleDelete = async (post: Post) => {
    if (!isAuthenticated) return;

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this post?',
    );

    if (!confirmDelete) return;

    try {
      const postRef = doc(db, post.category, post.id);
      await deleteDoc(postRef);
      setPosts(posts.filter((p) => p.id !== post.id));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleCreatePost = () => {
    router.push('/create-post');
  };

  // Added: Update the URL when navigating between pages
  const goToPage = (page: number) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('page', page.toString());
    window.history.pushState({}, '', '?' + searchParams.toString());
  };

  if (loading) return <Loading />;

  /* RENDER */
  return (
    <div>
      <div className="mx-auto max-w-4xl">
        <h2 className="page-title mb-6 text-center">Latest Posts</h2>

        {/* Series Filter */}
        <div className="mb-6 flex flex-col items-end">
          <label
            htmlFor="series-filter"
            className="mb-2 text-sm font-medium text-custom-green"
          >
            Filter by Blog Series
          </label>
          <select
            id="series-filter"
            className="w-64 rounded-md border border-gray-300 bg-custom-green p-2 text-black shadow-md focus:border-indigo-500 focus:ring focus:ring-indigo-300"
            value={selectedSeries || ''}
            onChange={(e) => setSelectedSeries(e.target.value || null)}
          >
            <option value="">All Series</option>
            {seriesOptions.map((series) => (
              <option key={series.id} value={series.id}>
                {series.name}
              </option>
            ))}
          </select>
        </div>

        {isAuthenticated && (
          <div className="mb-6 flex justify-between">
            <button
              onClick={() => router.push('/create-series')}
              className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            >
              Create New Series
            </button>

            <button
              onClick={handleCreatePost}
              className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            >
              Create Post
            </button>
          </div>
        )}

        <div>
          {/* No Posts Yet */}
          {posts.length === 0 && selectedSeries ? (
            <p className="text-center text-xl text-custom-green">
              No posts yet. Stay tuned for this upcoming series.
            </p>
          ) : (
            <>
              {/* Render the pinned post if it exists */}
              {pinnedPostId &&
                posts.some((post) => post.id === pinnedPostId) &&
                posts
                  .filter((post) => post.id === pinnedPostId)
                  .map((post) => (
                    <div key={post.id} className="card relative mb-4">
                      {post.imageUrl && (
                        <div className="lg:h-70 relative h-48 w-full overflow-hidden md:h-56">
                          <Image
                            src={post.imageUrl}
                            alt={post.title || 'Posted image'}
                            layout="fill"
                            objectFit="cover"
                            objectPosition={
                              specificPostIds.includes(post.id)
                                ? 'center'
                                : 'top center'
                            }
                            className="card-img"
                          />
                        </div>
                      )}
                      {post.title && (
                        <div className={post.imageUrl ? 'pt-4' : ''}>
                          <h2 className="card-title">{post.title}</h2>
                          {post.isDraft && (
                            <span className="font-semibold text-red-500">
                              Draft
                            </span>
                          )}
                        </div>
                      )}
                      {post.date && (
                        <p className="card-text">
                          <strong>Posted:</strong>{' '}
                          {formatDate(new Date(post.date))}
                        </p>
                      )}
                      {post.editedDate && (
                        <p className="card-text">
                          <strong>Edited:</strong>{' '}
                          {formatDate(new Date(post.editedDate))}
                        </p>
                      )}
                      <div className="card-text">
                        {renderContent(truncateContent(post.content, 110))}
                      </div>
                      <a
                        href={`/${
                          isReviewCategory(post.category)
                            ? 'reviews'
                            : 'interests'
                        }/${post.category}/${post.id}`}
                        className="card-link"
                      >
                        Read more
                      </a>
                      {isAuthenticated && (
                        <div className="mt-2 flex space-x-2">
                          <button
                            onClick={() => handleEdit(post)}
                            className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(post)}
                            className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                      <div className="absolute bottom-5 right-5 flex items-center">
                        <span className="text-xl font-semibold text-white">
                          Pinned
                        </span>
                        <FontAwesomeIcon
                          icon={faThumbtack}
                          className="ml-2 text-white"
                        />
                      </div>
                    </div>
                  ))}

              {/* Render the rest of the posts */}
              {posts
                .filter((post) => post.id !== pinnedPostId)
                .map((post) => {
                  const section = isReviewCategory(post.category)
                    ? 'reviews'
                    : 'interests';
                  return (
                    <div key={post.id} className="card mb-4">
                      {post.imageUrl && (
                        <div className="lg:h-70 relative h-48 w-full overflow-hidden md:h-56">
                          <Image
                            src={post.imageUrl}
                            alt={post.title || 'Posted image'}
                            layout="fill"
                            objectFit="cover"
                            objectPosition="top center"
                            className="card-img"
                          />
                        </div>
                      )}
                      {post.title && (
                        <div className={post.imageUrl ? 'pt-4' : ''}>
                          <h2 className="card-title">{post.title}</h2>
                          {post.isDraft && (
                            <span className="font-semibold text-red-500">
                              Draft
                            </span>
                          )}
                        </div>
                      )}
                      {post.date && (
                        <p className="card-text">
                          <strong>Posted:</strong>{' '}
                          {formatDate(new Date(post.date))}
                        </p>
                      )}
                      {post.editedDate && (
                        <p className="card-text">
                          <strong>Edited:</strong>{' '}
                          {formatDate(new Date(post.editedDate))}
                        </p>
                      )}
                      <div className="card-text">
                        {renderContent(truncateContent(post.content, 110))}
                      </div>
                      <a
                        href={`/${section}/${post.category}/${post.id}`}
                        className="card-link"
                      >
                        Read more
                      </a>
                      {isAuthenticated && (
                        <div className="mt-2 flex space-x-2">
                          <button
                            onClick={() => handleEdit(post)}
                            className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(post)}
                            className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </>
          )}
        </div>

        {/* Pagination Controls */}
        {posts.length > 0 && (
          <div className="mt-6 text-center">
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
                currentPage === totalPages
                  ? 'cursor-not-allowed opacity-50'
                  : ''
              }`}
              onClick={() => goToPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
