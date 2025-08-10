export interface NotificationPayload {
  event_type: string;
  recipient_id: string;
  data?: Record<string, unknown>;
}

/**
 * Sends notification via Supabase edge function.
 */
export async function sendNotification(payload: NotificationPayload) {
  try {
    const res = await fetch('/functions/v1/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error('Failed to send notification', await res.text());
    }
  } catch (err) {
    console.error('Notification error', err);
  }
}
