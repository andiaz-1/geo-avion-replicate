import { createClient } from 'npm:@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

async function getEventByToken(token: string) {
  const { data, error } = await admin.from('events').select('*').eq('portal_token', token).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Invalid portal token');
  return data;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { token, action } = body;
    if (!token) throw new Error('Missing token');
    const event = await getEventByToken(token);

    if (action === 'get') {
      const [{ data: contract }, { data: payAuth }, { data: header }] = await Promise.all([
        admin.from('contracts').select('*').eq('event_id', event.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        admin.from('payment_authorizations').select('id,cardholder_name,card_last4,exp_month,exp_year,status,created_at').eq('event_id', event.id).maybeSingle(),
        admin.from('menu_headers').select('*').eq('event_id', event.id).maybeSingle(),
      ]);
      return new Response(JSON.stringify({ event, contract, paymentAuth: payAuth, menuHeader: header }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'sign-contract') {
      const { signatureType, signatureValue, signerName } = body;
      if (!signerName || !signatureValue) throw new Error('Missing signature');
      const { data: existing } = await admin.from('contracts').select('id').eq('event_id', event.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (!existing) throw new Error('No contract found');
      await admin.from('contracts').update({
        signature_type: signatureType, signature_value: String(signatureValue).slice(0, 200000),
        signer_name: signerName, signed_at: new Date().toISOString(),
      }).eq('id', existing.id);
      await admin.from('events').update({ contract_signed_at: new Date().toISOString(), status: 'confirmed' }).eq('id', event.id);
      await admin.from('admin_notifications').insert({ event_id: event.id, kind: 'contract_signed', message: `Contract signed by ${signerName}` });
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'payment-auth') {
      const { cardholderName, cardNumber, expMonth, expYear } = body;
      const digits = String(cardNumber || '').replace(/\D/g, '');
      if (!cardholderName || digits.length < 12) throw new Error('Invalid card details');
      const last4 = digits.slice(-4);
      await admin.from('payment_authorizations').insert({
        event_id: event.id, cardholder_name: String(cardholderName).slice(0, 200),
        card_last4: last4, exp_month: String(expMonth || '').slice(0, 2), exp_year: String(expYear || '').slice(0, 4),
      });
      await admin.from('events').update({ payment_auth_at: new Date().toISOString() }).eq('id', event.id);
      await admin.from('admin_notifications').insert({ event_id: event.id, kind: 'payment_auth', message: `Card on file ending ${last4} for ${event.full_name}` });
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'menu-header') {
      const { headerType, value, fileBase64, fileName } = body;
      if (!['logo', 'phrase', 'standard'].includes(headerType)) throw new Error('Invalid header type');
      let storedValue: string | null = null;
      if (headerType === 'phrase') storedValue = String(value || '').slice(0, 300);
      if (headerType === 'logo' && fileBase64) {
        const cleaned = fileBase64.replace(/^data:[^;]+;base64,/, '');
        const bytes = Uint8Array.from(atob(cleaned), c => c.charCodeAt(0));
        const safeName = String(fileName || 'logo.png').replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `${event.id}/${Date.now()}-${safeName}`;
        const { error: upErr } = await admin.storage.from('menu-headers').upload(path, bytes, {
          contentType: fileName?.toLowerCase().endsWith('.jpg') || fileName?.toLowerCase().endsWith('.jpeg') ? 'image/jpeg' : 'image/png',
          upsert: true,
        });
        if (upErr) throw upErr;
        const { data: pub } = admin.storage.from('menu-headers').getPublicUrl(path);
        storedValue = pub.publicUrl;
      }
      await admin.from('menu_headers').upsert({ event_id: event.id, header_type: headerType, value: storedValue }, { onConflict: 'event_id' });
      await admin.from('events').update({ menu_header_at: new Date().toISOString() }).eq('id', event.id);
      await admin.from('admin_notifications').insert({ event_id: event.id, kind: 'menu_header', message: `Menu header submitted (${headerType}) for ${event.full_name}` });
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    throw new Error('Unknown action');
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
