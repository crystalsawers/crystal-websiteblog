'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  increment,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import { formatDate } from '@/lib/utils/formatDate';
import renderContent from '../../lib/utils/renderContent';
import NotFound from '../../app/not-found';
import Image from 'next/image';
import { useAuth } from '../components/AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface DocumentData {
  type: string;
  title?: string;
  content: string;
  date?: string;
  editedDate?: string;
  imageUrl?: string;
  isDraft?: boolean;
}

const REACTIONS = [
  { id: 'like', emoji: '👍', description: 'Like' },
  { id: 'love', emoji: '❤️', description: 'Love' },
  { id: 'wow', emoji: '😲', description: 'Wow' },
  { id: 'laugh', emoji: '😂', description: 'Funny' },
  { id: 'shaka', emoji: '🤙', description: 'Shaka' },
];

const ItemPage = ({ collectionName }: { collectionName: string }) => {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';

  const [data, setData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>(
    {},
  );
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [reacting, setReacting] = useState(false);

  const { isAuthenticated } = useAuth();

  const getAnonymousUserId = () => {
    let userId = localStorage.getItem('anon_user_id');

    if (!userId) {
      userId = uuidv4();
      localStorage.setItem('anon_user_id', userId);
    }

    return userId;
  };

  // Fetch post data
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        if (!db) {
          setFetchError('Firestore instance is not initialized.');
          return;
        }

        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setData(docSnap.data() as DocumentData);
        } else {
          setData(null);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error fetching document:', error.message);
          setFetchError('Error fetching data: ' + error.message);
        } else {
          console.error('An unknown error occurred', error);
          setFetchError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, collectionName]);

  useEffect(() => {
    if (data?.title) {
      document.title = data.title;
    }
  }, [data?.title]);

  // Set up real-time reaction listeners
  useEffect(() => {
    if (!id) return;

    const userId = getAnonymousUserId();

    const unsubscribes = REACTIONS.map((reaction) => {
      const ref = doc(db, `${collectionName}/${id}/reactions/${reaction.id}`);

      return onSnapshot(ref, (doc) => {
        const reactionData = doc.data();

        setReactionCounts((prev) => ({
          ...prev,
          [reaction.id]: reactionData?.count || 0,
        }));

        if (reactionData?.userIds?.includes(userId)) {
          setActiveReaction(reaction.id);
        }
      });
    });

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [id, collectionName]);

  // Check localStorage for existing reaction
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedReaction = localStorage.getItem(
        `reaction_${collectionName}_${id}`,
      );

      if (savedReaction && REACTIONS.some((r) => r.id === savedReaction)) {
        setActiveReaction(savedReaction);
      }
    }
  }, [id, collectionName]);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    if (data) {
      router.push(`/edit-post/${collectionName}/${id}`);
    }

    setEditMode(true);
  };

  const handleDelete = async () => {
    if (!isAuthenticated) {
      alert('You must be logged in to delete this post.');
      return;
    }

    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const docRef = doc(db, collectionName, id);

        await deleteDoc(docRef);

        router.push('/');
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error deleting document:', error.message);
          setFetchError('Error deleting data: ' + error.message);
        } else {
          console.error('An unknown error occurred', error);
          setFetchError('An unknown error occurred.');
        }
      }
    }
  };

  // HANDLE REACTION
  const handleReaction = async (reactionId: string) => {
    if (reacting) return;

    setReacting(true);

    try {
      const userId = getAnonymousUserId();

      const reactionRef = doc(
        db,
        `${collectionName}/${id}/reactions/${reactionId}`,
      );

      const reactionSnap = await getDoc(reactionRef);

      if (reactionSnap.exists()) {
        const reactionData = reactionSnap.data();
        const userIds = reactionData.userIds || [];
        const hasReacted = userIds.includes(userId);

        if (hasReacted) {
          await updateDoc(reactionRef, {
            count: increment(-1),
            userIds: userIds.filter((uid: string) => uid !== userId),
          });

          setActiveReaction(null);
        } else {
          if (activeReaction) {
            const prevRef = doc(
              db,
              `${collectionName}/${id}/reactions/${activeReaction}`,
            );

            const prevSnap = await getDoc(prevRef);

            if (prevSnap.exists()) {
              const prevData = prevSnap.data();

              await updateDoc(prevRef, {
                count: increment(-1),
                userIds: prevData.userIds.filter(
                  (uid: string) => uid !== userId,
                ),
              });
            }
          }

          await updateDoc(reactionRef, {
            count: increment(1),
            userIds: [...userIds, userId],
          });

          setActiveReaction(reactionId);
        }
      } else {
        await setDoc(reactionRef, {
          count: 1,
          userIds: [userId],
        });

        setActiveReaction(reactionId);
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
    } finally {
      setReacting(false);
    }
  };

  if (loading) {
    return <p className="text-center text-[#99ffd3]">Loading...</p>;
  }

  if (fetchError) {
    return <p>{fetchError}</p>;
  }

  if (!data) {
    return <NotFound />;
  }

  return (
    <div className="post-page">
      {!editMode && (
        <>
          {/* TOP CONTROLS */}
          <div className="post-page-controls">
            <button onClick={handleBack} className="post-page-back-button">
              ← Back
            </button>

            <div className="post-admin-buttons">
              {isAuthenticated && (
                <>
                  <button onClick={handleEdit} className="post-page-button">
                    Edit
                  </button>

                  <button
                    onClick={handleDelete}
                    className="post-page-button post-delete-button"
                  >
                    Delete
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <button
                  onClick={() =>
                    router.push(
                      `/feedback?postId=${id}&category=${collectionName}`,
                    )
                  }
                  className="post-page-button"
                >
                  Comment
                </button>
              )}
            </div>
          </div>

          {/* ARTICLE */}
          {(data.isDraft && isAuthenticated) || !data.isDraft ? (
            <article className="individual-post">
              {/* HEADER */}
              <header className="individual-post-header">
                <span className="individual-post-eyebrow">
                  {collectionName}
                </span>

                {data.title && (
                  <h1 className="individual-post-title">{data.title}</h1>
                )}

                <div className="individual-post-meta">
                  {data.date && (
                    <span>Posted {formatDate(new Date(data.date))}</span>
                  )}

                  {data.editedDate && (
                    <span>Edited {formatDate(new Date(data.editedDate))}</span>
                  )}

                  {data.isDraft && (
                    <span className="individual-post-draft">Draft</span>
                  )}
                </div>
              </header>

              {/* FEATURE IMAGE */}
              {data.imageUrl && (
                <div className="individual-post-image">
                  <Image
                    src={data.imageUrl}
                    alt={data.title || 'Post image'}
                    width={1500}
                    height={750}
                    priority={true}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              )}

              {/* CONTENT */}
              <div className="individual-post-content">
                {renderContent(data.content)}
              </div>

              {/* REACTIONS */}
              <div className="individual-post-reactions">
                <span className="individual-post-reactions-label">
                  REACT TO THIS POST
                </span>

                <div className="individual-post-reaction-list">
                  {REACTIONS.map((reaction) => (
                    <button
                      key={reaction.id}
                      onClick={() => handleReaction(reaction.id)}
                      disabled={reacting}
                      className={`individual-post-reaction ${
                        activeReaction === reaction.id ? 'active' : ''
                      }`}
                      aria-label={`${reaction.id} (${
                        reactionCounts[reaction.id] || 0
                      })`}
                      title={reaction.description}
                    >
                      <span className="individual-post-reaction-emoji">
                        {reaction.emoji}
                      </span>

                      <span>{reactionCounts[reaction.id] || 0}</span>
                    </button>
                  ))}
                </div>
              </div>
            </article>
          ) : null}
        </>
      )}
    </div>
  );
};

export default ItemPage;
