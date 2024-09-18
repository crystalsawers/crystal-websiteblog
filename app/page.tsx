'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { sortPostsByDate } from '../lib/utils/sortPostsByDate';
import { formatDate } from '../lib/utils/formatDate';
import renderContent from '@/lib/utils/renderContent';
import { truncateContent } from '@/lib/utils/truncateContent';
import Loading from './loading';
import Image from 'next/image';

const categories = ['cricket', 'formula1', 'music', 'lifestyle', 'makeup'];

// Define the Post type here
interface Post {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
  imageUrl?: string;
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
      allPosts.push({ ...data, id: doc.id, category } as Post);
    });
  }

  return allPosts;
};

const HomePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <Loading />;

  return (
    <div>
      <div className="mx-auto max-w-4xl">
        <h2 className="page-title mb-6 text-center">Latest Posts</h2>
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
                {post.title && <h2 className="card-title">{post.title}</h2>}
                {post.date && (
                  <p className="card-text">
                    <strong>Posted:</strong> {formatDate(new Date(post.date))}
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
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
