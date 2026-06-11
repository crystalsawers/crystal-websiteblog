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
    const docRef = doc(db, 'embedded', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      const cleanDescription = data.content
        ? data.content.replace(/[*#_~`\[\]()>|\\]/g, '').substring(0, 125)
        : 'Check out this embedded systems project';

      return {
        title: data.title || 'Embedded Systems Project',
        description: cleanDescription,
        openGraph: {
          title: data.title || 'Embedded Systems Project',
          description: cleanDescription,
          siteName: 'Log, Lap, and Over',
          images: data.imageUrl
            ? [
                {
                  url: data.imageUrl,
                  width: 1200,
                  height: 630,
                  alt: data.title || 'Embedded systems project image',
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
          title: data.title || 'Embedded Systems Project',
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
    title: 'Embedded Systems Project',
    description: 'Check out this embedded systems project',
    openGraph: {
      siteName: 'Log, Lap, and Over',
    },
  };
}

const EmbeddedItem = () => {
  return <ItemPage collectionName="embedded" />;
};

export default EmbeddedItem;
