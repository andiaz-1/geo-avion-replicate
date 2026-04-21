const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const LOCATION_NAME = "Salumeria 104 Weston";
const COORDINATOR_EMAIL = "julie@graspagroup.com";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data = await req.json();

    const {
      venue, wantsPrivateRoom, date, time, timeTag, guestCount, hasKids, kidsCount,
      menu, courseChoice, menuSelections, decideLater, allergens,
      beverageStrategy, barType, barDuration,
      addons, fullName, email, phone, company, specialRequests,
      quote
    } = data;

    const adultCount = guestCount - (hasKids ? kidsCount : 0);

    const addonsActive = Object.entries(addons || {})
      .filter(([, v]) => v)
      .map(([k]) => {
        const labels: Record<string, string> = {
          tablecloths: "White Tablecloths ($60)",
          avSpeaker: "JBL Speaker + 2 Mics ($150)",
          liveMusic: "Live Music (from $300)",
          ownMusician: "Bringing own musician",
        };
        return labels[k] || k;
      });

    const barLabel = beverageStrategy === "open-bar"
      ? `Open Bar – ${barType === "full-bar" ? "Full Bar" : "Wine/Beer/Prosecco/Softs"} (${barDuration})`
      : beverageStrategy === "consumption"
      ? "Beverages on Consumption"
      : "Not selected";

    let menuSelectionsHtml = "";
    if (decideLater) {
      menuSelectionsHtml = `<tr><td style="padding: 6px 0; font-weight: bold;">Selections:</td><td><em>To be finalized later</em></td></tr>`;
    } else if (menuSelections && Object.keys(menuSelections).length > 0) {
      const entries = Object.entries(menuSelections).filter(([, items]: [string, any]) => items?.length > 0);
      if (entries.length > 0) {
        menuSelectionsHtml = entries.map(([course, items]: [string, any]) =>
          `<tr><td style="padding: 6px 0; font-weight: bold;">${course}:</td><td>${(items as string[]).join(", ")}</td></tr>`
        ).join("");
      }
    }

    const courseChoiceHtml = courseChoice
      ? `<tr><td style="padding: 6px 0; font-weight: bold;">Course Choice:</td><td>${courseChoice === "insalate" ? "Insalate (Salad/Soup)" : "Dolci (Dessert)"}</td></tr>`
      : "";

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h1 style="color: #1a1a1a; border-bottom: 2px solid #c4a265; padding-bottom: 12px;">
          New Booking Request — ${LOCATION_NAME}
        </h1>
        
        <h2 style="color: #c4a265; margin-top: 24px;">Contact Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; font-weight: bold;">Name:</td><td>${fullName}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Email:</td><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Phone:</td><td><a href="tel:${phone}">${phone}</a></td></tr>
          ${company ? `<tr><td style="padding: 6px 0; font-weight: bold;">Company:</td><td>${company}</td></tr>` : ""}
        </table>

        <h2 style="color: #c4a265; margin-top: 24px;">Event Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; font-weight: bold;">Date:</td><td>${date}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Time:</td><td>${time} (${timeTag})</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Venue:</td><td>${wantsPrivateRoom ? "Private Event / Full Buyout" : venue}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Guests:</td><td>${guestCount} total${hasKids && kidsCount > 0 ? ` (${adultCount} adults, ${kidsCount} children)` : ""}</td></tr>
        </table>

        <h2 style="color: #c4a265; margin-top: 24px;">Menu & Beverages</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; font-weight: bold;">Menu:</td><td>${menu} (${timeTag})</td></tr>
          ${courseChoiceHtml}
          ${menuSelectionsHtml}
          <tr><td style="padding: 6px 0; font-weight: bold;">Beverages:</td><td>${barLabel}</td></tr>
          ${allergens ? `<tr><td style="padding: 6px 0; font-weight: bold;">Allergies/Dietary:</td><td>${allergens}</td></tr>` : ""}
        </table>

        ${addonsActive.length > 0 ? `
        <h2 style="color: #c4a265; margin-top: 24px;">Add-ons</h2>
        <ul>${addonsActive.map((a: string) => `<li>${a}</li>`).join("")}</ul>
        ` : ""}

        ${specialRequests ? `
        <h2 style="color: #c4a265; margin-top: 24px;">Special Requests</h2>
        <p>${specialRequests}</p>
        ` : ""}

        <h2 style="color: #c4a265; margin-top: 24px;">Estimated Quote</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; font-weight: bold;">Subtotal:</td><td>$${quote?.subtotal?.toLocaleString() || "—"}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Service Charge (23%):</td><td>$${quote?.serviceCharge?.toFixed(2) || "—"}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Sales Tax (8%):</td><td>$${quote?.salesTax?.toFixed(2) || "—"}</td></tr>
          <tr style="font-size: 18px; font-weight: bold;">
            <td style="padding: 12px 0; border-top: 2px solid #c4a265;">Estimated Total:</td>
            <td style="padding: 12px 0; border-top: 2px solid #c4a265;">$${quote?.grandTotal?.toFixed(2) || "—"}</td>
          </tr>
          ${quote?.isConsumption ? `<tr><td colspan="2" style="color: #c4a265; font-style: italic;">Plus Beverages on Consumption</td></tr>` : ""}
        </table>
      </div>
    `;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("Email service is not configured yet (missing RESEND_API_KEY).");
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${LOCATION_NAME} Bookings <onboarding@resend.dev>`,
        to: [COORDINATOR_EMAIL],
        subject: `New Booking Request — ${fullName} — ${guestCount} guests — ${date}`,
        html: emailHtml,
        reply_to: email,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      throw new Error(`Email send failed [${res.status}]: ${err}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
