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
import Loading from './loading';
import Image from 'next/image';
import { useAuth } from './components/AuthContext';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { useSearchParams } from 'next/navigation';

const categories = [
  'cricket',
  'formula1',
  'music',
  'lifestyle',
  'misc',
  'apps',
  'devops',
  'embedded',
];

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
          seriesIds: data.seriesIds || [],
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
  const postsPerPage = 12;
  const searchParams = useSearchParams();
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [seriesOptions, setSeriesOptions] = useState<
    { id: string; name: string }[]
  >([]);

  const specificPostIds = [
    'Y4f0mW8ZiX35uLxGyg1S',
    '02V6uLUBhnKstE8ofH6H',
    'vcVid0cpfoGh4KdozgcS',
  ];

  useEffect(() => {
    async function fetchSeries() {
      try {
        const seriesSnapshot = await getDocs(collection(db, 'series'));

        const seriesList = seriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || 'Unnamed Series',
        }));

        setSeriesOptions(seriesList);
      } catch (error) {
        console.error('Error fetching series:', error);
      }
    }

    fetchSeries();
  }, []);

  useEffect(() => {
    const pageFromUrl = searchParams.get('page');
    setCurrentPage(pageFromUrl ? parseInt(pageFromUrl) : 1);

    async function getPosts() {
      try {
        setLoading(true);

        let seriesPostIds: string[] = [];

        if (selectedSeries) {
          const seriesRef = doc(db, 'series', selectedSeries);
          const seriesSnap = await getDoc(seriesRef);

          if (seriesSnap.exists()) {
            seriesPostIds = seriesSnap.data().postIds || [];
          } else {
            console.warn('Selected series not found in database.');
          }
        }

        const fetchedPosts = await fetchPosts(isAuthenticated);

        const filteredPosts = selectedSeries
          ? fetchedPosts.filter((post) => seriesPostIds.includes(post.id))
          : fetchedPosts;

        const settingsRef = doc(db, 'settings', 'siteConfig');
        const settingsSnap = await getDoc(settingsRef);

        const sortedPosts = sortPostsByDate(filteredPosts, 'date');

        const publishedPosts = sortedPosts.filter((post) => !post.isDraft);
        const draftPosts = sortedPosts.filter((post) => post.isDraft);

        const startIndex = (currentPage - 1) * postsPerPage;

        const paginatedPublishedPosts = publishedPosts.slice(
          startIndex,
          startIndex + postsPerPage,
        );

        setPosts([...draftPosts, ...paginatedPublishedPosts]);
        setTotalPages(Math.ceil(publishedPosts.length / postsPerPage));
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

  const goToPage = (page: number) => {
    const searchParams = new URLSearchParams(window.location.search);

    searchParams.set('page', page.toString());

    window.history.pushState({}, '', '?' + searchParams.toString());

    setCurrentPage(page);
  };

  if (loading) return <Loading />;

  const draftPosts = posts.filter((post) => post.isDraft);

  const regularPosts = posts.filter((post) => post.isDraft !== true);

  const getPostSection = (category: string) => {
    if (isReviewCategory(category)) return 'reviews';

    if (isProjectCategory(category)) return 'projects';

    return 'interests';
  };

  return (
    <div className="blog-home">
      {/*
      =========================================================
      OPTIONAL FEATURE / BANNER TEMPLATE
      =========================================================
*/}

      {/* <section className="blog-hero">
        <div className="blog-hero-content">
          <span className="blog-eyebrow">FEATURED</span>

          <h1 className="blog-hero-title">
            A collection of things
            <br />
            worth exploring.
          </h1>

          <p className="blog-hero-text">
            Featured posts, projects, ideas and other things from the blog.
          </p>
        </div>
      </section> */}

      {/*
      =========================================================
      */}

      <section className="latest-section">
        <div className="section-heading-row">
          <div>
            <span className="section-eyebrow">THE LATEST</span>

            <h2 className="section-title">Latest Posts</h2>
          </div>

          <div className="series-filter">
            <label htmlFor="series-filter">Blog Series</label>

            <select
              id="series-filter"
              value={selectedSeries || ''}
              onChange={(e) => {
                setSelectedSeries(e.target.value || null);
                setCurrentPage(1);
              }}
            >
              <option value="">All Series</option>

              {seriesOptions.map((series) => (
                <option key={series.id} value={series.id}>
                  {series.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isAuthenticated && (
          <div className="admin-controls">
            <button
              onClick={() => router.push('/create-series')}
              className="admin-button"
            >
              Create New Series
            </button>

            <button onClick={handleCreatePost} className="admin-button">
              Create Post
            </button>
          </div>
        )}

        {posts.length === 0 && selectedSeries ? (
          <div className="empty-posts">
            <p>No posts yet. Stay tuned for this upcoming series.</p>
          </div>
        ) : (
          <>
            {/* DRAFT POSTS */}
            {isAuthenticated && draftPosts.length > 0 && (
              <>
                <div className="posts-section-heading">
                  <span className="section-eyebrow">DRAFTS</span>
                </div>

                <div className="modern-post-grid draft-posts-grid">
                  {draftPosts.map((post) => {
                    const section = getPostSection(post.category);

                    return (
                      <article key={post.id} className="modern-post-card">
                        {post.imageUrl && (
                          <div className="modern-post-image">
                            <Image
                              src={post.imageUrl}
                              alt={post.title || 'Posted image'}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              style={{
                                objectFit: 'cover',
                                objectPosition: specificPostIds.includes(
                                  post.id,
                                )
                                  ? 'center'
                                  : 'top center',
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
                            <h3 className="modern-post-title">{post.title}</h3>
                          )}

                          <span className="draft-label">Draft</span>

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

                          <div className="post-admin-controls">
                            <button
                              onClick={() => handleEdit(post)}
                              className="edit-button"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(post)}
                              className="delete-button"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}

            {/* RECENTLY PUBLISHED */}
            <div className="posts-section-heading">
              <span className="section-eyebrow">RECENTLY PUBLISHED</span>
            </div>

            <div className="modern-post-grid">
              {regularPosts.map((post) => {
                const section = getPostSection(post.category);

                return (
                  <article key={post.id} className="modern-post-card">
                    {post.imageUrl && (
                      <div className="modern-post-image">
                        <Image
                          src={post.imageUrl}
                          alt={post.title || 'Posted image'}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          style={{
                            objectFit: 'cover',
                            objectPosition: specificPostIds.includes(post.id)
                              ? 'center'
                              : 'top center',
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
                        <h3 className="modern-post-title">{post.title}</h3>
                      )}

                      {post.isDraft && (
                        <span className="draft-label">Draft</span>
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

                      {isAuthenticated && (
                        <div className="post-admin-controls">
                          <button
                            onClick={() => handleEdit(post)}
                            className="edit-button"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(post)}
                            className="delete-button"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {regularPosts.length > 0 && (
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
        )}
      </section>
    </div>
  );
};

export default HomePage;
