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
    const [files] = await bucket.getFiles({ prefix: 'images/' });
    const urls = await Promise.all(
      files.map(async (f) => {
        const [metadata] = await f.getMetadata();
        const token = metadata.metadata?.firebaseStorageDownloadTokens;
        return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(f.name)}?alt=media&token=${token}`;
      }),
    );
    return NextResponse.json(urls);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
