const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const LEAD_FORM_URL =
  "https://api.tripleseat.com/ts/dynamic_leads.js?dynamic_lead_form_id=2861&public_key=7c23362edd97408759b10c76f7f9701a2a7c5881";

const DYNAMIC_LEAD_FORM_ID = "2861";
const PUBLIC_KEY = "7c23362edd97408759b10c76f7f9701a2a7c5881";
const TRIPLESEAT_LOCATION_ID = "31934";
const ROOM_IDS: Record<string, number> = {
  // "Main Room": 0,
  // "VIP Room Front": 0,
  // "VIP Room Back": 0,
  // "Main Room-private": 0,
  // "buyout": 0,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      eventDate,
      eventTime,
      guestCount,
      additionalInfo,
      venue,
      wantsPrivateRoom,
    } = body;

    let roomId: number | undefined;
    if (wantsPrivateRoom) {
      roomId = ROOM_IDS["buyout"];
    } else if (venue && ROOM_IDS[venue]) {
      roomId = ROOM_IDS[venue];
    }

    const formData = new FormData();
    formData.append("dynamic_lead_form_id", DYNAMIC_LEAD_FORM_ID);
    formData.append("public_key", PUBLIC_KEY);
    formData.append("form_data[first_name]", firstName || "");
    formData.append("form_data[last_name]", lastName || "");
    formData.append("form_data[email]", email || "");
    formData.append("form_data[phone]", phone || "");
    formData.append("form_data[location_id]", TRIPLESEAT_LOCATION_ID);
    formData.append("form_data[event_style]", "onpremise");
    formData.append("form_data[contact_preference]", "Email");
    if (company) formData.append("form_data[company]", company);
    if (eventDate) formData.append("form_data[event_date]", eventDate);
    if (eventTime) formData.append("form_data[start_time]", eventTime);
    if (guestCount) formData.append("form_data[guest_count]", String(guestCount));
    if (additionalInfo) formData.append("form_data[additional_information]", additionalInfo);
    if (roomId) formData.append("form_data[room_id]", String(roomId));

    console.log("Submitting Weston lead to Tripleseat Lead Form API");

    const response = await fetch(LEAD_FORM_URL, {
      method: "POST",
      body: formData,
    });

    const responseText = await response.text();
    console.log("Tripleseat response status:", response.status);
    console.log("Tripleseat response:", responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, error: "Tripleseat API error", details: responseData }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (responseData?.errors) {
      return new Response(
        JSON.stringify({ success: false, error: "Validation error", details: responseData.errors }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: responseData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error submitting lead:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
