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
import EditForm from './components/EditForm';
import CreateForm from './components/CreateForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack } from '@fortawesome/free-solid-svg-icons';

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
}

const isReviewCategory = (category: string): boolean => {
  const reviewCategories = ['lifestyle', 'misc'];
  return reviewCategories.includes(category);
};

const fetchPosts = async (isAuthenticated: boolean): Promise<Post[]> => {
  const allPosts: Post[] = [];

  for (const category of categories) {
    const q = query(collection(db, category), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((documentSnapshot) => {
      const data = documentSnapshot.data();

      // Check if isDraft is defined
      if (data.isDraft === undefined) {
        console.error(
          `Post ${documentSnapshot.id} is missing the isDraft field.`,
        );
        return; // Skip posts missing the isDraft field
      }

      // Check if post should be added to allPosts
      if (isAuthenticated || data.isDraft === false) {
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
        } as Post);
      }
    });
  }

  return allPosts;
};

const HomePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const { isAuthenticated } = useAuth();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [pinnedPostId, setPinnedPostId] = useState<string | null>(null);

  const specificPostIds = [
    'Y4f0mW8ZiX35uLxGyg1S',
    '02V6uLUBhnKstE8ofH6H',
    'vcVid0cpfoGh4KdozgcS',
  ]; // make the ones I want centered

  useEffect(() => {
    async function getPosts() {
      try {
        setLoading(true);
        const fetchedPosts = await fetchPosts(isAuthenticated);
        const settingsRef = doc(db, 'settings', 'siteConfig');
        const settingsSnap = await getDoc(settingsRef);
        const pinnedId = settingsSnap.data()?.pinnedPostId || null;
        setPinnedPostId(pinnedId);
        const sortedPosts = sortPostsByDate(fetchedPosts, 'date');
        setPosts(sortedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    }

    getPosts();
  }, [isAuthenticated]);

  const handleEdit = (post: Post) => {
    setEditingPost(post);
  };

  const handleCloseEditForm = () => {
    setEditingPost(null);
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
    setIsCreateFormOpen(true); // Open the CreateForm
  };

  const handleCloseCreateForm = () => {
    setIsCreateFormOpen(false); // Close the CreateForm
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="mx-auto max-w-4xl">
        <h2 className="page-title mb-6 text-center">Latest Posts</h2>
        {isAuthenticated && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={handleCreatePost}
              className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            >
              Create Post
            </button>
          </div>
        )}

        <div>
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
                    href={`/${isReviewCategory(post.category) ? 'reviews' : 'interests'}/${post.category}/${post.id}`}
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
                  {/* Pinned label */}
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
        </div>
        {isCreateFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <CreateForm
              category=""
              onClose={handleCloseCreateForm}
              isMainPage
            />
          </div>
        )}

        {editingPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <EditForm
              category={editingPost.category}
              postId={editingPost.id}
              initialData={editingPost}
              onClose={handleCloseEditForm}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
