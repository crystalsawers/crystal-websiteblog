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
    const docRef = doc(db, 'misc', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      const cleanDescription = data.content
        ? data.content.replace(/[*#_~`\[\]()>|\\]/g, '').substring(0, 125)
        : 'Check out this miscellaneous post';

      return {
        title: data.title || 'Miscellaneous Post',
        description: cleanDescription,
        openGraph: {
          title: data.title || 'Miscellaneous Post',
          description: cleanDescription,
          siteName: 'Log, Lap, and Over',
          images: data.imageUrl
            ? [
                {
                  url: data.imageUrl,
                  width: 1200,
                  height: 630,
                  alt: data.title || 'Miscellaneous post image',
                },
              ]
            : [
                {
                  url: '/log-lap-and-over-high-resolution-logo-transparent.png',
                  width: 1200,
                  height: 630,
                  alt: 'Log, Lap, and Over',
                },
              ],
        },
        twitter: {
          card: 'summary_large_image',
          title: data.title || 'Miscellaneous Post',
          description: cleanDescription,
          images: data.imageUrl
            ? [data.imageUrl]
            : ['/log-lap-and-over-high-resolution-logo-transparent.png'],
        },
      };
    }
  } catch (error) {
    console.error('Error fetching metadata:', error);
  }

  return {
    title: 'Miscellaneous Post',
    description: 'Check out this miscellaneous post',
    openGraph: {
      siteName: 'Log, Lap, and Over',
    },
  };
}

const MiscellaneousItem = () => {
  return <ItemPage collectionName="misc" />;
};

export default MiscellaneousItem;
