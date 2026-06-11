import type { Metadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebaseConfig';
import ItemPage from '../../../components/ItemPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const docRef = doc(db, 'music', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        title: data.title || 'Music Post',
        description: data.content
          ? data.content.substring(0, 160)
          : 'Check out this music post',
        openGraph: {
          title: data.title || 'Music Post',
          description: data.content
            ? data.content.substring(0, 160)
            : 'Check out this music post',
          images: data.imageUrl
            ? [{ url: data.imageUrl, width: 1200, height: 630 }]
            : undefined,
        },
      };
    }
  } catch (error) {
    console.error('Error fetching metadata:', error);
  }

  return {
    title: 'Music Post',
    description: 'Check out this music post',
  };
}

// Update
const MusicItem = () => {
  return <ItemPage collectionName="music" />;
};

export default MusicItem;
