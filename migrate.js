const fs = require('fs/promises');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

async function migrate() {
  const envData = await fs.readFile('.env.local', 'utf-8');
  const env = {};
  envData.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      env[parts[0]] = parts.slice(1).join('=').replace(/^"|"$/g, '');
    }
  });

  const privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
  
  const db = getFirestore();
  
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'archive-2026-07.json');
    const fileData = await fs.readFile(filePath, 'utf-8');
    const parsedData = JSON.parse(fileData);
    
    await db.collection('monthly_archives').doc('2026-07').set(parsedData);
    console.log('Successfully migrated July 2026 archive to Firebase!');
  } catch (e) {
    console.error('Migration failed:', e);
  }
}
migrate();
