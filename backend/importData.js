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

    for (const [collection, docsArray] of Object.entries(data)) {
      console.log(`Processing collection: ${collection}`);

      if (Array.isArray(docsArray)) {
        for (const item of docsArray) {
          try {
            console.log(`Processing item:`, item);

            // Detailed field checks
            if (!item.start_of_journey || !item.milestones || !item.challenges || !item.skills || !item.future_aspirations) {
              console.warn(`Item missing required fields for update or addition:`, item);
              console.warn(`Missing fields:`, {
                start_of_journey: !item.start_of_journey,
                milestones: !item.milestones,
                challenges: !item.challenges,
                skills: !item.skills,
                future_aspirations: !item.future_aspirations
              });
              continue;
            }

            const existingDocQuery = db.collection(collection)
              .where('start_of_journey', '==', item.start_of_journey)
              .where('future_aspirations', '==', item.future_aspirations); // Example fields for uniqueness

            const snapshot = await existingDocQuery.get();

            if (snapshot.empty) {
              console.log(`No existing document found, adding new document.`);
              await db.collection(collection).add(item);
              console.log(`Added new document to ${collection}:`, item);
            } else {
              for (const doc of snapshot.docs) {
                console.log(`Updating document ID ${doc.id} in collection ${collection}:`, item);

                const updateData = {};

                // Check and update each field
                if (item.start_of_journey) updateData.start_of_journey = item.start_of_journey;
                if (Array.isArray(item.milestones)) updateData.milestones = item.milestones;
                if (Array.isArray(item.challenges)) updateData.challenges = item.challenges;
                if (Array.isArray(item.skills)) updateData.skills = item.skills;
                if (item.future_aspirations) updateData.future_aspirations = item.future_aspirations;

                // Perform update
                await db.collection(collection).doc(doc.id).set(updateData, { merge: true });
                console.log(`Updated document in ${collection} with ID ${doc.id}:`, updateData);
              }
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
