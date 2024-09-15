"use client";

import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebaseConfig'; 
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { sortPostsByDate } from '../lib/utils/sortPostsByDate'; 
import { formatDate } from '../lib/utils/formatDate'; 

const categories = [
  'cricket',
  'formula1',
  'music',
  'lifestyle',
  'makeup',
];

// Define the Post type here
interface Post {
  id: string;
  title: string;
  content: string;
  date: string; 
  category: string;
}

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

  useEffect(() => {
    async function getPosts() {
      const fetchedPosts = await fetchPosts();
      const sortedPosts = sortPostsByDate(fetchedPosts, 'date');
      setPosts(sortedPosts);
    }

    getPosts();
  }, []);

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="page-title mb-6 text-center">Latest Posts</h2>
        <div>
          {posts.map((post) => (
            <div key={post.id} className="card mb-4">
              {post.title && <h2 className="card-title">{post.title}</h2>}
              {post.date && <p className="card-text"><strong>Date:</strong> {formatDate(new Date(post.date))}</p>}
              <p className="card-text">{post.content}</p>
              <a href={`/interests/${post.category}/${post.id}`} className="card-link">Read more</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
};

export default HomePage;
