import { createClient } from 'npm:@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const TEMPLATES: Record<string, { subject: (n: string, d: string) => string; body: (n: string, d: string, url: string) => string }> = {
  contract_48h: {
    subject: (_n, _d) => `Quick reminder — your Salumeria 104 date is not locked in yet`,
    body: (n, d, url) => `Ciao ${n}, just a friendly reminder that your event on ${d} at Salumeria 104 Weston is still pending your contract signature. Sign here to lock in your date: ${url}. Warm regards, Julie`,
  },
  menu_header_10d: {
    subject: (n, _d) => `One last thing before your event — ${n}`,
    body: (n, d, url) => `Ciao ${n}, your event is coming up on ${d} and we just need your menu header to finalize your custom printed menus. Submit it here: ${url}. Warm regards, Julie`,
  },
  cc_auth_14d: {
    subject: (_n, d) => `Action needed — complete your card authorization for ${d}`,
    body: (n, d, url) => `Ciao ${n}, your event at Salumeria 104 Weston on ${d} is almost fully confirmed — just your card authorization remaining. Complete it here: ${url}. Remember, nothing is charged until the day of your event. Warm regards, Julie`,
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    // Require admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Unauthorized');
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error('Unauthorized');
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: roles } = await admin.from('user_roles').select('role').eq('user_id', user.id);
    if (!roles?.some(r => r.role === 'admin')) throw new Error('Forbidden');

    const { eventId, kind } = await req.json();
    const tpl = TEMPLATES[kind];
    if (!tpl) throw new Error('Unknown template');
    const { data: event } = await admin.from('events').select('*').eq('id', eventId).single();
    if (!event) throw new Error('Event not found');

    const origin = req.headers.get('origin') || '';
    const portalUrl = `${origin}/portal/${event.portal_token}`;
    const firstName = event.full_name.split(' ')[0] || 'there';
    const dateStr = event.event_date || 'your date';
    const subject = tpl.subject(firstName, dateStr);
    const body = tpl.body(firstName, dateStr, portalUrl);

    if (RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Salumeria 104 Weston <onboarding@resend.dev>',
          to: [event.email],
          subject,
          html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f5f1e8;color:#2c2c2c">${body.replace(portalUrl, `<a href="${portalUrl}" style="color:#5a6d5a">${portalUrl}</a>`)}</div>`,
        }),
      });
      if (!res.ok) console.warn('reminder send failed', await res.text());
    }

    await admin.from('admin_notifications').insert({ event_id: event.id, kind: `nudge_${kind}`, message: `Nudge sent to ${event.email} (${kind})` });

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
