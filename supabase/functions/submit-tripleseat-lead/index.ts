const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const LEAD_FORM_URL =
  "https://api.tripleseat.com/ts/dynamic_leads.js?dynamic_lead_form_id=2861&public_key=7c23362edd97408759b10c76f7f9701a2a7c5881";

// NOTE: Weston location/room IDs — these must be provided by the Tripleseat admin
// for Salumeria 104 Weston. Until provided, leads are still created against the
// Graspa Group account but without location/room routing. The form text (party
// request #42882) is the public lead form for Weston at graspagroup.tripleseat.com.
const TRIPLESEAT_LOCATION_ID: number | undefined = undefined; // TODO: set Weston location_id
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

    const leadPayload: Record<string, any> = {
      first_name: firstName || "",
      last_name: lastName || "",
      email_address: email || "",
      phone_number: phone || "",
    };
    if (company) leadPayload.company = company;
    if (eventDate) leadPayload.event_date = eventDate;
    if (eventTime) leadPayload.start_time = eventTime;
    if (guestCount) leadPayload.guest_count = String(guestCount);
    if (additionalInfo) leadPayload.additional_information = additionalInfo;
    if (TRIPLESEAT_LOCATION_ID) leadPayload.location_id = TRIPLESEAT_LOCATION_ID;
    if (roomId) leadPayload.room_id = roomId;

    console.log("Submitting Weston lead to Tripleseat Lead Form API");

    const formData = new URLSearchParams();
    for (const [key, value] of Object.entries(leadPayload)) {
      formData.append(`lead[${key}]`, String(value));
    }

    const response = await fetch(LEAD_FORM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
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
