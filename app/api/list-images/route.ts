import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const bucket = admin.storage().bucket();

export async function GET() {
  try {
    // Get all files under 'images/' folder
    const [files] = await bucket.getFiles({ prefix: 'images/' });

    // Map files to include download URL and last updated timestamp
    const filesWithDate = await Promise.all(
      files.map(async (f) => {
        const [metadata] = await f.getMetadata();
        const token = metadata.metadata?.firebaseStorageDownloadTokens;
        return {
          name: f.name,
          url: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(f.name)}?alt=media&token=${token}`,
          updated: metadata.updated, // ISO timestamp of last update
        };
      }),
    );

    // Sort files by updated timestamp, most recent first
    filesWithDate.sort(
      (a, b) =>
        new Date(b.updated ?? 0).getTime() - new Date(a.updated ?? 0).getTime(),
    );

    // Return only the URLs (frontend stays the same)
    const urls = filesWithDate.map((f) => f.url);

    return NextResponse.json(urls);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
