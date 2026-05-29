import { createClient } from 'npm:@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const ADDON_LABELS: Record<string, string> = {
  tablecloths: 'White Tablecloths ($60)',
  avSpeaker: 'JBL Speaker + 2 Mics ($150)',
  liveMusic: 'Live Music (from $300)',
  ownMusician: 'Bringing own musician',
};

function buildContractContent(event: any) {
  const q = event.quote || {};
  const addons = Object.entries(event.addons || {}).filter(([, v]) => v).map(([k]) => ADDON_LABELS[k] || k);
  return {
    client: event.full_name,
    email: event.email,
    eventDate: event.event_date,
    eventTime: event.event_time,
    location: 'Salumeria 104 Weston — 1370 Weston Rd, Weston, FL 33326',
    guestCount: event.guest_count,
    menuTier: event.menu_tier,
    courseChoice: event.course_choice,
    selections: event.menu_selections || {},
    beverage: event.beverage_strategy === 'open-bar'
      ? `Open Bar — ${event.bar_type} (${event.bar_duration})`
      : event.beverage_strategy === 'consumption' ? 'Beverages on consumption' : '—',
    addons,
    pricing: {
      subtotal: q.subtotal || 0,
      serviceCharge: q.serviceCharge || 0,
      salesTax: q.salesTax || 0,
      grandTotal: q.grandTotal || 0,
    },
    paymentTerms: 'Payment is due at the end of your event. Your credit card on file is not charged until the day of the event.',
    cancellationPolicy: '[INSERT CANCELLATION POLICY HERE]',
  };
}
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const row = {
      full_name: String(body.fullName || '').slice(0, 200),
      email: String(body.email || '').slice(0, 200),
      phone: body.phone || null,
      company: body.company || null,
      event_date: body.eventDate || null,
      event_time: body.time || null,
      is_lunch: !!body.isLunch,
      guest_count: Number(body.guestCount) || 0,
      adult_count: Number(body.adultCount) || 0,
      kids_count: Number(body.kidsCount) || 0,
      wants_private_room: !!body.wantsPrivateRoom,
      menu_tier: body.menu || null,
      course_choice: body.courseChoice || null,
      menu_selections: body.menuSelections || {},
      decide_later: !!body.decideLater,
      beverage_strategy: body.beverageStrategy || null,
      bar_type: body.barType || null,
      bar_duration: body.barDuration || null,
      addons: body.addons || {},
      allergens: body.allergens || null,
      special_requests: body.specialRequests || null,
      bringing_cake: !!body.bringingCake,
      bringing_decor: !!body.bringingDecor,
      quote: body.quote || {},
      // All new leads start locked — Julie checks availability before unlocking
      // the portal so the client can proceed through contract/payment/menu.
      portal_unlocked: false,
    };

    const { data: event, error } = await admin.from('events').insert(row).select().single();
    if (error) throw error;

    // Auto-generate the contract from their selections — we are the CRM now.
    const contractContent = buildContractContent(event);
    await admin.from('contracts').insert({ event_id: event.id, content: contractContent });
    await admin.from('events').update({
      status: 'contract_sent',
      contract_sent_at: new Date().toISOString(),
    }).eq('id', event.id);

    await admin.from('admin_notifications').insert({
      event_id: event.id,
      kind: 'new_lead',
      message: `New lead + contract ready: ${event.full_name} — ${event.guest_count} guests on ${event.event_date || 'TBD'}`,
    });

    const origin = req.headers.get('origin') || '';
    const portalUrl = `${origin}/portal/${event.portal_token}`;

    if (RESEND_API_KEY && event.email) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Salumeria 104 Weston <onboarding@resend.dev>',
            to: [event.email],
            subject: 'Your Salumeria 104 event — next steps',
            html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f5f1e8;color:#2c2c2c">
              <h2 style="color:#5a6d5a">Ciao ${event.full_name.split(' ')[0] || ''},</h2>
              <p>Thank you for your event request at <strong>Salumeria 104 Weston</strong>.</p>
              <p>Use the secure link below to review your quote, sign your contract, authorize your card, and submit your menu header — all in one place.</p>
              <p style="text-align:center;margin:28px 0">
                <a href="${portalUrl}" style="background:#5a6d5a;color:#fff;padding:14px 28px;text-decoration:none;border-radius:2px;display:inline-block">Open your event portal</a>
              </p>
              <p>Warm regards,<br>Julie<br><em>Event Coordinator, Salumeria 104</em></p>
            </div>`,
          }),
        });
      } catch (e) { console.warn('portal email failed', e); }
    }

    return new Response(JSON.stringify({ success: true, eventId: event.id, portalToken: event.portal_token, portalUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
