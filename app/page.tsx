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
} from 'firebase/firestore';
import { sortPostsByDate } from '../lib/utils/sortPostsByDate';
import { formatDate } from '../lib/utils/formatDate';
import renderContent from '@/lib/utils/renderContent';
import { truncateContent } from '@/lib/utils/truncateContent';
import Loading from './loading';
import Image from 'next/image';
import { useAuth } from './components/AuthContext';
import EditForm from './components/EditForm';
import CreateForm from './components/CreateForm'; // Import CreateForm

const categories = ['cricket', 'formula1', 'music', 'lifestyle', 'makeup'];

interface Post {
  id: string;
  title: string;
  content: string;
  date: string;
  editedDate?: string;
  category: string;
  imageUrl?: string;
  type: string;
}

const isReviewCategory = (category: string): boolean => {
  const reviewCategories = ['lifestyle', 'makeup'];
  return reviewCategories.includes(category);
};

const fetchPosts = async (): Promise<Post[]> => {
  const allPosts: Post[] = [];

  for (const category of categories) {
    const q = query(collection(db, category), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      allPosts.push({
        id: doc.id,
        title: data.title || '',
        content: data.content || '',
        date: data.date || '',
        editedDate: data.editedDate || '',
        category,
        imageUrl: data.imageUrl || '',
        type: data.type || 'default',
      } as Post);
    });
  }

  return allPosts;
};

const HomePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const { isAuthenticated } = useAuth();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false); // State to toggle CreateForm

  useEffect(() => {
    async function getPosts() {
      try {
        setLoading(true);
        const fetchedPosts = await fetchPosts();
        const sortedPosts = sortPostsByDate(fetchedPosts, 'date');
        setPosts(sortedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    }

    getPosts();
  }, []);

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
          {posts.map((post) => {
            const section = isReviewCategory(post.category)
              ? 'reviews'
              : 'interests';
            return (
              <div key={post.id} className="card mb-4">
                {post.imageUrl && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={post.imageUrl}
                      alt={post.title || 'Posted image'}
                      layout="fill"
                      objectFit="cover"
                      className="card-img"
                    />
                  </div>
                )}
                {post.title && (
                  <h2 className="card-title pt-4">{post.title}</h2>
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
