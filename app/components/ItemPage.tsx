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
      userId = uuidv4(); // Generate a unique user ID
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
        const data = doc.data();
        setReactionCounts((prev) => ({
          ...prev,
          [reaction.id]: data?.count || 0,
        }));

        if (data?.userIds?.includes(userId)) {
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
      const userId = getAnonymousUserId(); // Get the unique device/session ID
      const reactionRef = doc(
        db,
        `${collectionName}/${id}/reactions/${reactionId}`,
      );
      const reactionSnap = await getDoc(reactionRef);

      if (reactionSnap.exists()) {
        const data = reactionSnap.data();
        const userIds = data.userIds || [];
        const hasReacted = userIds.includes(userId);

        if (hasReacted) {
          // Remove reaction
          await updateDoc(reactionRef, {
            count: increment(-1),
            userIds: userIds.filter((uid: string) => uid !== userId), // Remove user from list
          });
          setActiveReaction(null); // Update the UI
        } else {
          // Remove previous reaction if exists
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

          // Add new reaction
          await updateDoc(reactionRef, {
            count: increment(1),
            userIds: [...userIds, userId], // Add user to list
          });
          setActiveReaction(reactionId); // Update the UI with new reaction
        }
      } else {
        // First reaction on this post
        await setDoc(reactionRef, {
          count: 1,
          userIds: [userId],
        });
        setActiveReaction(reactionId); // Update the UI with the first reaction
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
    } finally {
      setReacting(false);
    }
  };

  if (loading)
    return <p className="text-center text-custom-green">Loading...</p>;
  if (fetchError) return <p>{fetchError}</p>;
  if (!data) return <NotFound />;

  return (
    <div className="responsive-container">
      <div className="mb-4 flex justify-between">
        <button
          onClick={handleBack}
          className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        >
          Back
        </button>
        {!editMode && (
          <div>
            {isAuthenticated && (
              <>
                <button
                  onClick={handleEdit}
                  className="mr-2 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
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
                className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              >
                Comment
              </button>
            )}
          </div>
        )}
      </div>

      {!editMode && (
        <div className="card flex flex-col">
          {(data.isDraft && isAuthenticated) || !data.isDraft ? (
            <>
              {data.date && (
                <p className="card-text mb-4">
                  <strong>Posted:</strong> {formatDate(new Date(data.date))}
                </p>
              )}

              {data.editedDate && (
                <p className="card-text mb-4">
                  <strong>Edited:</strong>{' '}
                  {formatDate(new Date(data.editedDate))}
                </p>
              )}

              {data.imageUrl && (
                <div
                  className="relative mb-4 w-full"
                  style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    maxHeight: '500px',
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    src={data.imageUrl}
                    alt={data.title || 'Image'}
                    width={800}
                    height={400}
                    priority={true}
                    style={{ maxHeight: '600px', objectFit: 'cover' }}
                  />
                </div>
              )}

              <div>
                {data.title && (
                  <h1 className="card-title pt-6 text-center">{data.title}</h1>
                )}
                {data.isDraft && (
                  <span className="text-bold text-red-500">Draft</span>
                )}
                <div className="card-text">{renderContent(data.content)}</div>

                {/* Reaction bar */}
                <div className="mt-8 border-t border-black pt-6 text-black">
                  <div className="flex flex-wrap gap-4">
                    {REACTIONS.map((reaction) => (
                      <button
                        key={reaction.id}
                        onClick={() => handleReaction(reaction.id)}
                        disabled={reacting}
                        className={`flex items-center gap-2 rounded-full border border-black px-4 py-2 hover:bg-emerald-700 ${
                          activeReaction === reaction.id
                            ? 'border-blue-300 bg-emerald-700'
                            : ''
                        }`}
                        aria-label={`${reaction.id} (${reactionCounts[reaction.id] || 0})`}
                        title={reaction.description} // to describe what the emojis mean
                      >
                        <span className="text-xl">{reaction.emoji}</span>
                        <span className="text-sm">
                          {reactionCounts[reaction.id] || 0}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ItemPage;
