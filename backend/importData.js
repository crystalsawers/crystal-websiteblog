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

async function importData() {
  // Path to the directory containing JSON files
  const jsonDir = path.resolve(__dirname);
  const files = fs.readdirSync(jsonDir).filter(file => file.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(jsonDir, file);
    const fileData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileData);

    console.log(`Processing data from file: ${filePath}`);

    // Process each collection in the data
    for (const [collection, docsArray] of Object.entries(data)) {
      console.log(`Processing collection: ${collection}`);

      if (Array.isArray(docsArray)) {
        for (const item of docsArray) {
          try {
            // Check if the required field exists
            if (!item.title) {
              console.warn(`Skipping item without title:`, item);
              continue;
            }

            // Create a query to find documents with the same title
            const existingDocQuery = db.collection(collection).where('title', '==', item.title);
            const snapshot = await existingDocQuery.get();

            if (snapshot.empty) {
              // If no document exists, add it
              await db.collection(collection).add(item);
              console.log(`Added new document to ${collection}:`, item);
            } else {
              // If the document exists, update it
              snapshot.forEach(async (doc) => {
                await db.collection(collection).doc(doc.id).set(item, { merge: true });
                console.log(`Updated document in ${collection}:`, item);
              });
            }
          } catch (error) {
            console.error(`Error processing document for ${collection}:`, error);
          }
        }
      } else {
        console.warn(`Skipping collection ${collection} because it is not an array.`);
      }
    }
  }

  console.log('Data import complete!');
}

importData().catch(console.error);
