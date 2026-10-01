import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

if (!getApps().length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // Replace literal \n with actual newlines if they are escaped in the environment variable
    const privateKey = process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined;

    if (projectId && clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log("Firebase Admin Initialized successfully.");
    } else {
      console.warn("Firebase environment variables are missing. Firebase features will be disabled.");
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

export const db = getApps().length > 0 ? getFirestore() : null;
export const messaging = getApps().length > 0 ? getMessaging() : null;

if (db) {
  try {
    db.settings({ ignoreUndefinedProperties: true });
  } catch (e) {
    // Ignore if already configured by Firestore instance
  }
}

/**
 * Sends a push notification to all subscribed Android app devices & stored FCM tokens.
 * @param {Object} payload - { title: string, body: string, data?: Object }
 */
export async function sendPushNotification({ title, body, data = {} }) {
  if (!messaging) {
    console.warn("Firebase Messaging is not initialized.");
    return { success: false, reason: "Firebase messaging not initialized" };
  }

  const results = {
    topicSent: false,
    tokensSent: 0,
    tokensFailed: 0,
  };

  // 1. Send to topic 'factory_updates'
  try {
    const topicMessage = {
      topic: 'factory_updates',
      notification: {
        title,
        body,
      },
      data: {
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        ...data,
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'factory_updates_channel',
          priority: 'max',
          defaultVibrateTimings: true,
          defaultSound: true,
        },
      },
    };

    const response = await messaging.send(topicMessage);
    console.log('Successfully sent notification to topic factory_updates:', response);
    results.topicSent = true;
  } catch (topicError) {
    console.error('Error sending notification to topic factory_updates:', topicError);
    results.topicError = topicError.message;
  }

  // 2. Also send directly to registered device tokens in Firestore (if any)
  try {
    if (db) {
      const tokensSnapshot = await db.collection('fcm_tokens').get();
      if (!tokensSnapshot.empty) {
        const tokens = tokensSnapshot.docs.map(doc => doc.id).filter(Boolean);
        if (tokens.length > 0) {
          const multiMessage = {
            tokens: tokens,
            notification: {
              title,
              body,
            },
            data: {
              ...data,
            },
            android: {
              priority: 'high',
              notification: {
                sound: 'default',
                channelId: 'factory_updates_channel',
                priority: 'max',
                defaultVibrateTimings: true,
                defaultSound: true,
              },
            },
          };

          const batchResponse = await messaging.sendEachForMulticast(multiMessage);
          results.tokensSent = batchResponse.successCount;
          results.tokensFailed = batchResponse.failureCount;
          console.log(`Multicast sent: ${batchResponse.successCount} success, ${batchResponse.failureCount} failure.`);

          // Clean up invalid tokens if any
          if (batchResponse.failureCount > 0) {
            batchResponse.responses.forEach(async (resp, idx) => {
              if (!resp.success) {
                const errCode = resp.error?.code;
                if (errCode === 'messaging/invalid-registration-token' ||
                    errCode === 'messaging/registration-token-not-registered') {
                  const badToken = tokens[idx];
                  await db.collection('fcm_tokens').doc(badToken).delete().catch(() => {});
                }
              }
            });
          }
        }
      }
    }
  } catch (tokenError) {
    console.error('Error sending multicast to device tokens:', tokenError);
  }

  return { success: results.topicSent || results.tokensSent > 0, results };
}

