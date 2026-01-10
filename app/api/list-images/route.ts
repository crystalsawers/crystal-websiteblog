import { NextResponse } from "next/server"
import admin from "firebase-admin"
import path from "path"
import fs from "fs"

if (!admin.apps.length) {
  const serviceAccountPath = path.join(process.cwd(), "backend", "crystal-personalblog-firebase-adminsdk-xspbb-832d22a44f.json")
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"))

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  })
}

const bucket = admin.storage().bucket()

export async function GET() {
  try {
    const [files] = await bucket.getFiles({ prefix: "images/" })
    const urls = await Promise.all(
  files.map(async (f) => {
    const [metadata] = await f.getMetadata()
    const token = metadata.metadata?.firebaseStorageDownloadTokens
    return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(f.name)}?alt=media&token=${token}`
  })
)
    return NextResponse.json(urls)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
