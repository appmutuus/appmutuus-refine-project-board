// Supabase client is dynamically imported to avoid issues in non-Deno environments

interface NotificationRequest {
  event_type: string;
  recipient_id: string;
  data: Record<string, unknown>;
}

interface TemplateContent {
  email: { subject: string; html: string };
  push: { title: string; body: string };
}

const getSiteUrl = (): string => {
  if (typeof Deno !== 'undefined') {
    return Deno.env.get('SITE_URL') ?? 'http://localhost:3000';
  }
  return process.env.SITE_URL ?? 'http://localhost:3000';
};

async function getSupabaseClient() {
  const url = typeof Deno !== 'undefined' ? Deno.env.get('SUPABASE_URL') : process.env.SUPABASE_URL;
  const key = typeof Deno !== 'undefined' ? Deno.env.get('SUPABASE_ANON_KEY') : process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase env variables');
  }
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  return createClient(url, key);
}

export function buildNotificationContent(
  eventType: string,
  data: Record<string, unknown>,
): TemplateContent | null {
  const lang = typeof data.lang === 'string' ? data.lang : undefined;
  switch (eventType) {
    case 'NEW_APPLICATION': {
      const jobTitle = String(data.job_title ?? '');
      const applicant = String(data.applicant_name ?? '');
      const url = `${getSiteUrl()}/dashboard/applications`;
      if (lang === 'de') {
        return {
          email: {
            subject: `Neue Bewerbung für ${jobTitle}`,
            html:
              `<p>${applicant} hat sich auf ${jobTitle} beworben.</p><p><a href="${url}">Ansehen</a></p>`,
          },
          push: {
            title: 'Neue Bewerbung',
            body: `${applicant} hat sich beworben`,
          },
        };
      }
      return {
        email: {
          subject: `New application for ${jobTitle}`,
          html:
            `<p>${applicant} applied for ${jobTitle}.</p><p><a href="${url}">View</a></p>`,
        },
        push: {
          title: 'New application',
          body: `${applicant} has applied`,
        },
      };
    }
    case 'job_applied': {
      const jobTitle = String(data.job_title ?? '');
      const applicant = String(data.applicant_name ?? '');
      const url = `${getSiteUrl()}/dashboard/applications`;
      if (lang === 'de') {
        return {
          email: {
            subject: `Neue Bewerbung für ${jobTitle}`,
            html:
              `<p>${applicant} hat sich auf ${jobTitle} beworben.</p><p><a href="${url}">Ansehen</a></p>`,
          },
          push: {
            title: 'Neue Bewerbung',
            body: `${applicant} hat sich beworben`,
          },
        };
      }
      return {
        email: {
          subject: `New application for ${jobTitle}`,
          html:
            `<p>${applicant} applied for ${jobTitle}.</p><p><a href="${url}">View</a></p>`,
        },
        push: {
          title: 'New application',
          body: `${applicant} has applied`,
        },
      };
    }
    default:
      return null;
  }
}

async function sendEmail(
  to: string,
  content: { subject: string; html: string },
): Promise<void> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) throw new Error('Missing RESEND_API_KEY');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: 'jobs@yourdomain.com',
      to,
      subject: content.subject,
      html: content.html,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error: ${res.status} ${text}`);
  }
}

async function sendPush(
  pushToken: string | null,
  payload: { title: string; body: string },
): Promise<void> {
  if (!pushToken) return;
  const apiKey = Deno.env.get('ONESIGNAL_API_KEY');
  const appId = Deno.env.get('ONESIGNAL_APP_ID');
  if (!apiKey || !appId) throw new Error('Missing OneSignal env vars');
  const res = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${apiKey}`,
    },
    body: JSON.stringify({
      app_id: appId,
      include_player_ids: [pushToken],
      headings: { en: payload.title },
      contents: { en: payload.body },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OneSignal error: ${res.status} ${text}`);
  }
}

export default async (req: Request): Promise<Response> => {
  try {
    const body: NotificationRequest = await req.json();
    const { event_type, recipient_id, data } = body;
    if (!event_type || !recipient_id) {
      return new Response('Invalid payload', { status: 400 });
    }
    const content = buildNotificationContent(event_type, data);
    if (!content) {
      return new Response('Unsupported event type', { status: 400 });
    }
    const supabase = await getSupabaseClient();
    interface Profile {
      email: string;
      push_token: string | null;
    }
    const { data: profile, error } = await supabase
      .from<Profile>('profiles')
      .select('email,push_token')
      .eq('id', recipient_id)
      .single();
    if (error || !profile) {
      console.error('Profile lookup failed', error);
      return new Response('Profile lookup failed', { status: 500 });
    }
    await Promise.all([
      sendEmail(profile.email, content.email),
      sendPush(profile.push_token, content.push),
    ]);
    return new Response('OK');
  } catch (err) {
    console.error('send-notification failed', err);
    return new Response('Internal Server Error', { status: 500 });
  }
};

