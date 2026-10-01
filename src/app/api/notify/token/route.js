import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { token, platform, deviceInfo } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    if (db) {
      await db.collection('fcm_tokens').doc(token).set({
        token,
        platform: platform || 'android',
        deviceInfo: deviceInfo || {},
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      console.log(`Registered FCM token: ${token.substring(0, 10)}...`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error registering FCM token:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
