import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
const serviceAccountPath = path.resolve(__dirname, 'crystal-personalblog-firebase-adminsdk-xspbb-872bcd5873.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function exportData() {
  // Create the 'recent_data' directory if it doesn't exist
  const recentDataDir = path.resolve(__dirname, 'recent_data');
  if (!fs.existsSync(recentDataDir)) {
    fs.mkdirSync(recentDataDir);
  }

  // Get all collections in the database
  const collections = await db.listCollections();
  
  for (const collection of collections) {
    console.log(`Processing collection: ${collection.id}`);
    
    const snapshot = await collection.get();
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (docs.length > 0) {
      // Write collection data to a JSON file in 'recent_data'
      const filePath = path.join(recentDataDir, `${collection.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(docs, null, 2));
      console.log(`Exported ${docs.length} documents to ${filePath}`);
    } else {
      console.log(`No documents found in collection: ${collection.id}`);
    }
  }

  console.log('Data export complete!');
}

exportData().catch(console.error);
