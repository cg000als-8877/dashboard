import { NextResponse } from 'next/server';
import { sendPushNotification } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, body: messageBody, date, url = '/' } = body;

    const notifTitle = title || (date ? `📢 New Production Update (${date})` : '📢 Factory Production Update');
    const notifBody = messageBody || (date ? `Production data for ${date} has been updated. Tap to check latest figures.` : 'New production data is now available on your dashboard.');

    const result = await sendPushNotification({
      title: notifTitle,
      body: notifBody,
      data: {
        url,
        date: date || '',
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error sending push notification via API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
