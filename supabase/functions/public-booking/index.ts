// E-Mail: kontakt@backtobalance.online (Resend)
/**
 * public-booking — Öffentliche Terminbuchung für Website-Besucher
 *
 * GET  /public-booking/slots?company_id=X&date=YYYY-MM-DD[&service_id=Y&location_id=Z]
 *   → Gibt freie Zeitfenster zurück (berechnet aus availability_patterns - blackout_ranges - bestehende Termine)
 *
 * POST /public-booking/book
 *   → Erstellt Termin + Kunden-Datensatz, sendet Bestätigungs-E-Mail
 *
 * POST /public-booking/cancel
 *   → Storniert Termin mit booking_id + E-Mail-Verifizierung
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";


const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
}
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  try {
    // ── GET /waitlist-respond — E-Mail-Button-Links (token-basiert) ─────
    if (req.method === "GET" && url.searchParams.get('action') === 'waitlist-respond') {
      return await handleWaitlistRespondGet(url);
    }

    // ── POST /check-intro-status — Check ob Kunde intro_status hat ────────
    if (url.pathname.endsWith("/check-intro-status") && req.method === "POST") {
      return await handleCheckIntroStatus(req);
    }

    // ── GET /slots — Freie Zeitfenster abrufen ──────────────────────────
    if (url.pathname.endsWith("/slots") && req.method === "GET") {
      return await handleGetSlots(url);
    }

    // ── POST /book — Termin buchen ──────────────────────────────────────
    if (url.pathname.endsWith("/book") && req.method === "POST") {
      return await handleBook(req);
    }

    // ── POST /cancel — Termin stornieren ────────────────────────────────
    if (url.pathname.endsWith("/cancel") && req.method === "POST") {
      return await handleCancel(req);
    }

    // ── GET /services — Verfügbare Dienstleistungen ─────────────────────
    if (url.pathname.endsWith("/services") && req.method === "GET") {
      return await handleGetServices(url);
    }

    // ── GET /reviews — Bewertungen abrufen ──────────────────────────────
    if (url.pathname.endsWith("/reviews") && req.method === "GET") {
      return await handleGetReviews(url);
    }

    // ── POST /reviews — Bewertung abgeben ───────────────────────────────
    if (url.pathname.endsWith("/reviews") && req.method === "POST") {
      return await handlePostReview(req);
    }

    // ── GET /community-reviews — Genossen-Bewertungen abrufen ─────────────
    if (url.pathname.endsWith("/community-reviews") && req.method === "GET") {
      return await handleGetCommunityReviews(url);
    }

    // ── POST /community-reviews — Genossen-Bewertung abgeben ────────────
    if (url.pathname.endsWith("/community-reviews") && req.method === "POST") {
      return await handlePostCommunityReview(req);
    }

    // ── POST /validate-discount — Rabattcode prüfen ─────────────────��────
    if (req.method === "POST" && url.pathname.endsWith("/validate-discount")) {
      return await handleValidateDiscount(req);
    }

    // ── POST /redeem-code — Buchungscode einlösen ───────────────────────
    if (req.method === "POST" && url.pathname.endsWith("/redeem-code")) {
      return await handleRedeemCode(req);
    }

    // ── POST /reschedule — Termin umbuchen ─────────────────────────────
    if (req.method === "POST" && url.pathname.endsWith("/reschedule")) {
      return await handleReschedule(req);
    }

    // ── POST /create-customer — Kundendaten aus Registrierung speichern ───
    if (req.method === "POST") {
      const body = await req.json();
      if (body.action === 'redeem-code') {
        return await handleRedeemCode(req, body);
      }
      if (body.action === 'create-customer') {
        return await handleCreateCustomer(body);
      }
      if (body.action === 'waitlist-respond') {
        return await handleWaitlistRespond(body);
      }
      if (body.action === 'advance-waitlist') {
        await notifyNextWaitlistEntry();
        return json({ success: true, message: "Nächste Person wird benachrichtigt" });
      }
      if (body.action === 'send-waitlist-notification') {
        const brevoKey = Deno.env.get("BREVO_API_KEY");
        if (!brevoKey) return json({ error: "E-Mail nicht konfiguriert" }, 500);
        const { customer_name, customer_email, preferred_date, service_type } = body;
        if (!customer_email) return json({ error: "E-Mail fehlt" }, 400);

        const bookingUrl = "https://backtobalance.online/koerperarbeit/buchen";
        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "api-key": brevoKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: { name: "Back to Balance", email: "kontakt@backtobalance.online" },
            to: [{ email: customer_email, name: customer_name || "" }],
            subject: "Gute Neuigkeiten — ein Termin ist frei geworden!",
            htmlContent: `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e0;font-family:Georgia,serif;"><tr><td align="center" style="padding:40px 20px;"><table width="560" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #e0d9c0;"><tr><td style="background:#f5f0e0;text-align:center;padding:28px 30px 20px;"><h1 style="margin:0;color:#b61818;font-size:24px;">Back to Balance</h1><p style="margin:4px 0 0;color:#8fa942;font-size:15px;">Ganzheitliche K&ouml;rperarbeit</p></td></tr><tr><td style="padding:28px 40px;background:#fff;color:#3d3520;"><h2 style="margin:0 0 12px;font-size:20px;">Ein Termin ist frei geworden!</h2><p style="font-size:15px;line-height:1.7;">Hallo ${customer_name || ''},<br><br>du stehst auf unserer Warteliste${service_type ? ` f&uuml;r <strong>${service_type}</strong>` : ''} und wir freuen uns dir mitzuteilen, dass ein Termin${preferred_date ? ` in deinem Wunschzeitraum (${preferred_date})` : ''} verf&uuml;gbar geworden ist.</p><p style="margin:20px 0;"><a href="${bookingUrl}" style="display:inline-block;background:#8fa942;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600;">Jetzt Termin buchen</a></p><p style="font-size:13px;color:#8a7d60;">Bitte buche zeitnah — der Slot ist begrenzt verf&uuml;gbar.</p></td></tr><tr><td style="padding:20px 40px;background:#f5f0e0;border-top:1px solid #e0d9c0;text-align:center;"><p style="margin:0;font-size:13px;color:#8a7d60;">Back to Balance &mdash; Ganzheitliche K&ouml;rperarbeit</p><p style="margin:4px 0 0;font-size:11px;color:#b0a888;">Hildastr. 12, 79102 Freiburg im Breisgau</p></td></tr></table></td></tr></table>`,
          }),
        });
        return json({ success: true, message: "Benachrichtigung gesendet" });
      }
      if (body.action === 'delete-all-time-entries') {
        const { error } = await supabase.from('universe_time_entries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) return json({ error: error.message }, 500);
        return json({ success: true, message: 'Alle Zeiteinträge gelöscht' });
      }
      if (body.action === 'debug-unread') {
        // If filter provided, search by body content; otherwise show unread
        const q = supabase
          .from('universe_messages')
          .select('id, body, sender_id, recipient_id, channel, message_type, is_deleted, read_at, created_at')
          .order('created_at', { ascending: false });
        if (body.filter) {
          q.ilike('body', `%${body.filter}%`);
        } else {
          q.is('read_at', null);
        }
        const { data } = await q.limit(20);
        return json({ unread: data });
      }
      if (body.action === 'debug-appointments') {
        const { data } = await supabase
          .from('appointments_extended')
          .select('id, start_time, end_time, status, service_id, company_id, customer_id, title')
          .eq('company_id', body.company_id || '396ad7a6-e4d1-4c7d-abc1-ef9f2c4c2da9')
          .order('start_time', { ascending: false })
          .limit(20);
        return json({ appointments: data });
      }
      if (body.action === 'debug-customers') {
        const { data } = await supabase
          .from('customers')
          .select('id, name, email, phone, company_id')
          .eq('company_id', body.company_id || '396ad7a6-e4d1-4c7d-abc1-ef9f2c4c2da9')
          .order('created_at', { ascending: false })
          .limit(20);
        return json({ customers: data });
      }
      if (body.action === 'debug-invoices') {
        const { data } = await supabase
          .from('invoices')
          .select('id, invoice_number, amount, total_amount, status, customer_id, company_id')
          .eq('company_id', body.company_id || '396ad7a6-e4d1-4c7d-abc1-ef9f2c4c2da9')
          .order('created_at', { ascending: false })
          .limit(20);
        return json({ invoices: data });
      }
      if (body.action === 'debug-services') {
        const { data } = await supabase
          .from('services')
          .select('id, name, price, duration_min, buffer_after_min, company_id')
          .eq('company_id', body.company_id || '396ad7a6-e4d1-4c7d-abc1-ef9f2c4c2da9')
          .order('created_at', { ascending: false })
          .limit(20);
        return json({ services: data });
      }
      if (body.action === 'check-first-session') {
        const { company_id: cid, email } = body;
        if (!cid || !email) return json({ error: "company_id und email erforderlich" }, 400);
        const { data: existing } = await supabase
          .from('customers')
          .select('id')
          .eq('company_id', cid)
          .eq('email', email)
          .maybeSingle();
        if (!existing) return json({ is_first: true });
        const { data: past } = await supabase
          .from('appointments_extended')
          .select('id')
          .eq('company_id', cid)
          .eq('customer_id', existing.id)
          .in('status', ['confirmed', 'completed'])
          .limit(1);
        return json({ is_first: !past || past.length === 0 });
      }
      if (body.action === 'create-discount-code') {
        const { error } = await supabase.from('discount_codes').insert({
          company_id: body.company_id,
          code: body.code?.toUpperCase().trim(),
          discount_type: body.discount_type || 'percent',
          discount_value: body.discount_value,
          max_uses: body.max_uses ?? 0,
          service_id: body.service_id || null,
          is_active: true,
        });
        if (error) return json({ error: error.message }, 500);
        return json({ success: true, code: body.code?.toUpperCase().trim() });
      }
      if (body.action === 'update-bundle') {
        const { bundle_id, ...fields } = body;
        delete fields.action;
        if (!bundle_id) return json({ error: "bundle_id required" }, 400);
        const { error } = await supabase.from('service_bundles').update(fields).eq('id', bundle_id);
        if (error) return json({ error: error.message }, 500);
        return json({ success: true });
      }
      if (body.action === 'create-bundle') {
        const { action, ...fields } = body;
        const { data, error } = await supabase.from('service_bundles').insert(fields).select('id').maybeSingle();
        if (error) return json({ error: error.message }, 500);
        return json({ success: true, id: data?.id });
      }
      if (body.action === 'update-service') {
        const { service_id, ...fields } = body;
        delete fields.action;
        if (!service_id) return json({ error: "service_id required" }, 400);
        const { error } = await supabase.from('services').update(fields).eq('id', service_id);
        if (error) return json({ error: error.message }, 500);
        return json({ success: true });
      }
      if (body.action === 'set-show-on-website') {
        // Legacy alias
        body.action = 'update-service';
        const updateData: any = { show_on_website: true };
        if (body.website_description) updateData.website_description = body.website_description;
        if (body.website_details) updateData.website_details = body.website_details;
        if (body.category) updateData.category = body.category;
        if (body.location) updateData.location = body.location;
        const { error } = await supabase.from('services').update(updateData).eq('id', body.service_id);
        if (error) return json({ error: error.message }, 500);
        return json({ success: true });
      }
      if (body.action === 'delete-test-data') {
        // Delete all data marked with is_test = true
        const companyId = body.company_id;
        if (!companyId) {
          return json({ error: 'company_id erforderlich' }, 400);
        }

        const { error: apptError } = await supabase
          .from('appointments_extended')
          .delete()
          .eq('is_test', true);

        const { error: custError } = await supabase
          .from('customers')
          .delete()
          .eq('is_test', true);

        const { error: servError } = await supabase
          .from('services')
          .delete()
          .eq('is_test', true)
          .eq('company_id', companyId);

        if (apptError || custError || servError) {
          return json({
            error: apptError?.message || custError?.message || servError?.message || 'Fehler beim Löschen'
          }, 500);
        }

        return json({ success: true, message: 'Alle Test-Daten gelöscht' });
      }
      if (body.action === 'mark-all-read') {
        const { error, count } = await (supabase
          .from('universe_messages')
          .update({ read_at: new Date().toISOString() })
          .is('read_at', null)
          .select() as any);
        if (error) return json({ error: error.message }, 500);
        return json({ success: true, marked: count });
      }
      if (body.action === 'get-payment-details') {
        return await handleGetPaymentDetails(body);
      }
      if (body.action === 'send-payment-reminder') {
        return await handleSendPaymentReminder(body);
      }
      if (body.action === 'apply-discount') {
        return await handleApplyDiscount(body);
      }
      if (body.action === 'validate-referral-code') {
        return await handleValidateReferralCode(body);
      }
      if (body.action === 'confirm-payment') {
        return await handleConfirmPayment(body);
      }
    }

    return json({ error: "Not found" }, 404);
  } catch (err) {
    console.error("public-booking error:", err);
    return json({ error: "Interner Fehler" }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// CREATE CUSTOMER — Aus öffentlicher Registrierung (kein Auth nötig)
async function handleCreateCustomer(body: any) {
  const { customer, existingContactId, practitionerId, dsgvoPdfBase64, healthPdfBase64, pdfBase64 } = body;
  if (!customer?.name) {
    return json({ error: "Name ist erforderlich" }, 400);
  }

  try {
    // Resolve company_id from practitioner profile (server-side, no auth needed)
    if (practitionerId && !customer.company_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', practitionerId)
        .maybeSingle();

      if (profile?.company_id) {
        customer.company_id = profile.company_id;
      }
    }

    // Remove fields that don't exist in customers table
    delete customer.consented_at;
    delete customer.owner_user_id;
    delete customer.visibility;

    let customerId = existingContactId;

    if (existingContactId) {
      const { error } = await supabase
        .from('customers')
        .update(customer)
        .eq('id', existingContactId);
      if (error) throw error;
    } else {
      const { data: inserted, error } = await supabase
        .from('customers')
        .insert(customer)
        .select('id')
        .maybeSingle();
      if (error) throw error;
      customerId = inserted?.id;
    }

    // Helper: decode base64 and upload PDF
    const uploadPdf = async (base64Data: string, path: string): Promise<boolean> => {
      const binaryStr = atob(base64Data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const { error } = await supabase.storage
        .from('registration-pdfs')
        .upload(path, bytes.buffer, {
          contentType: 'application/pdf',
          upsert: true,
        });
      if (error) {
        console.error('PDF upload error:', error);
        return false;
      }
      return true;
    };

    // Upload PDFs to Supabase Storage
    const companyFolder = customer.company_id || 'no-company';
    if (customerId && (dsgvoPdfBase64 || healthPdfBase64 || pdfBase64)) {
      const storagePaths: string[] = [];

      try {
        // New two-PDF format: dsgvoPdfBase64 + healthPdfBase64
        if (dsgvoPdfBase64) {
          const dsgvoPath = `${companyFolder}/${customerId}_dsgvo.pdf`;
          const ok = await uploadPdf(dsgvoPdfBase64, dsgvoPath);
          if (ok) storagePaths.push(dsgvoPath);
        }

        if (healthPdfBase64) {
          const healthPath = `${companyFolder}/${customerId}_gesundheit.pdf`;
          const ok = await uploadPdf(healthPdfBase64, healthPath);
          if (ok) storagePaths.push(healthPath);
        }

        // Legacy single-PDF format (backward compatibility)
        if (!dsgvoPdfBase64 && pdfBase64) {
          const legacyPath = `${companyFolder}/${customerId}.pdf`;
          const ok = await uploadPdf(pdfBase64, legacyPath);
          if (ok) storagePaths.push(legacyPath);
        }

        // Store paths in signature_id, separated by | for multiple PDFs
        if (storagePaths.length > 0) {
          await supabase
            .from('customers')
            .update({ signature_id: storagePaths.join('|') })
            .eq('id', customerId);
        }
      } catch (pdfErr) {
        console.error('PDF processing error:', pdfErr);
        // Don't fail the whole request if PDF upload fails
      }
    }

    // Send DSGVO confirmation email with PDF attachment (best-effort)
    if (customer.email && dsgvoPdfBase64) {
      try {
        const brevoKey = Deno.env.get("BREVO_API_KEY");
        if (brevoKey) {
          const customerName = customer.name || 'Kunde';
          const emailHtml = `<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e0;font-family:Georgia,'EB Garamond','Times New Roman',serif;"><tr><td align="center" style="padding:40px 20px;"><table width="560" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #e0d9c0;"><tr><td style="background-color:#f5f0e0;text-align:center;padding:36px 30px 28px;"><h1 style="margin:0;color:#b61818;font-size:28px;font-weight:700;">Back to Balance</h1><p style="margin:6px 0 0;color:#8fa942;font-size:18px;font-weight:600;letter-spacing:0.08em;">Universe</p></td></tr><tr><td style="padding:36px 40px 24px;background-color:#ffffff;color:#3d3520;"><h2 style="margin:0 0 16px;color:#1a1505;font-size:22px;">Deine Einwilligungserkl&auml;rung</h2><p style="margin:0 0 20px;color:#3d3520;font-size:15px;line-height:1.7;">Hallo ${customerName},<br><br>vielen Dank f&uuml;r dein Vertrauen. Anbei findest du eine digitale Kopie deiner Einwilligungserkl&auml;rung (DSGVO).<br><br>Bitte bewahre dieses Dokument f&uuml;r deine Unterlagen auf.</p><p style="margin:24px 0 0;color:#8a7d60;font-size:13px;">Die PDF-Datei ist dieser E-Mail als Anhang beigef&uuml;gt.</p></td></tr><tr><td style="padding:20px 40px;background-color:#f5f0e0;border-top:1px solid #e0d9c0;"><p style="margin:0;color:#8a7d60;font-size:12px;text-align:center;">Back to Balance Universe</p></td></tr></table></td></tr></table>`;

          const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "accept": "application/json",
              "api-key": brevoKey,
              "content-type": "application/json",
            },
            body: JSON.stringify({
              sender: { name: "Back to Balance Universe", email: "office@backtobalance.online" },
              to: [{ email: customer.email, name: customerName }],
              subject: "Deine Registrierung bei Back to Balance — Einwilligungserklärung",
              htmlContent: emailHtml,
              attachment: [
                {
                  content: dsgvoPdfBase64,
                  name: `DSGVO ${customerName}.pdf`,
                },
              ],
            }),
          });

          if (!emailResponse.ok) {
            const errData = await emailResponse.json();
            console.error("DSGVO email send error:", errData);
          } else {
            console.log("DSGVO confirmation email sent to", customer.email);
          }
        }
      } catch (emailErr) {
        console.error("DSGVO email error (non-fatal):", emailErr);
      }
    }

    // Create structured health record from notes (if health data exists)
    if (customerId && customer.notes) {
      try {
        const healthData = parseHealthNotesToStructured(customer.notes);
        const hasData = healthData.allergies.length > 0 ||
          healthData.medications.length > 0 ||
          healthData.conditions.length > 0 ||
          healthData.warnings.length > 0 ||
          Object.keys(healthData.other).length > 0;

        if (hasData) {
          await supabase.from('customer_health_records').insert({
            customer_id: customerId,
            source: 'registration',
            data: healthData,
            notes: customer.notes,
            created_by: null, // public registration, no auth user
          });
        }
      } catch (healthErr) {
        console.error('Health record creation error (non-fatal):', healthErr);
      }
    }

    return json({ success: true, customerId });
  } catch (err: any) {
    console.error('create-customer error:', err);
    return json({ error: err.message || 'Kunde konnte nicht gespeichert werden' }, 500);
  }
}

/**
 * Parse health note lines (⚠ prefix format) into structured JSON.
 */
function parseHealthNotesToStructured(notes: string): Record<string, any> {
  const lines = notes.split('\n').filter((l: string) => l.trim());
  const data: Record<string, any> = {
    allergies: [],
    medications: [],
    conditions: [],
    warnings: [],
    other: {},
  };

  const allergyKeywords = /^(⚠\s*)?(Allergien|ALLERGIEN)/i;
  const medKeywords = /^(⚠\s*)?(Medikamente|MEDIKAMENTE)/i;
  const conditionKeywords = /^(⚠\s*)?(ERKRANKUNGEN|Vorerkrankungen|Chronische|Operationen|Unfälle|Implantate|Herzschrittmacher|Prothesen)/i;
  const warningKeywords = /^⚠/;

  const negativeValues = ['nein', 'keine', 'keins', 'kein', 'keine bekannt', 'n/a', '-', ''];

  for (const line of lines) {
    const cleanLine = line.replace(/^⚠\s*/, '').trim();
    const colonIdx = cleanLine.indexOf(':');
    const value = colonIdx > -1 ? cleanLine.slice(colonIdx + 1).trim() : '';
    const key = colonIdx > -1 ? cleanLine.slice(0, colonIdx).trim() : cleanLine;
    const isNegative = negativeValues.includes(value.toLowerCase());

    if (allergyKeywords.test(line) && !isNegative) {
      data.allergies.push(value);
    } else if (medKeywords.test(line) && !isNegative) {
      data.medications.push(value);
    } else if (conditionKeywords.test(line) && !isNegative) {
      data.conditions.push(value);
    } else if (warningKeywords.test(line) && !isNegative) {
      data.warnings.push(line);
    } else if (colonIdx > -1 && !isNegative) {
      data.other[key] = value;
    }
  }

  return data;
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOTS — Berechne freie Zeitfenster für einen Tag
// ═══════════════════════════════════════════════════════════════════════════

async function handleGetSlots(url: URL) {
  const companyId = url.searchParams.get("company_id");
  const dateStr = url.searchParams.get("date");
  const serviceId = url.searchParams.get("service_id");
  const locationId = url.searchParams.get("location_id");
  const stepMin = parseInt(url.searchParams.get("step") || "30");

  if (!companyId || !dateStr) {
    return json({ error: "company_id und date sind erforderlich" }, 400);
  }

  const date = new Date(dateStr + "T00:00:00");
  const weekday = date.getDay(); // 0=So, 6=Sa
  const dayStart = dateStr + "T00:00:00";
  const dayEnd = dateStr + "T23:59:59";

  // 1. Verfügbarkeits-Fenster laden (recurring + einmalig)
  const { data: patterns } = await supabase
    .from("availability_patterns")
    .select("*")
    .eq("company_id", companyId)
    .eq("pattern_type", "availability");

  // Auch legacy availability_windows laden
  const { data: windows } = await supabase
    .from("availability_windows")
    .select("*")
    .eq("company_id", companyId)
    .eq("weekday", weekday);

  // Verfügbare Zeiträume sammeln
  const availableRanges: Array<{ start: string; end: string }> = [];

  // Aus availability_patterns (mit optionaler Service-Verknüpfung)
  for (const p of patterns ?? []) {
    // Wenn die Verfügbarkeit an einen Service gebunden ist,
    // nur für diesen Service Slots anzeigen
    if (p.service_id && serviceId && p.service_id !== serviceId) continue;
    // Ungebundene Verfügbarkeiten gelten für alle Services
    if (p.is_recurring && p.weekdays?.includes(weekday)) {
      availableRanges.push({ start: p.start_time, end: p.end_time });
    } else if (!p.is_recurring && p.start_date === dateStr) {
      availableRanges.push({ start: p.start_time, end: p.end_time });
    }
  }

  // Aus legacy availability_windows
  for (const w of windows ?? []) {
    availableRanges.push({ start: w.start_time, end: w.end_time });
  }

  if (availableRanges.length === 0) {
    return json({ slots: [], message: "Keine Verfügbarkeit an diesem Tag" });
  }

  // 2. Blockierte Zeiten laden
  const { data: blockouts } = await supabase
    .from("availability_patterns")
    .select("*")
    .eq("company_id", companyId)
    .eq("pattern_type", "blockout");

  const { data: blackouts } = await supabase
    .from("blackout_ranges")
    .select("*")
    .eq("company_id", companyId)
    .lte("start_ts", dayEnd)
    .gte("end_ts", dayStart);

  // Blockierte Zeiträume für diesen Tag
  const blockedRanges: Array<{ start: string; end: string }> = [];

  for (const b of blockouts ?? []) {
    if (b.is_recurring && b.weekdays?.includes(weekday)) {
      blockedRanges.push({ start: b.start_time, end: b.end_time });
    } else if (!b.is_recurring && b.start_date <= dateStr && (b.end_date ?? b.start_date) >= dateStr) {
      blockedRanges.push({ start: b.start_time || "00:00", end: b.end_time || "23:59" });
    }
  }

  for (const b of blackouts ?? []) {
    const bStart = new Date(b.start_ts);
    const bEnd = new Date(b.end_ts);
    const startTime = bStart.toISOString().split("T")[0] < dateStr ? "00:00" : bStart.toTimeString().slice(0, 5);
    const endTime = bEnd.toISOString().split("T")[0] > dateStr ? "23:59" : bEnd.toTimeString().slice(0, 5);
    blockedRanges.push({ start: startTime, end: endTime });
  }

  // 3. Bestehende Termine laden (nur appointments_extended)
  const { data: apptRaw } = await supabase
    .from("appointments_extended")
    .select("start_time, end_time, status, service_id")
    .eq("company_id", companyId)
    .in("status", ["confirmed", "pending", "scheduled"])
    .gte("start_time", dayStart)
    .lte("start_time", dayEnd);

  // Convert UTC timestamps to Europe/Berlin local time for comparison with local slots
  const toLocalTs = (ts: string): string => {
    if (!ts) return ts;
    const d = new Date(ts);
    const parts = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Berlin',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).formatToParts(d);
    const get = (t: string) => parts.find(p => p.type === t)?.value || '00';
    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`;
  };

  const uniqueAppointments = (apptRaw ?? []).map((a: any) => ({
    start_ts: toLocalTs(a.start_time),
    end_ts: toLocalTs(a.end_time),
    status: a.status,
    service_id: a.service_id,
  }));

  // Service-Dauer laden (für Slot-Länge)
  let durationMin = stepMin;
  let bufferMin = 0;
  let maxAdvanceDays = 0;
  if (serviceId) {
    const { data: service } = await supabase
      .from("services")
      .select("duration_min, buffer_after_min, max_advance_days")
      .eq("id", serviceId)
      .maybeSingle();
    if (service) {
      durationMin = service.duration_min ?? stepMin;
      bufferMin = service.buffer_after_min ?? 0;
      maxAdvanceDays = service.max_advance_days ?? 0;
    }
  }

  // Prüfe ob das Datum innerhalb des Buchungsvorlaufs liegt
  if (maxAdvanceDays > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requestedDate = new Date(dateStr + "T00:00:00");
    const diffDays = Math.ceil((requestedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > maxAdvanceDays) {
      return json({ slots: [], message: `Termine können nur bis ${maxAdvanceDays} Tage im Voraus gebucht werden` });
    }
  }

  // Mindestvorlaufzeit prüfen (min_advance_days aus Settings, Fallback 3 Tage)
  const { data: minAdvSetting } = await supabase
    .from("universe_settings").select("value").eq("key", "booking_min_advance_days").maybeSingle();
  const minAdvanceDays = parseInt(minAdvSetting?.value ?? "3") || 3;
  {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requestedDate = new Date(dateStr + "T00:00:00");
    const diffDays = Math.ceil((requestedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < minAdvanceDays) {
      return json({ slots: [], message: `Termine müssen mindestens ${minAdvanceDays} Tage im Voraus gebucht werden` });
    }
  }

  // 4. Freie Slots berechnen
  // Kapazität = Anzahl überlappender Verfügbarkeits-Fenster pro Zeitslot
  // (jedes Fenster = ein Practitioner/Raum der zur Verfügung steht)
  const slots: Array<{ start_ts: string; end_ts: string; start_time: string; end_time: string }> = [];
  const seenSlots = new Set<string>(); // Duplikate vermeiden

  for (const range of availableRanges) {
    const [rStartH, rStartM] = range.start.split(":").map(Number);
    const [rEndH, rEndM] = range.end.split(":").map(Number);
    const rangeStartMin = rStartH * 60 + rStartM;
    const rangeEndMin = rEndH * 60 + rEndM;

    for (let t = rangeStartMin; t + durationMin <= rangeEndMin; t += stepMin) {
      const slotStart = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
      const slotEndT = t + durationMin;
      const slotEnd = `${String(Math.floor(slotEndT / 60)).padStart(2, "0")}:${String(slotEndT % 60).padStart(2, "0")}`;

      if (seenSlots.has(slotStart)) continue;

      // Blockiert?
      const isBlocked = blockedRanges.some((b) => timeOverlaps(slotStart, slotEnd, b.start, b.end));
      if (isBlocked) continue;

      // Kapazität: wie viele Verfügbarkeits-Fenster decken diesen Slot ab?
      const capacity = availableRanges.filter((r) => {
        const [rsH, rsM] = r.start.split(":").map(Number);
        const [reH, reM] = r.end.split(":").map(Number);
        const rStart = rsH * 60 + rsM;
        const rEnd = reH * 60 + reM;
        return t >= rStart && t + durationMin <= rEnd;
      }).length;

      // Bestehende Buchungen zählen (inkl. Buffer)
      // Nur Termine zählen die dieselbe Ressource beanspruchen:
      // - Termine ohne service_id blockieren immer (allgemeine Buchung)
      // - Termine mit anderem service_id blockieren NICHT service-gebundene Verfügbarkeiten
      const slotStartTs = `${dateStr}T${slotStart}:00`;
      const slotEndWithBuffer = t + durationMin + bufferMin;
      const slotEndBufferStr = `${dateStr}T${String(Math.floor(slotEndWithBuffer / 60)).padStart(2, "0")}:${String(slotEndWithBuffer % 60).padStart(2, "0")}:00`;

      const bookingCount = uniqueAppointments.filter((a: any) => {
        // Extend existing appointment's end by buffer to prevent overlap
        const aEndTs = a.end_ts;
        const aEndMin = parseInt(aEndTs.split("T")[1]?.split(":")[0] || "0") * 60 +
                        parseInt(aEndTs.split("T")[1]?.split(":")[1] || "0");
        const aEndWithBuffer = aEndMin + bufferMin;
        const aEndBufferStr = `${aEndTs.split("T")[0]}T${String(Math.floor(aEndWithBuffer / 60)).padStart(2, "0")}:${String(aEndWithBuffer % 60).padStart(2, "0")}:00`;
        return a.start_ts < slotEndBufferStr && aEndBufferStr > slotStartTs;
      }).length;

      // Slot nur ausblenden wenn ALLE Kapazitäten belegt
      if (bookingCount >= capacity) continue;

      seenSlots.add(slotStart);
      slots.push({
        start_ts: slotStartTs,
        end_ts: `${dateStr}T${slotEnd}:00`,
        start_time: slotStart,
        end_time: slotEnd,
      });
    }
  }

  // Smart slot optimization: prioritize slots that minimize gaps
  if (uniqueAppointments.length > 0 && slots.length > 1) {
    // Score each slot: lower score = closer to existing bookings = preferred
    const scoredSlots = slots.map(slot => {
      const slotMin = parseInt(slot.start_time.split(':')[0]) * 60 + parseInt(slot.start_time.split(':')[1]);
      let minGap = Infinity;
      for (const appt of uniqueAppointments) {
        const apptStartMin = parseInt((appt.start_ts.split('T')[1] || '00:00').split(':')[0]) * 60 +
                             parseInt((appt.start_ts.split('T')[1] || '00:00').split(':')[1]);
        const apptEndMin = parseInt((appt.end_ts.split('T')[1] || '00:00').split(':')[0]) * 60 +
                           parseInt((appt.end_ts.split('T')[1] || '00:00').split(':')[1]);
        const gapBefore = Math.abs(slotMin - apptEndMin);
        const gapAfter = Math.abs(slotMin + durationMin - apptStartMin);
        minGap = Math.min(minGap, gapBefore, gapAfter);
      }
      return { ...slot, _gap: minGap };
    });

    // Sort: adjacent to existing bookings first, then by time
    scoredSlots.sort((a, b) => {
      if (a._gap !== b._gap) return a._gap - b._gap;
      return a.start_time.localeCompare(b.start_time);
    });

    // Add priority flag to top 3 slots
    const result = scoredSlots.map((s, i) => ({
      start_ts: s.start_ts,
      end_ts: s.end_ts,
      start_time: s.start_time,
      end_time: s.end_time,
      recommended: i < 3 && s._gap <= durationMin + bufferMin,
    }));

    return json({ slots: result, date: dateStr, company_id: companyId });
  }

  return json({ slots, date: dateStr, company_id: companyId });
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECK INTRO STATUS — Check ob Kunde intro_status hat
// ═══════════════════════════════════════════════════════════════════════════

async function handleCheckIntroStatus(req: Request) {
  const { company_id, email } = await req.json();

  if (!company_id || !email) {
    return json({ error: "company_id und email sind erforderlich" }, 400);
  }

  // Find customer by email
  const { data: customer } = await supabase
    .from("customers")
    .select("id, intro_usage_count, referral_count")
    .eq("company_id", company_id)
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (!customer) {
    // New customer — kein intro status
    return json({
      has_intro_status_available: false,
      intro_status_exhausted: false,
      intro_usage_count: 0,
      referral_count: 0,
    });
  }

  const usageCount = customer.intro_usage_count || 0;
  const referralCount = customer.referral_count || 0;

  // Has intro status available: usage_count == referral_count (even both 0)
  const hasAvailable = usageCount === referralCount;
  // Status exhausted: usage_count > referral_count
  const isExhausted = usageCount > referralCount;

  return json({
    has_intro_status_available: hasAvailable,
    intro_status_exhausted: isExhausted,
    intro_usage_count: usageCount,
    referral_count: referralCount,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// BOOK — Termin erstellen
// ═══════════════════════════════════════════════════════════════════════════

async function handleBook(req: Request) {
  const body = await req.json();
  const { company_id, service_id, location_id, start_ts, customer, discount_code, payment_method, bundle_id, bundle_price: requestedBundlePrice, referrer_first_name, referrer_last_name } = body;

  if (!company_id || !start_ts || !customer?.name || !customer?.email) {
    return json({ error: "company_id, start_ts und customer (name, email) sind erforderlich" }, 400);
  }

  // ── Testmodus prüfen ──
  const { data: testModeSetting } = await supabase
    .from("universe_settings")
    .select("value")
    .eq("key", "booking_test_mode")
    .maybeSingle();
  const testMode = testModeSetting?.value === 'true';

  // ── Rate Limiting (max 10 Buchungen pro Company pro Stunde) ──
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('cf-connecting-ip') || 'unknown';
  if (clientIp !== 'unknown') {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("appointments_extended")
      .select("id", { count: 'exact', head: true })
      .eq("company_id", company_id)
      .gte("created_at", oneHourAgo);

    // Allow max 10 bookings per company per hour (generous limit)
    if ((count ?? 0) >= 10) {
      return json({ error: "Zu viele Buchungen. Bitte versuche es später erneut." }, 429);
    }
  }

  // Service-Dauer holen
  let durationMin = 60;
  if (service_id) {
    const { data: service } = await supabase
      .from("services")
      .select("duration_min")
      .eq("id", service_id)
      .maybeSingle();
    if (service) durationMin = service.duration_min ?? 60;
  }

  // Calculate end_ts and add Europe/Berlin timezone offset
  // start_ts comes as local time (e.g. "2026-04-27T11:15:00") — must store with TZ
  const [datePart, timePart] = start_ts.split("T");
  const [hh, mm] = (timePart || "00:00").replace(/:\d{2}$/, "").split(":").map(Number);
  const totalMin = hh * 60 + mm + durationMin;
  const endHH = String(Math.floor(totalMin / 60)).padStart(2, "0");
  const endMM = String(totalMin % 60).padStart(2, "0");

  // Determine Europe/Berlin offset for this date (CET +01:00 or CEST +02:00)
  const getOffset = (dateStr: string): string => {
    const d = new Date(dateStr + "T12:00:00Z");
    const fmt = new Intl.DateTimeFormat("en", { timeZone: "Europe/Berlin", timeZoneName: "shortOffset" });
    const parts = fmt.formatToParts(d);
    const tzPart = parts.find(p => p.type === "timeZoneName")?.value || "+01";
    // Convert "GMT+2" or "GMT+1" to "+02:00" or "+01:00"
    const match = tzPart.match(/([+-]?\d+)/);
    if (match) {
      const hrs = parseInt(match[1]);
      return `${hrs >= 0 ? '+' : '-'}${String(Math.abs(hrs)).padStart(2, '0')}:00`;
    }
    return "+01:00";
  };
  const tzOffset = getOffset(datePart);
  const end_ts = `${datePart}T${endHH}:${endMM}:00${tzOffset}`;
  const start_ts_tz = `${start_ts.replace(/\+.*$/, '')}${tzOffset}`; // ensure TZ on start too

  // Kapazität ermitteln: wie viele Verfügbarkeits-Fenster decken diesen Slot ab?
  const bookDate = start_ts.split("T")[0];
  const bookDay = new Date(bookDate + "T00:00:00").getDay();
  const [bStartH, bStartM] = (start_ts.split("T")[1] || "00:00").split(":").map(Number);
  const bookStartMin = bStartH * 60 + bStartM;

  const { data: avPatterns } = await supabase
    .from("availability_patterns")
    .select("*")
    .eq("company_id", company_id)
    .eq("pattern_type", "availability");

  const { data: avWindows } = await supabase
    .from("availability_windows")
    .select("*")
    .eq("company_id", company_id)
    .eq("weekday", bookDay);

  let capacity = 0;
  for (const p of avPatterns ?? []) {
    const matches = p.is_recurring ? p.weekdays?.includes(bookDay) : p.start_date === bookDate;
    if (matches && p.start_time && p.end_time) {
      const [psH, psM] = p.start_time.split(":").map(Number);
      const [peH, peM] = p.end_time.split(":").map(Number);
      if (bookStartMin >= psH * 60 + psM && bookStartMin + durationMin <= peH * 60 + peM) capacity++;
    }
  }
  for (const w of avWindows ?? []) {
    const [wsH, wsM] = w.start_time.split(":").map(Number);
    const [weH, weM] = w.end_time.split(":").map(Number);
    if (bookStartMin >= wsH * 60 + wsM && bookStartMin + durationMin <= weH * 60 + weM) capacity++;
  }
  if (capacity === 0) capacity = 1; // Fallback

  // Doppelbuchung prüfen — erst ausgebucht wenn alle Kapazitäten belegt
  const { data: conflicts } = await supabase
    .from("appointments_extended")
    .select("id")
    .eq("company_id", company_id)
    .in("status", ["confirmed", "pending", "scheduled"])
    .lt("start_time", end_ts)
    .gt("end_time", start_ts_tz);

  if (conflicts && conflicts.length >= capacity) {
    return json({ error: "Dieser Zeitraum ist bereits vollständig ausgebucht" }, 409);
  }

  // Duplikat-Check: gleicher Kunde, gleicher Zeitraum?
  const { data: dupCustomer } = await supabase
    .from("customers")
    .select("id")
    .eq("company_id", company_id)
    .eq("email", customer.email)
    .maybeSingle();
  if (dupCustomer) {
    const { data: dupAppt } = await supabase
      .from("appointments_extended")
      .select("id")
      .eq("company_id", company_id)
      .eq("customer_id", dupCustomer.id)
      .in("status", ["confirmed", "pending", "scheduled"])
      .lt("start_time", end_ts)
      .gt("end_time", start_ts_tz)
      .limit(1);
    if (dupAppt && dupAppt.length > 0) {
      return json({ error: "Du hast bereits einen Termin in diesem Zeitraum" }, 409);
    }
  }

  // Kunden anlegen oder finden
  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id")
    .eq("company_id", company_id)
    .eq("email", customer.email)
    .maybeSingle();

  let customerId = existingCustomer?.id ?? null;
  let isFirstSession = !existingCustomer;

  // ── REFERRAL CODE VALIDATION ────────────────────────────────────────
  let referrerCustomer: { id: string; name: string; email: string } | null = null;
  const { referral_code } = body;

  if (referral_code) {
    const { data: referrer, error: referrerErr } = await supabase
      .from("customers")
      .select("id, name, email")
      .eq("referral_code", referral_code)
      .eq("company_id", company_id)
      .maybeSingle();

    if (!referrer) {
      return json({ error: "Ungültiger Referral-Code" }, 400);
    }

    // Note: we allow referrer even if customerId is null (new customer)
    referrerCustomer = referrer;
  }

  // ── REFERRAL BY NAME VALIDATION ──────────────────────────────────────
  if (!referrerCustomer && referrer_first_name && referrer_last_name) {
    // Find referrer by first name and last name
    const referrerFullName = `${referrer_first_name.trim()} ${referrer_last_name.trim()}`;
    const { data: referrersByName } = await supabase
      .from("customers")
      .select("id, name, email")
      .eq("company_id", company_id)
      .ilike("name", `%${referrer_first_name.trim()}%`)
      .ilike("name", `%${referrer_last_name.trim()}%`);

    if (referrersByName && referrersByName.length > 0) {
      // If multiple matches, take the first (most recent would be better but we keep it simple)
      referrerCustomer = referrersByName[0];
    }
  }

  if (!customerId) {
    // Check if this is an intro package booking
    let isIntroPkg = false;
    if (service_id) {
      const { data: svc } = await supabase
        .from("services")
        .select("first_session_price")
        .eq("id", service_id)
        .maybeSingle();
      isIntroPkg = svc?.first_session_price ? true : false;
    }

    const { data: newCustomer, error: custErr } = await supabase
      .from("customers")
      .insert({
        company_id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone ?? null,
        notes: customer.notes ?? null,
        category: 'Neukunde',  // Portal-created customers start as 'Neukunde', not 'Standard'
        retention_until: new Date(Date.now() + 10 * 365.25 * 24 * 60 * 60 * 1000).toISOString(),
        referred_by: referrerCustomer?.id ?? null,
        intro_usage_count: isIntroPkg ? 1 : 0,
      })
      .select("id")
      .maybeSingle();

    if (custErr) {
      console.error('Customer insert error:', custErr, { company_id, name: customer.name, email: customer.email });
      return json({ error: `Kunde konnte nicht angelegt werden: ${custErr.message}` }, 500);
    }
    if (!newCustomer) {
      console.error('Customer insert returned no data', { company_id, name: customer.name, email: customer.email });
      return json({ error: "Kunde konnte nicht angelegt werden: Keine Daten zurückgegeben" }, 500);
    }
    customerId = newCustomer.id;
  } else {
    // Kunde existiert — prüfe ob er schon Termine hatte
    const { data: pastAppointments } = await supabase
      .from("appointments_extended")
      .select("id")
      .eq("company_id", company_id)
      .eq("customer_id", customerId)
      .in("status", ["confirmed", "completed"])
      .limit(1);

    isFirstSession = !pastAppointments || pastAppointments.length === 0;

    // NEW: If customer was referred and referrer code is valid, grant intro pricing
    if (referrerCustomer && !isFirstSession) {
      // Customer had past appointments but was referred, still eligible for intro pricing
      isFirstSession = true;
    }
  }

  // NEW: Check if referrer is eligible for intro pricing through this referral
  let referrerEligibleForIntro = false;
  if (referrerCustomer) {
    // Referrer is always eligible for intro pricing when referring someone
    referrerEligibleForIntro = true;
  }

  // Reset retention period on new booking (10 years = steuerliche Aufbewahrungspflicht)
  await supabase
    .from("customers")
    .update({ retention_until: new Date(Date.now() + 10 * 365.25 * 24 * 60 * 60 * 1000).toISOString() })
    .eq("id", customerId);

  // Preis berechnen (Erstsitzung vs. normal)
  let price: number | null = null;
  let appliedDiscount: string | null = null;

  let defaultReminderMinutes: number[] | null = null;

  if (service_id) {
    const { data: svc } = await supabase
      .from("services")
      .select("price, first_session_price, first_session_discount_percent, promotion_active, promotion_price, promotion_ends_at, default_reminder_minutes")
      .eq("id", service_id)
      .maybeSingle();

    if (svc?.price) {
      price = svc.price;
      if (isFirstSession) {
        if (svc.first_session_price) {
          price = svc.first_session_price;
          appliedDiscount = "first_session_price";
        } else if (svc.first_session_discount_percent && svc.first_session_discount_percent > 0) {
          price = Math.round((svc.price * (100 - svc.first_session_discount_percent)) * 100) / 10000;
          appliedDiscount = `first_session_discount_${svc.first_session_discount_percent}%`;
        }
      } else if (!isFirstSession && svc.first_session_price && body.bundle_id?.includes('first')) {
        // Customer tried to book a first-session package but they already have bookings
        return json({ error: "Das Kennenlern-Paket ist nur für deine erste Buchung verfügbar. Du hast bereits Termine gebucht." }, 400);
      }

      // Apply promotion price if active and not expired
      if (svc.promotion_active && svc.promotion_price) {
        const promoValid = !svc.promotion_ends_at || new Date(svc.promotion_ends_at) > new Date();
        if (promoValid) {
          price = Number(svc.promotion_price);
          appliedDiscount = "promotion";
        }
      }
    }

    // Load default reminders from service
    if (svc?.default_reminder_minutes) {
      defaultReminderMinutes = svc.default_reminder_minutes;
    }
  }

  // Apply discount code if provided
  let discountApplied: { code: string; discount_type: string; discount_value: number } | null = null;
  if (discount_code && price !== null) {
    const { data: dc } = await supabase
      .from("discount_codes")
      .select("*")
      .eq("company_id", company_id)
      .eq("code", discount_code.toUpperCase().trim())
      .eq("is_active", true)
      .maybeSingle();

    if (dc) {
      const now = new Date();
      const notExpired = !dc.valid_until || new Date(dc.valid_until) > now;
      const notMaxed = dc.max_uses === 0 || dc.used_count < dc.max_uses;
      const serviceMatches = !dc.service_id || dc.service_id === service_id;

      if (notExpired && notMaxed && serviceMatches) {
        if (dc.discount_type === 'percent') {
          price = Math.round(price * (100 - dc.discount_value) * 100) / 10000;
        } else {
          price = Math.max(0, price - dc.discount_value);
        }
        price = Math.round(price * 100) / 100;
        discountApplied = { code: dc.code, discount_type: dc.discount_type, discount_value: dc.discount_value };
        appliedDiscount = `discount_code_${dc.code}`;

        // Increment used_count
        await supabase
          .from("discount_codes")
          .update({ used_count: dc.used_count + 1 })
          .eq("id", dc.id);
      }
    }
  }

  // Termin in appointments_extended erstellen (App-Kalender)
  const insertData: any = {
    company_id,
    customer_id: customerId,
    service_id: service_id ?? null,
    start_time: start_ts_tz,
    end_time: end_ts,
    title: testMode ? `[TEST] ${customer.name}` : `Website-Buchung: ${customer.name}`,
    description: testMode ? `[TESTBUCHUNG] ${customer.notes || ''}` : (customer.notes || null),
    status: testMode ? "test" : "pending",
    payment_method: payment_method || 'bar',
    payment_status: payment_method === 'stripe' ? 'pending' : 'unpaid',
    reminder_minutes: defaultReminderMinutes,
  };
  const { data: appointment, error: apptErr } = await supabase
    .from("appointments_extended")
    .insert(insertData)
    .select("id, start_time, end_time, status")
    .maybeSingle();

  if (apptErr || !appointment) {
    console.error("Appointment create error:", apptErr, JSON.stringify(insertData));
    return json({ error: "Termin konnte nicht erstellt werden: " + apptErr?.message || "Keine Daten zurück" }, 500);
  }

  // ── REFERRAL TRACKING (Record successful referral) ──────────────────
  if (referrerCustomer && customerId && !testMode) {
    try {
      // Record referral relationship
      const { error: refErr } = await supabase
        .from("referral_tracking")
        .upsert({
          referrer_id: referrerCustomer.id,
          referee_id: customerId,
          referral_code: referral_code || null,
          first_booking_confirmed_at: new Date().toISOString(),
          first_booking_appointment_id: appointment?.id,
        }, {
          onConflict: "referrer_id,referee_id",
        });

      if (refErr) {
        console.error("Referral tracking error (non-fatal):", refErr);
      }
    } catch (e) {
      console.error("Referral tracking error (non-fatal):", e);
    }
  }

  // ── INTRO PACKAGE TRACKING & REFERRER ELIGIBILITY ─────────────────────
  if (!testMode) {
    // Check if this booking is for an intro package
    let isIntroPkgBooking = false;
    if (service_id) {
      const { data: svc } = await supabase
        .from("services")
        .select("first_session_price")
        .eq("id", service_id)
        .maybeSingle();
      isIntroPkgBooking = svc?.first_session_price ? true : false;
    }

    // If intro package and customer already existed, increment their intro_usage_count
    if (isIntroPkgBooking && customerId && existingCustomer) {
      const { data: currentCustomer } = await supabase
        .from("customers")
        .select("intro_usage_count")
        .eq("id", customerId)
        .maybeSingle();

      const newCount = (currentCustomer?.intro_usage_count || 0) + 1;
      await supabase
        .from("customers")
        .update({ intro_usage_count: newCount })
        .eq("id", customerId);
    }

    // If referrer exists, increment their referral_count and check eligibility
    if (referrerCustomer && isIntroPkgBooking) {
      try {
        // Get current referrer stats
        const { data: referrer } = await supabase
          .from("customers")
          .select("intro_usage_count, referral_count")
          .eq("id", referrerCustomer.id)
          .maybeSingle();

        if (referrer) {
          const newReferralCount = (referrer.referral_count || 0) + 1;
          const referrerIntroCount = referrer.intro_usage_count || 0;

          // Update referrer's referral_count
          await supabase
            .from("customers")
            .update({ referral_count: newReferralCount })
            .eq("id", referrerCustomer.id);

          // Grant has_intro_status if intro_usage_count == referral_count
          if (referrerIntroCount === newReferralCount) {
            await supabase
              .from("customers")
              .update({ has_intro_status: true })
              .eq("id", referrerCustomer.id);
          }
        }
      } catch (e) {
        console.error("Referrer eligibility update error (non-fatal):", e);
      }
    }
  }

  // ── Bundle codes generation (nicht im Testmodus) ─────────────────────
  // Check service_bundles table first, fall back to service-level fields
  let bundle_codes: string[] = [];
  let bundlePositions: { position_number: number; name: string; price: number; is_first_session: boolean }[] = [];
  let matchedBundleId: string | null = null;
  let bundleRedeemableServiceId: string | null = null;
  let bundleRedeemableServiceLabel: string | null = null;
  if (service_id) {
    let bundleSize = 0;
    let bundleLabel = '';

    // Try service_bundles table first — match by bundle_id or price
    if (bundle_id) {
      // Direct match by bundle_id from request
      const { data: matchedBundle } = await supabase
        .from("service_bundles")
        .select("id, size, price, label, redeemable_for_service_id, redeemable_service_label")
        .eq("id", bundle_id)
        .eq("is_active", true)
        .maybeSingle();

      if (matchedBundle) {
        matchedBundleId = matchedBundle.id;
        bundleSize = matchedBundle.size;
        bundleLabel = matchedBundle.label || `${matchedBundle.size}er-Paket`;
        bundleRedeemableServiceId = matchedBundle.redeemable_for_service_id || null;
        bundleRedeemableServiceLabel = matchedBundle.redeemable_service_label || null;
        // Override price to bundle price
        if (price === null || requestedBundlePrice) {
          price = Number(matchedBundle.price);
        }
      }
    } else if (requestedBundlePrice) {
      // Match by price from request
      const { data: exactMatch } = await supabase
        .from("service_bundles")
        .select("id, size, price, label, redeemable_for_service_id, redeemable_service_label")
        .eq("service_id", service_id)
        .eq("is_active", true)
        .eq("price", requestedBundlePrice)
        .maybeSingle();

      if (exactMatch) {
        matchedBundleId = exactMatch.id;
        bundleSize = exactMatch.size;
        bundleLabel = exactMatch.label || `${exactMatch.size}er-Paket`;
        bundleRedeemableServiceId = exactMatch.redeemable_for_service_id || null;
        bundleRedeemableServiceLabel = exactMatch.redeemable_service_label || null;
        price = Number(exactMatch.price);
      }
    }

    // Fallback to service-level bundle fields
    if (bundleSize === 0) {
      const { data: bundleSvc } = await supabase
        .from("services")
        .select("bundle_size, bundle_price, bundle_label")
        .eq("id", service_id)
        .maybeSingle();

      if (bundleSvc?.bundle_size && bundleSvc.bundle_size > 1) {
        bundleSize = bundleSvc.bundle_size;
        bundleLabel = bundleSvc.bundle_label || `${bundleSvc.bundle_size}er-Paket`;
      }
    }

    // Load bundle positions if we have a matched bundle
    if (matchedBundleId) {
      const { data: posData } = await supabase
        .from("bundle_positions")
        .select("position_number, name, price, is_first_session")
        .eq("bundle_id", matchedBundleId)
        .order("position_number");
      if (posData && posData.length > 0) {
        bundlePositions = posData;
      }
    }

    if (bundleSize > 1) {
      const codeCount = bundleSize - 1;
      const codes: string[] = [];
      const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

      for (let i = 0; i < codeCount; i++) {
        let code: string;
        let attempts = 0;
        do {
          let part1 = '', part2 = '';
          for (let c = 0; c < 4; c++) part1 += CHARS[Math.floor(Math.random() * CHARS.length)];
          for (let c = 0; c < 4; c++) part2 += CHARS[Math.floor(Math.random() * CHARS.length)];
          code = `BTB-${part1}-${part2}`;
          attempts++;
        } while (codes.includes(code) && attempts < 10);
        codes.push(code);
      }

      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      // Non-first positions (positions 2..N) map to codes; first position = booked appointment
      const nonFirstPositions = bundlePositions.filter(p => !p.is_first_session);

      // Codes gelten für den konfigurierten Service (oder denselben Service falls nicht konfiguriert)
      const codeServiceId = bundleRedeemableServiceId || service_id;

      const codeRows = codes.map((code, idx) => ({
        company_id,
        service_id: codeServiceId,
        customer_email: customer.email,
        customer_name: customer.name,
        code,
        status: 'active',
        parent_booking_id: appointment.id,
        expires_at: expiresAt.toISOString(),
        position_name: nonFirstPositions[idx]?.name ?? null,
        bundle_id: matchedBundleId,
        redeemable_for_service_id: codeServiceId,
      }));

      const { error: codeErr } = await supabase
        .from("booking_codes")
        .insert(codeRows);

      if (codeErr) {
        console.error("Bundle code insert error:", codeErr);
      } else {
        bundle_codes = codes;

        // Send bundle email via Brevo
        try {
          const brevoKey = Deno.env.get("BREVO_API_KEY");
          if (brevoKey) {
            const { data: company } = await supabase
              .from("companies")
              .select("company_name")
              .eq("id", company_id)
              .maybeSingle();
            const companyName = company?.company_name ?? "Back to Balance";

            // Build itemized position list or plain code list for email
            let positionListHtml = '';
            const fmtPrice = (n: number) => Number(n).toFixed(2).replace('.', ',');

            if (bundlePositions.length > 0) {
              // Itemized: show each position with name, price, and code
              const firstPos = bundlePositions.find(p => p.is_first_session);
              const nonFirstPos = bundlePositions.filter(p => !p.is_first_session);
              const totalPrice = bundlePositions.reduce((s, p) => s + Number(p.price), 0);

              const rows: string[] = [];
              if (firstPos) {
                rows.push(`<tr><td style="padding:8px 16px;font-size:15px;color:#3d3520;border-bottom:1px solid #e0d9c0;"><strong>${firstPos.position_number}. ${firstPos.name}</strong> &mdash; ${fmtPrice(firstPos.price)} &euro; <span style="color:#8fa942;">(dein erster Termin)</span></td></tr>`);
              }
              nonFirstPos.forEach((p, idx) => {
                const code = codes[idx] ?? '—';
                rows.push(`<tr><td style="padding:8px 16px;font-size:15px;color:#3d3520;border-bottom:1px solid #e0d9c0;">${p.position_number}. ${p.name} &mdash; ${fmtPrice(p.price)} &euro; <span style="font-family:monospace;font-size:13px;background:#f5f0e0;padding:2px 6px;border-radius:4px;">(Code: ${code})</span></td></tr>`);
              });
              rows.push(`<tr><td style="padding:12px 16px;font-size:16px;font-weight:700;color:#1a1505;"><strong>Gesamt: ${fmtPrice(totalPrice)} &euro;</strong></td></tr>`);
              positionListHtml = `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border:1px solid #e0d9c0;border-radius:8px;overflow:hidden;">${rows.join('')}</table>`;
            } else {
              // Plain code list (no positions defined)
              const codeListHtml = codes.map((c) =>
                `<tr><td style="padding:8px 16px;font-family:monospace;font-size:18px;font-weight:700;letter-spacing:2px;background:#f5f0e0;border-radius:6px;text-align:center;">${c}</td></tr><tr><td style="height:6px;"></td></tr>`
              ).join('');
              positionListHtml = `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">${codeListHtml}</table>`;
            }

            // Service-Name für den die Codes gelten
            let redeemableLabel = bundleRedeemableServiceLabel || '';
            if (!redeemableLabel && codeServiceId) {
              const { data: redeemSvc } = await supabase.from("services").select("name").eq("id", codeServiceId).maybeSingle();
              redeemableLabel = redeemSvc?.name || '';
            }
            const codeHinweis = redeemableLabel
              ? `<br><strong>Wichtig:</strong> Die Buchungscodes gelten ausschlie&szlig;lich f&uuml;r <em>${redeemableLabel}</em>.`
              : '';

            const introText = bundlePositions.length > 0
              ? `vielen Dank f&uuml;r deine Buchung bei <strong>${companyName}</strong>! Hier ist die Aufschl&uuml;sselung deines Pakets:${codeHinweis}`
              : `vielen Dank f&uuml;r deine Buchung bei <strong>${companyName}</strong>! Dein erster Termin ist bereits gebucht.<br><br>Hier sind deine <strong>${codes.length} Buchungscode${codes.length > 1 ? 's' : ''}</strong> f&uuml;r die weiteren Sitzungen:${codeHinweis}`;

            const emailHtml = `<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e0;font-family:Georgia,'EB Garamond','Times New Roman',serif;"><tr><td align="center" style="padding:40px 20px;"><table width="560" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #e0d9c0;"><tr><td style="background-color:#f5f0e0;text-align:center;padding:36px 30px 28px;"><h1 style="margin:0;color:#b61818;font-size:28px;font-weight:700;">Back to Balance</h1><p style="margin:6px 0 0;color:#8fa942;font-size:18px;font-weight:600;letter-spacing:0.08em;">Universe</p></td></tr><tr><td style="padding:36px 40px 24px;background-color:#ffffff;color:#3d3520;"><h2 style="margin:0 0 16px;color:#1a1505;font-size:22px;">Dein Bundle-Paket: ${bundleLabel}</h2><p style="margin:0 0 20px;color:#3d3520;font-size:15px;line-height:1.7;">Hallo ${customer.name},<br><br>${introText}</p>${positionListHtml}<p style="margin:16px 0 0;color:#3d3520;font-size:14px;line-height:1.7;"><strong>So l&ouml;st du einen Code ein:</strong><br>1. &Ouml;ffne die Terminbuchung auf unserer Website<br>2. Klicke auf &bdquo;Buchungscode einl&ouml;sen&ldquo;<br>3. Gib deinen Code ein und w&auml;hle deinen Wunschtermin</p><p style="margin:16px 0 0;color:#8a7d60;font-size:13px;">Die Codes sind 12 Monate g&uuml;ltig und an deine E-Mail-Adresse gebunden.</p></td></tr><tr><td style="padding:20px 40px;background-color:#f5f0e0;border-top:1px solid #e0d9c0;"><p style="margin:0;color:#8a7d60;font-size:12px;text-align:center;">${companyName} &mdash; Back to Balance Universe</p></td></tr></table></td></tr></table>`;

            await fetch("https://api.brevo.com/v3/smtp/email", {
              method: "POST",
              headers: {
                "accept": "application/json",
                "api-key": brevoKey,
                "content-type": "application/json",
              },
              body: JSON.stringify({
                sender: { name: companyName, email: "kontakt@backtobalance.online" },
                to: [{ email: customer.email, name: customer.name }],
                subject: `Dein Bundle-Paket — ${codes.length} Buchungscodes`,
                htmlContent: emailHtml,
              }),
            });
          }
        } catch (emailErr) {
          console.error("Bundle email error (non-fatal):", emailErr);
        }
      }
    }
  }

  // Load cancellation_days for email
  let cancellationDays = 3;
  if (service_id) {
    const { data: cancelSvc } = await supabase
      .from("services")
      .select("cancellation_days")
      .eq("id", service_id)
      .maybeSingle();
    if (cancelSvc?.cancellation_days) cancellationDays = cancelSvc.cancellation_days;
  }

  // Service-Name für E-Mail laden
  let emailServiceName = '';
  if (service_id) {
    const { data: svcName } = await supabase.from("services").select("name").eq("id", service_id).maybeSingle();
    emailServiceName = svcName?.name || '';
  }

  // ── CREATE INVOICE INLINE (synchron) ─────────────────────────────────────
  // Note: Create invoice even in test mode for email confirmation
  // But accounting is not triggered (auto-invoice is skipped in test mode)
  // Load company logo and VAT settings early (needed for invoice and response)
  let companyLogoUrl: string | null = null;
  let vatEnabled = false;
  let vatRate = 19;
  try {
    const { data: companyData } = await supabase
      .from("companies")
      .select("logo_url, vat_enabled, vat_rate")
      .eq("id", company_id)
      .maybeSingle();
    companyLogoUrl = companyData?.logo_url ?? null;
    vatEnabled = companyData?.vat_enabled ?? false;
    vatRate = companyData?.vat_rate ?? 19;
  } catch { /* non-fatal */ }

  // Define suggested_followup (default: null if not calculated)
  let suggested_followup: any = null;

  let invoiceData: {
    number: string;
    total: number;
    subtotal: number;
    tax_amount: number;
    tax_rate: number;
    vat_enabled: boolean;
    payment_method?: string;
    qr_data?: string;
    company_iban?: string;
    company_bic?: string;
    company_name?: string;
  } | null = null;
  if ((price ?? 0) > 0) {
    try {
      invoiceData = await createInvoiceInline({
        company_id,
        customer_id: customerId,
        appointment_id: appointment?.id,
        service_id,
        price: price ?? 0,
        payment_method: payment_method || 'bar',
        is_first_session: isFirstSession,
        service_name: emailServiceName,
        discount_code: discountApplied?.code || undefined,
        vat_enabled: vatEnabled,
        vat_rate: vatRate,
      });
    } catch (e) {
      console.error("Inline invoice creation error (non-fatal):", e);
    }
  }

  // Bestätigungs-E-Mail senden (best-effort) — now includes invoice data
  if (appointment) {
    await sendConfirmationEmail(customer, appointment, company_id, {
      price, appliedDiscount, isFirstSession, cancellationDays,
      paymentMethod: payment_method || 'bar',
      serviceName: emailServiceName,
      invoice: invoiceData || undefined,
    }).catch((e) =>
      console.error("Email error:", e)
    );
  }

  // Self-Registration Einladung für Neukunden (best-effort, non-blocking)
  // Sends invite email with pre-filled link to /self-registration after first booking
  if (isFirstSession && !testMode && customer.email) {
    sendSelfRegistrationInvite(customer, company_id).catch(e =>
      console.error("Self-registration invite error (non-fatal):", e)
    );
  }

  // Auto-Invoice erstellen (best-effort, non-blocking)
  // Only trigger for Stripe payments (already paid) and non-test bookings
  // Bar payments: invoice created inline for email, but accounting deferred until payment confirmed
  if (!testMode && (price ?? 0) > 0 && payment_method === 'stripe' && appointment) {
    try {
      const invoiceUrl = Deno.env.get("SUPABASE_URL");
      const invoiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (invoiceUrl && invoiceKey) {
        await fetch(`${invoiceUrl}/functions/v1/auto-invoice`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${invoiceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointment_id: appointment.id,
            company_id,
            customer_id: customerId,
            service_id,
            price: price ?? 0,
            payment_method: payment_method || 'bar',
            customer_name: customer.name,
            customer_email: customer.email,
            is_first_session: isFirstSession,
            test_mode: testMode,
          }),
        });
      }
    } catch (e) {
      console.error("Auto-invoice trigger error (non-fatal):", e);
    }
  }

  // Get customer intro status for response
  let hasIntroStatus = false;
  if (customerId) {
    const { data: cust } = await supabase
      .from("customers")
      .select("has_intro_status")
      .eq("id", customerId)
      .maybeSingle();
    hasIntroStatus = cust?.has_intro_status ?? false;
  }

  return json({
    status: "success",
    booking_id: appointment?.id,
    start_ts: appointment?.start_time,
    end_ts: appointment?.end_time,
    is_first_session: isFirstSession,
    price: price,
    applied_discount: appliedDiscount,
    discount_applied: discountApplied,
    suggested_followup,
    company_logo: companyLogoUrl,
    vat_enabled: vatEnabled,
    vat_rate: vatRate,
    bundle_codes: bundle_codes.length > 0 ? bundle_codes : undefined,
    has_intro_status: hasIntroStatus,
    test_mode: testMode || undefined,
    message: testMode
      ? "[TESTMODUS] Termin im Kalender sichtbar (Status: test). Alles echt durchgelaufen — Buchhaltung ignoriert diesen Termin."
      : isFirstSession
        ? "Willkommen! Als Neukunde erhältst du ggf. einen Erstsitzungs-Rabatt. Bestätigung per E-Mail."
        : "Termin erfolgreich gebucht. Du erhältst eine Bestätigung per E-Mail.",
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// CANCEL — Termin stornieren
// ═══════════════════════════════════════════════════════════════════════════

async function handleCancel(req: Request) {
  const { booking_id, email, force } = await req.json();

  if (!booking_id || !email) {
    return json({ error: "booking_id und email sind erforderlich" }, 400);
  }

  const { data: appointment } = await supabase
    .from("appointments_extended")
    .select("id, customer_id, status, start_time, service_id")
    .eq("id", booking_id)
    .maybeSingle();

  if (!appointment) {
    return json({ error: "Termin nicht gefunden" }, 404);
  }

  // E-Mail-Verifizierung über customers-Tabelle
  const customerEmail = appointment.customer_id
    ? (await supabase.from("customers").select("email").eq("id", appointment.customer_id).maybeSingle())?.data?.email
    : null;

  if (customerEmail?.toLowerCase() !== email.toLowerCase()) {
    return json({ error: "E-Mail stimmt nicht überein" }, 403);
  }

  if (appointment.status === "cancelled") {
    return json({ error: "Termin ist bereits storniert" }, 400);
  }

  // Load service cancellation terms
  let cancellationDays = 3;
  let lateCancelFeePercent = 50;
  if (appointment.service_id) {
    const { data: svc } = await supabase
      .from("services")
      .select("cancellation_days, late_cancel_fee_percent")
      .eq("id", appointment.service_id)
      .maybeSingle();
    if (svc) {
      cancellationDays = svc.cancellation_days ?? 3;
      lateCancelFeePercent = svc.late_cancel_fee_percent ?? 50;
    }
  }

  // Check if within cancellation window
  const now = new Date();
  const startTime = new Date(appointment.start_time);
  const diffMs = startTime.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < cancellationDays && !force) {
    return json({
      status: "late_cancellation",
      fee_percent: lateCancelFeePercent,
      cancellation_days: cancellationDays,
      message: `Dieser Termin liegt innerhalb der Stornierungsfrist von ${cancellationDays} Tagen. Bei Stornierung wird eine Gebühr von ${lateCancelFeePercent}% fällig.`,
    });
  }

  const { error } = await supabase
    .from("appointments_extended")
    .update({ status: "cancelled" })
    .eq("id", booking_id);

  if (error) return json({ error: "Stornierung fehlgeschlagen" }, 500);

  // Point 6: Cancel or refund invoice when appointment is cancelled
  try {
    const { data: invoice } = await supabase
      .from('invoices')
      .select('id, invoice_number, total, status, company_id')
      .eq('appointment_id', booking_id)
      .maybeSingle();

    if (invoice) {
      if (invoice.status === 'paid') {
        // Already paid → create refund entry in payment_records
        await supabase.from('payment_records').insert({
          company_id: invoice.company_id,
          type: 'refund',
          amount: -Math.abs(Number(invoice.total)),
          description: `Rückerstattung ${invoice.invoice_number} (Stornierung)`,
          payment_method: 'cancellation',
          reference_type: 'invoice',
          reference_id: invoice.id,
          date: new Date().toISOString().split('T')[0],
        });
        // Leave invoice status as 'paid' — refund is tracked in payment_records
      } else if (['draft', 'sent', 'overdue'].includes(invoice.status)) {
        // Not yet paid → simply cancel the invoice
        await supabase.from('invoices').update({ status: 'cancelled' }).eq('id', invoice.id);
      }
    }
  } catch (e) {
    console.error('Invoice cancellation on appointment cancel (non-fatal):', e);
  }

  // Auto-notify next person on waitlist when a slot frees up
  await notifyNextWaitlistEntry().catch(e => console.error("Waitlist auto-notify error:", e));

  return json({ status: "cancelled", booking_id });
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICES — Öffentliche Dienstleistungen abrufen
// ═══════════════════════════════════════════════════════════════════════════

async function handleGetServices(url: URL) {
  const companyId = url.searchParams.get("company_id");
  if (!companyId) return json({ error: "company_id ist erforderlich" }, 400);

  const { data: services } = await supabase
    .from("services")
    .select("id, name, duration_min, buffer_after_min, price, first_session_price, first_session_discount_percent, bundle_size, bundle_price, bundle_label, cancellation_days, late_cancel_fee_percent, cancellation_note, show_on_website, website_description, website_details, website_sort_order, is_featured, category, location, stripe_description, promotion_active, promotion_price, promotion_label, promotion_description, promotion_ends_at")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .eq("is_test", false);

  // Load bundles from service_bundles table
  const { data: allBundles } = await supabase
    .from("service_bundles")
    .select("id, service_id, size, price, label, description")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("sort_order");

  // Load positions for all bundles
  const bundleIds = (allBundles ?? []).map((b: any) => b.id);
  let positionsByBundle: Record<string, any[]> = {};
  if (bundleIds.length > 0) {
    const { data: posData } = await supabase
      .from("bundle_positions")
      .select("bundle_id, position_number, name, price, is_first_session")
      .in("bundle_id", bundleIds)
      .order("position_number");
    if (posData) {
      for (const p of posData) {
        if (!positionsByBundle[p.bundle_id]) positionsByBundle[p.bundle_id] = [];
        positionsByBundle[p.bundle_id].push(p);
      }
    }
  }

  // Group bundles by service_id (with positions attached)
  const bundlesByService: Record<string, any[]> = {};
  for (const b of allBundles ?? []) {
    if (!bundlesByService[b.service_id]) bundlesByService[b.service_id] = [];
    bundlesByService[b.service_id].push({
      ...b,
      positions: positionsByBundle[b.id] ?? [],
    });
  }

  // Attach bundles to each service
  const servicesWithBundles = (services ?? []).map((s: any) => ({
    ...s,
    bundles: bundlesByService[s.id] ?? [],
  }));

  // Load company logo and VAT settings
  const { data: company } = await supabase
    .from("companies")
    .select("logo_url, vat_enabled, vat_rate, street, zip, city, address_note, latitude, longitude")
    .eq("id", companyId)
    .maybeSingle();

  return json({
    services: servicesWithBundles,
    company_logo: company?.logo_url ?? null,
    vat_enabled: company?.vat_enabled ?? false,
    vat_rate: company?.vat_rate ?? 19,
    street: company?.street ?? null,
    zip: company?.zip ?? null,
    city: company?.city ?? null,
    address_note: company?.address_note ?? null,
    latitude: company?.latitude ?? null,
    longitude: company?.longitude ?? null,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// FOLLOW-UP SUGGESTION — Find next available slot within 14 days
// ═══════════════════════════════════════════════════════════════════════════

async function findFollowUpSlot(
  companyId: string,
  serviceId: string | null,
  afterTs: string,
  durationMin: number
): Promise<{ date: string; start_time: string; end_time: string; start_ts: string; discount_percent?: number } | null> {
  const stepMin = 30;
  const afterDate = new Date(afterTs);
  const startDate = afterDate.toISOString().split("T")[0];

  // Load availability patterns and blockouts once
  const { data: patterns } = await supabase
    .from("availability_patterns")
    .select("*")
    .eq("company_id", companyId)
    .eq("pattern_type", "availability");

  const { data: blockouts } = await supabase
    .from("availability_patterns")
    .select("*")
    .eq("company_id", companyId)
    .eq("pattern_type", "blockout");

  // Buffer and discount from service
  let bufferMin = 0;
  let followupDiscountPercent = 0;
  if (serviceId) {
    const { data: svc } = await supabase
      .from("services")
      .select("buffer_after_min, followup_discount_percent")
      .eq("id", serviceId)
      .maybeSingle();
    bufferMin = svc?.buffer_after_min ?? 0;
    followupDiscountPercent = svc?.followup_discount_percent ?? 0;
  }

  // Check up to 14 days
  for (let dayOffset = 0; dayOffset <= 14; dayOffset++) {
    const checkDate = new Date(afterDate);
    checkDate.setDate(afterDate.getDate() + dayOffset);
    const dateStr = checkDate.toISOString().split("T")[0];
    const weekday = checkDate.getDay();

    // Collect available ranges for this day
    const availableRanges: Array<{ start: string; end: string }> = [];
    for (const p of patterns ?? []) {
      if (p.service_id && serviceId && p.service_id !== serviceId) continue;
      if (p.is_recurring && p.weekdays?.includes(weekday)) {
        availableRanges.push({ start: p.start_time, end: p.end_time });
      } else if (!p.is_recurring && p.start_date === dateStr) {
        availableRanges.push({ start: p.start_time, end: p.end_time });
      }
    }
    if (availableRanges.length === 0) continue;

    // Collect blocked ranges
    const blockedRanges: Array<{ start: string; end: string }> = [];
    for (const b of blockouts ?? []) {
      if (b.is_recurring && b.weekdays?.includes(weekday)) {
        blockedRanges.push({ start: b.start_time, end: b.end_time });
      } else if (!b.is_recurring && b.start_date <= dateStr && (b.end_date ?? b.start_date) >= dateStr) {
        blockedRanges.push({ start: b.start_time || "00:00", end: b.end_time || "23:59" });
      }
    }

    // Load existing appointments for this day
    const dayStart = dateStr + "T00:00:00";
    const dayEnd = dateStr + "T23:59:59";
    const { data: existingAppts } = await supabase
      .from("appointments_extended")
      .select("start_time, end_time")
      .eq("company_id", companyId)
      .in("status", ["confirmed", "pending", "scheduled"])
      .gte("start_time", dayStart)
      .lte("start_time", dayEnd);

    // The minimum start time: if same day as booked appointment, must be after it
    const afterTimeMin = dayOffset === 0
      ? (afterDate.getHours() * 60 + afterDate.getMinutes())
      : 0;

    // Find first available slot
    for (const range of availableRanges) {
      const [rStartH, rStartM] = range.start.split(":").map(Number);
      const [rEndH, rEndM] = range.end.split(":").map(Number);
      const rangeStartMin = rStartH * 60 + rStartM;
      const rangeEndMin = rEndH * 60 + rEndM;

      const firstSlotMin = Math.max(rangeStartMin, afterTimeMin);
      // Align to step
      const alignedStart = Math.ceil(firstSlotMin / stepMin) * stepMin;

      for (let t = alignedStart; t + durationMin <= rangeEndMin; t += stepMin) {
        const slotStart = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
        const slotEndT = t + durationMin;
        const slotEnd = `${String(Math.floor(slotEndT / 60)).padStart(2, "0")}:${String(slotEndT % 60).padStart(2, "0")}`;

        // Check blocked
        if (blockedRanges.some((b) => timeOverlaps(slotStart, slotEnd, b.start, b.end))) continue;

        // Check conflicts with existing appointments (including buffer)
        const slotStartTs = `${dateStr}T${slotStart}:00`;
        const slotEndWithBuffer = t + durationMin + bufferMin;
        const slotEndBufferStr = `${dateStr}T${String(Math.floor(slotEndWithBuffer / 60)).padStart(2, "0")}:${String(slotEndWithBuffer % 60).padStart(2, "0")}:00`;

        const hasConflict = (existingAppts ?? []).some((a: any) =>
          a.start_time < slotEndBufferStr && a.end_time > slotStartTs
        );
        if (hasConflict) continue;

        return {
          date: dateStr,
          start_time: slotStart,
          end_time: slotEnd,
          start_ts: slotStartTs,
          discount_percent: followupDiscountPercent > 0 ? followupDiscountPercent : undefined,
        };
      }
    }
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// REDEEM CODE — Buchungscode einlösen
// ═══════════════════════════════════════════════════════════════════════════

async function handleRedeemCode(req: Request, preBody?: any) {
  const body = preBody ?? await req.json();
  const { code, start_ts, customer } = body;

  if (!code || !start_ts || !customer?.name || !customer?.email) {
    return json({ error: "code, start_ts und customer (name, email) sind erforderlich" }, 400);
  }

  // Validate the code
  const { data: codeRecord, error: codeErr } = await supabase
    .from("booking_codes")
    .select("*")
    .eq("code", code.toUpperCase().trim())
    .maybeSingle();

  if (codeErr || !codeRecord) {
    return json({ error: "Ungültiger Buchungscode" }, 404);
  }

  if (codeRecord.status === 'redeemed') {
    return json({ error: "Dieser Code wurde bereits eingelöst" }, 400);
  }

  if (codeRecord.status === 'expired' || (codeRecord.expires_at && new Date(codeRecord.expires_at) < new Date())) {
    return json({ error: "Dieser Code ist abgelaufen" }, 400);
  }

  if (codeRecord.customer_email.toLowerCase() !== customer.email.toLowerCase()) {
    return json({ error: "Die E-Mail-Adresse stimmt nicht mit dem Code überein" }, 403);
  }

  const company_id = codeRecord.company_id;
  // Service-Einschränkung: Code gilt nur für bestimmten Service
  const redeemableServiceId = codeRecord.redeemable_for_service_id || codeRecord.service_id;

  // Wenn der Buchende einen Service gewählt hat, muss er zum Code passen
  if (body.service_id && redeemableServiceId && body.service_id !== redeemableServiceId) {
    // Service-Name für Fehlermeldung laden
    const { data: validService } = await supabase
      .from("services").select("name").eq("id", redeemableServiceId).maybeSingle();
    const serviceName = validService?.name || "den zugehörigen Service";
    return json({ error: `Dieser Code gilt nur für: ${serviceName}` }, 400);
  }

  const service_id = body.service_id || redeemableServiceId;

  // Get service duration + name
  let durationMin = 60;
  let serviceName = "";
  if (service_id) {
    const { data: service } = await supabase
      .from("services")
      .select("duration_min, name")
      .eq("id", service_id)
      .maybeSingle();
    if (service) {
      durationMin = service.duration_min ?? 60;
      serviceName = service.name ?? "";
    }
  }

  // Calculate end_ts
  const [datePart, timePart] = start_ts.split("T");
  const [hh, mm] = (timePart || "00:00").replace(/:\d{2}$/, "").split(":").map(Number);
  const totalMin = hh * 60 + mm + durationMin;
  const endHH = String(Math.floor(totalMin / 60)).padStart(2, "0");
  const endMM = String(totalMin % 60).padStart(2, "0");
  const end_ts = `${datePart}T${endHH}:${endMM}:00`;

  // Double-booking check
  const { data: conflicts } = await supabase
    .from("appointments_extended")
    .select("id")
    .eq("company_id", company_id)
    .in("status", ["confirmed", "pending", "scheduled"])
    .lt("start_time", end_ts)
    .gt("end_time", start_ts);

  if (conflicts && conflicts.length > 0) {
    return json({ error: "Dieser Zeitraum ist bereits ausgebucht" }, 409);
  }

  // Find or create customer
  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id")
    .eq("company_id", company_id)
    .eq("email", customer.email)
    .maybeSingle();

  let customerId = existingCustomer?.id;
  if (!customerId) {
    const { data: newCustomer, error: custErr } = await supabase
      .from("customers")
      .insert({
        company_id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone ?? null,
        retention_until: new Date(Date.now() + 10 * 365.25 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select("id")
      .maybeSingle();
    if (custErr) return json({ error: "Kunde konnte nicht angelegt werden" }, 500);
    if (!newCustomer) return json({ error: "Kunde konnte nicht angelegt werden" }, 500);
    customerId = newCustomer.id;
  }

  // Create appointment
  const { data: appointment, error: apptErr } = await supabase
    .from("appointments_extended")
    .insert({
      company_id,
      customer_id: customerId,
      service_id: service_id ?? null,
      start_time: start_ts,
      end_time: end_ts,
      title: serviceName ? `${serviceName}: ${customer.name}` : `Buchung: ${customer.name}`,
      description: `Eingelöst mit Buchungscode ${code}`,
      status: "pending",
    })
    .select("id, start_time, end_time, status")
    .maybeSingle();

  if (apptErr) {
    console.error("Redeem appointment error:", apptErr);
    return json({ error: "Termin konnte nicht erstellt werden" }, 500);
  }

  if (!appointment) {
    return json({ error: "Termin konnte nicht erstellt werden" }, 500);
  }

  // Mark code as redeemed
  await supabase
    .from("booking_codes")
    .update({
      status: 'redeemed',
      redeemed_booking_id: appointment.id,
    })
    .eq("id", codeRecord.id);

  // Send confirmation email
  await sendConfirmationEmail(customer, appointment, company_id).catch((e) =>
    console.error("Redeem email error:", e)
  );

  return json({
    status: "success",
    booking_id: appointment.id,
    start_ts: appointment.start_time,
    end_ts: appointment.end_time,
    redeemed_code: code,
    message: "Buchungscode eingelöst! Termin erfolgreich gebucht.",
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// RESCHEDULE — Termin umbuchen
// ═══════════════════════════════════════════════════════════════════════════

async function handleReschedule(req: Request) {
  const { booking_id, email, new_start_ts } = await req.json();

  if (!booking_id || !email || !new_start_ts) {
    return json({ error: "booking_id, email und new_start_ts sind erforderlich" }, 400);
  }

  // Find existing appointment
  const { data: appointment } = await supabase
    .from("appointments_extended")
    .select("id, customer_id, company_id, service_id, status, start_time, end_time")
    .eq("id", booking_id)
    .maybeSingle();

  if (!appointment) return json({ error: "Termin nicht gefunden" }, 404);
  if (appointment.status === 'cancelled') return json({ error: "Dieser Termin wurde bereits storniert" }, 400);

  // Verify email matches customer
  const { data: customer } = await supabase
    .from("customers")
    .select("id, email")
    .eq("id", appointment.customer_id)
    .maybeSingle();

  if (!customer || customer.email.toLowerCase() !== email.toLowerCase()) {
    return json({ error: "E-Mail stimmt nicht überein" }, 403);
  }

  // Calculate new end time based on original duration
  const origStart = new Date(appointment.start_time);
  const origEnd = new Date(appointment.end_time);
  const durationMs = origEnd.getTime() - origStart.getTime();

  const newStart = new Date(new_start_ts);
  const newEnd = new Date(newStart.getTime() + durationMs);

  // Format with timezone
  const getOffset = (dateStr: string): string => {
    const d = new Date(dateStr + "T12:00:00Z");
    const fmt = new Intl.DateTimeFormat("en", { timeZone: "Europe/Berlin", timeZoneName: "shortOffset" });
    const parts = fmt.formatToParts(d);
    const tzPart = parts.find(p => p.type === "timeZoneName")?.value || "+01";
    const match = tzPart.match(/([+-]?\d+)/);
    if (match) {
      const hrs = parseInt(match[1]);
      return `${hrs >= 0 ? '+' : '-'}${String(Math.abs(hrs)).padStart(2, '0')}:00`;
    }
    return "+01:00";
  };

  const datePart = new_start_ts.split("T")[0];
  const tz = getOffset(datePart);
  const newStartTz = new_start_ts.includes('+') ? new_start_ts : `${new_start_ts}${tz}`;
  const endHH = String(newEnd.getHours()).padStart(2, '0');
  const endMM = String(newEnd.getMinutes()).padStart(2, '0');
  const newEndTz = `${datePart}T${endHH}:${endMM}:00${tz}`;

  // Check for conflicts at new time
  const { data: conflicts } = await supabase
    .from("appointments_extended")
    .select("id")
    .eq("company_id", appointment.company_id)
    .in("status", ["confirmed", "pending", "scheduled"])
    .neq("id", appointment.id)
    .lt("start_time", newEndTz)
    .gt("end_time", newStartTz);

  if (conflicts && conflicts.length > 0) {
    return json({ error: "Der gewünschte Zeitraum ist bereits belegt" }, 409);
  }

  // Update appointment
  const { error: updateErr } = await supabase
    .from("appointments_extended")
    .update({
      start_time: newStartTz,
      end_time: newEndTz,
      description: `Umgebucht von ${origStart.toISOString().split('T')[0]} ${origStart.toTimeString().slice(0,5)}`,
    })
    .eq("id", appointment.id);

  if (updateErr) return json({ error: "Umbuchung fehlgeschlagen" }, 500);

  return json({
    status: "success",
    booking_id: appointment.id,
    new_start: newStartTz,
    new_end: newEndTz,
    message: "Termin erfolgreich umgebucht",
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATE DISCOUNT — Rabattcode prüfen
// ═══════════════════════════════════════════════════════════════════════════

async function handleValidateDiscount(req: Request) {
  const { code, company_id, service_id } = await req.json();

  if (!code || !company_id) {
    return json({ valid: false, error: "code und company_id sind erforderlich" }, 400);
  }

  const { data: dc } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("company_id", company_id)
    .eq("code", code.toUpperCase().trim())
    .eq("is_active", true)
    .maybeSingle();

  if (!dc) {
    return json({ valid: false, error: "Ungueltiger Rabattcode" });
  }

  const now = new Date();
  if (dc.valid_until && new Date(dc.valid_until) <= now) {
    return json({ valid: false, error: "Dieser Code ist abgelaufen" });
  }

  if (dc.max_uses > 0 && dc.used_count >= dc.max_uses) {
    return json({ valid: false, error: "Dieser Code wurde bereits maximal eingeloest" });
  }

  if (dc.service_id && service_id && dc.service_id !== service_id) {
    return json({ valid: false, error: "Dieser Code gilt nicht fuer den gewaehlten Service" });
  }

  return json({
    valid: true,
    discount_type: dc.discount_type,
    discount_value: Number(dc.discount_value),
    code: dc.code,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// REVIEWS — Bewertungen abrufen und abgeben
// ═══════════════════════════════════════════════════════════════════════════

async function handleGetReviews(url: URL) {
  const companyId = url.searchParams.get("company_id");
  const serviceId = url.searchParams.get("service_id");

  if (!companyId) {
    return json({ error: "company_id ist erforderlich" }, 400);
  }

  let query = supabase
    .from("service_reviews")
    .select("id, customer_name, rating, comment, created_at")
    .eq("company_id", companyId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (serviceId) {
    query = query.eq("service_id", serviceId);
  }

  const { data: reviews, error } = await query;

  if (error) {
    return json({ error: error.message }, 500);
  }

  const reviewList = reviews ?? [];
  const count = reviewList.length;
  const averageRating = count > 0
    ? Math.round((reviewList.reduce((sum: number, r: any) => sum + r.rating, 0) / count) * 10) / 10
    : 0;

  return json({ reviews: reviewList, count, average_rating: averageRating });
}

async function handlePostReview(req: Request) {
  const body = await req.json();
  const { company_id, service_id, customer_name, rating, comment } = body;

  if (!company_id || !customer_name || !rating) {
    return json({ error: "company_id, customer_name und rating sind erforderlich" }, 400);
  }

  if (rating < 1 || rating > 6 || !Number.isInteger(rating)) {
    return json({ error: "rating muss eine Ganzzahl zwischen 1 und 6 sein" }, 400);
  }

  // AI-powered authenticity check
  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
  let authenticityScore = 50; // default: neutral
  let authenticityReason = "";

  if (anthropicKey && comment?.trim()) {
    try {
      const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 200,
          messages: [{
            role: "user",
            content: `Analysiere diese Kundenbewertung für einen Körperarbeit/Wellness-Service und bewerte die Authentizität.

Bewertung: "${comment}"
Sterne: ${rating}/5
Name: ${customer_name}

Antworte NUR mit einem JSON-Objekt (kein anderer Text):
{"score": <0-100>, "reason": "<kurze Begründung auf Deutsch>"}

Score-Bedeutung:
- 80-100: Klingt wie eine echte Kundenerfahrung (spezifische Details, persönliche Eindrücke, beschreibt Wirkung)
- 50-79: Neutral, könnte echt sein aber keine starken Indikatoren
- 20-49: Verdächtig (sehr generisch, keine Details, klingt wie eine Vorlage)
- 0-19: Wahrscheinlich Spam/Fake (Werbung, Links, nonsense, beleidigend)`
          }]
        }),
      });
      const aiData = await aiRes.json();
      const aiText = aiData.content?.[0]?.text || "";
      const parsed = JSON.parse(aiText);
      authenticityScore = parsed.score ?? 50;
      authenticityReason = parsed.reason ?? "";
    } catch (e) {
      console.error("AI review check error (non-fatal):", e);
    }
  }

  // Auto-approve if score >= 70, otherwise needs manual review
  const isApproved = authenticityScore >= 70;

  const { error } = await supabase
    .from("service_reviews")
    .insert({
      company_id,
      service_id: service_id || null,
      customer_name: customer_name.trim(),
      rating,
      comment: comment?.trim() || null,
      is_approved: isApproved,
      authenticity_score: authenticityScore,
      authenticity_reason: authenticityReason || null,
    });

  if (error) {
    return json({ error: error.message }, 500);
  }

  return json({
    status: "success",
    authenticity_score: authenticityScore,
    auto_approved: isApproved,
    message: isApproved
      ? "Bewertung eingereicht und automatisch freigegeben."
      : "Bewertung eingereicht. Sie wird nach Prüfung veröffentlicht.",
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMUNITY REVIEWS
// ═══════════════════════════════════════════════════════════════════════════

async function handleGetCommunityReviews(url: URL) {
  const companyId = url.searchParams.get("company_id");

  if (!companyId) {
    return json({ error: "company_id ist erforderlich" }, 400);
  }

  const { data: reviews, error } = await supabase
    .from("community_reviews")
    .select("id, reviewer_name, rating, comment, is_member_verified, created_at")
    .eq("company_id", companyId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    return json({ error: error.message }, 500);
  }

  const reviewList = reviews ?? [];
  const count = reviewList.length;
  const averageRating = count > 0
    ? Math.round((reviewList.reduce((sum: number, r: any) => sum + r.rating, 0) / count) * 10) / 10
    : 0;

  return json({ reviews: reviewList, count, average_rating: averageRating });
}

async function handlePostCommunityReview(req: Request) {
  const body = await req.json();
  const { company_id, reviewer_name, rating, comment } = body;

  if (!company_id || !reviewer_name || !rating) {
    return json({ error: "company_id, reviewer_name und rating sind erforderlich" }, 400);
  }

  if (rating < 1 || rating > 6 || !Number.isInteger(rating)) {
    return json({ error: "rating muss eine Ganzzahl zwischen 1 und 6 sein" }, 400);
  }

  // Check if reviewer_name matches a universe_members display_name
  let isMemberVerified = false;
  const { data: memberMatch } = await supabase
    .from("universe_members")
    .select("id")
    .ilike("display_name", reviewer_name.trim())
    .limit(1);

  if (memberMatch && memberMatch.length > 0) {
    isMemberVerified = true;
  }

  // AI-powered authenticity check
  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
  let authenticityScore = 50;
  let authenticityReason = "";

  if (anthropicKey && comment?.trim()) {
    try {
      const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 200,
          messages: [{
            role: "user",
            content: `Analysiere diese Genossenschafts-Bewertung und bewerte die Authentizitaet.

Bewertung: "${comment}"
Sterne: ${rating}/5
Name: ${reviewer_name}
Mitglied verifiziert: ${isMemberVerified ? "Ja" : "Nein"}

Antworte NUR mit einem JSON-Objekt (kein anderer Text):
{"score": <0-100>, "reason": "<kurze Begruendung auf Deutsch>"}

Score-Bedeutung:
- 80-100: Klingt wie eine echte Erfahrung (spezifische Details, persoenliche Eindruecke)
- 50-79: Neutral, koennte echt sein aber keine starken Indikatoren
- 20-49: Verdaechtig (sehr generisch, keine Details, klingt wie eine Vorlage)
- 0-19: Wahrscheinlich Spam/Fake (Werbung, Links, nonsense, beleidigend)`
          }]
        }),
      });
      const aiData = await aiRes.json();
      const aiText = aiData.content?.[0]?.text || "";
      const parsed = JSON.parse(aiText);
      authenticityScore = parsed.score ?? 50;
      authenticityReason = parsed.reason ?? "";
    } catch (e) {
      console.error("AI community review check error (non-fatal):", e);
    }
  }

  const isApproved = authenticityScore >= 70 && isMemberVerified;

  const { error } = await supabase
    .from("community_reviews")
    .insert({
      company_id,
      reviewer_name: reviewer_name.trim(),
      rating,
      comment: comment?.trim() || null,
      is_approved: isApproved,
      is_member_verified: isMemberVerified,
      authenticity_score: authenticityScore,
      authenticity_reason: authenticityReason || null,
    });

  if (error) {
    return json({ error: error.message }, 500);
  }

  return json({
    status: "success",
    is_member_verified: isMemberVerified,
    authenticity_score: authenticityScore,
    auto_approved: isApproved,
    message: isApproved
      ? "Erfahrung eingereicht und automatisch freigegeben."
      : "Erfahrung eingereicht. Sie wird nach Pruefung veroeffentlicht.",
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// WAITLIST AUTO-NOTIFICATION — Smart Warteschlange mit E-Mail-Response-Links
// ═══════════════════════════════════════════════════════════════════════════

async function notifyNextWaitlistEntry() {
  // Find next person with status 'waiting', ordered by priority then created_at
  const { data: entries } = await (supabase as any)
    .from('waitlist')
    .select('*')
    .eq('status', 'waiting')
    .eq('auto_notify', true)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1);

  if (!entries?.length) return;

  const next = entries[0];

  const brevoKey = Deno.env.get("BREVO_API_KEY");
  if (!brevoKey || !next.customer_email) return;

  const baseUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/public-booking`;
  const yesUrl = `${baseUrl}?action=waitlist-respond&token=${next.response_token}&response=interested`;
  const noUrl = `${baseUrl}?action=waitlist-respond&token=${next.response_token}&response=not_interested`;

  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": brevoKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: "Back to Balance", email: "kontakt@backtobalance.online" },
      to: [{ email: next.customer_email, name: next.customer_name || "" }],
      subject: "Ein Termin ist frei geworden — bist du noch dabei?",
      htmlContent: `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e0;font-family:Georgia,serif;"><tr><td align="center" style="padding:40px 20px;"><table width="560" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #e0d9c0;"><tr><td style="background:#f5f0e0;text-align:center;padding:28px 30px 20px;"><h1 style="margin:0;color:#b61818;font-size:24px;">Back to Balance</h1><p style="margin:4px 0 0;color:#8fa942;font-size:15px;">Ganzheitliche K&ouml;rperarbeit</p></td></tr><tr><td style="padding:28px 40px;background:#fff;color:#3d3520;"><h2 style="margin:0 0 12px;font-size:20px;">Ein Termin ist frei geworden!</h2><p style="font-size:15px;line-height:1.7;">Hallo ${next.customer_name || ''},<br><br>du stehst auf unserer Warteliste${next.service_type ? ` f&uuml;r <strong>${next.service_type}</strong>` : ''} und ein Termin${next.preferred_date ? ` in deinem Wunschzeitraum` : ''} ist verf&uuml;gbar geworden.</p><p style="font-size:14px;color:#8a7d60;margin:16px 0 4px;">Bitte gib uns kurz Bescheid:</p><div style="margin:20px 0;text-align:center;"><a href="${yesUrl}" style="display:inline-block;background:#8fa942;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;margin-right:12px;">Ja, ich buche!</a><a href="${noUrl}" style="display:inline-block;background:#b61818;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">Kein Interesse mehr</a></div><p style="font-size:12px;color:#8a7d60;margin-top:16px;">Wenn wir innerhalb von 2 Tagen keine R&uuml;ckmeldung erhalten, wird automatisch die n&auml;chste Person auf der Warteliste benachrichtigt.</p></td></tr><tr><td style="padding:20px 40px;background:#f5f0e0;border-top:1px solid #e0d9c0;text-align:center;"><p style="margin:0;font-size:13px;color:#8a7d60;">Back to Balance &mdash; Ganzheitliche K&ouml;rperarbeit</p><p style="margin:4px 0 0;font-size:11px;color:#b0a888;">Hildastr. 12, 79102 Freiburg im Breisgau</p></td></tr></table></td></tr></table>`,
    }),
  });

  // Mark as notified
  await (supabase as any).from('waitlist').update({
    status: 'notified',
    notified_at: new Date().toISOString(),
    notification_count: (next.notification_count || 0) + 1,
  }).eq('id', next.id);
}

async function handleWaitlistRespond(body: any) {
  const { token, response } = body;
  if (!token || !response) return json({ error: "token und response erforderlich" }, 400);
  if (!['interested', 'not_interested'].includes(response)) {
    return json({ error: "response muss 'interested' oder 'not_interested' sein" }, 400);
  }

  const { data: entry } = await (supabase as any)
    .from('waitlist')
    .select('*')
    .eq('response_token', token)
    .maybeSingle();

  if (!entry) return json({ error: "Ungültiger Link" }, 404);

  // Update response
  await (supabase as any).from('waitlist').update({
    response,
    response_at: new Date().toISOString(),
    status: response === 'not_interested' ? 'expired' : 'notified',
  }).eq('id', entry.id);

  // If not interested, notify next person in queue
  if (response === 'not_interested') {
    await notifyNextWaitlistEntry().catch(e => console.error("Waitlist advance error:", e));
  }

  const redirectUrl = response === 'interested'
    ? 'https://backtobalance.online/koerperarbeit/buchen'
    : 'https://backtobalance.online/koerperarbeit';
  const message = response === 'interested'
    ? 'Du wirst jetzt zur Buchung weitergeleitet...'
    : 'Du wurdest von der Warteliste entfernt. Die nächste Person wird benachrichtigt.';

  return new Response(
    `<html><head><meta charset="utf-8"><meta http-equiv="refresh" content="3;url=${redirectUrl}"></head><body style="font-family:Georgia,serif;text-align:center;padding:60px;color:#3d3520;background:#f5f0e0;"><h2>${message}</h2><p><a href="${redirectUrl}" style="color:#2a7cab;">Weiter &rarr;</a></p></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders } },
  );
}

async function handleWaitlistRespondGet(url: URL) {
  const token = url.searchParams.get('token');
  const response = url.searchParams.get('response');

  if (!token || !response) {
    return new Response(
      `<html><head><meta charset="utf-8"></head><body style="font-family:Georgia,serif;text-align:center;padding:60px;color:#3d3520;background:#f5f0e0;"><h2>Ung&uuml;ltiger Link</h2><p>Bitte verwende den vollst&auml;ndigen Link aus deiner E-Mail.</p></body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders } },
    );
  }

  // Delegate to the same logic as POST
  return await handleWaitlistRespond({ token, response });
}

// ═══════════════════════════════════════════════════════════════════════════
// EPC QR CODE GENERATOR — Erstelle EPC QR-Code für SEPA-Überweisung
// ═══════════════════════════════════════════════════════════════════════════

function generateEPCQRCodeData(
  iban: string,
  bic: string,
  amount: number,
  reference: string,
  companyName: string
): string {
  // EPC QR-Code Format (SEPA Credit Transfer)
  // Line 1: Service Tag (BCD)
  // Line 2: Version (002)
  // Line 3: Character Set (1 = UTF-8)
  // Line 4: Identification (SCT for SEPA Credit Transfer)
  // Line 5: BIC
  // Line 6: IBAN
  // Line 7: Amount in EUR (in cents, e.g., 7500 for 75.00 EUR)
  // Line 8: Structured Reference (leave empty for unstructured)
  // Line 9: Unstructured Reference (invoice number)
  // Line 10: Beneficiary name (company name)

  const epcData = [
    "BCD",
    "002",
    "1",
    "SCT",
    (bic || "").replace(/\s/g, ""),
    iban.replace(/\s/g, ""),
    String(Math.round(amount * 100)), // Amount in cents
    "EUR",
    "",
    reference,
    companyName,
    "",
  ].join("\n");

  return epcData;
}

// ═══════════════════════════════════════════════════════════════════════════
// CREATE INVOICE INLINE — Erstelle Rechnung synchron während Buchung
// ═══════════════════════════════════════════════════════════════════════════

async function createInvoiceInline(params: {
  company_id: string;
  customer_id: string;
  appointment_id: string;
  service_id?: string | null;
  price: number;
  payment_method: string;
  is_first_session: boolean;
  service_name: string;
  discount_code?: string;
  vat_enabled: boolean;
  vat_rate: number;
}): Promise<{ number: string; total: number; subtotal: number; tax_amount: number; tax_rate: number; vat_enabled: boolean }> {
  const { company_id, customer_id, appointment_id, service_id, price, payment_method, is_first_session, service_name, vat_enabled, vat_rate } = params;

  // 1. Duplikat-Check: Rechnung existiert schon für diesen Termin?
  const { data: existingInvoice } = await supabase
    .from("invoices")
    .select("id")
    .eq("appointment_id", appointment_id)
    .eq("company_id", company_id)
    .maybeSingle();

  if (existingInvoice) {
    throw new Error("Invoice already exists for this appointment");
  }

  // 1b. Company-Daten laden (für QR-Code SEPA-Infos)
  const { data: company } = await supabase
    .from("companies")
    .select("company_name, company_iban, company_bic, bank_name, account_holder")
    .eq("id", company_id)
    .maybeSingle();

  const companyName = company?.company_name || "Back to Balance";
  const companyIban = company?.company_iban || "";
  const companyBic = company?.company_bic || "";
  const companyBankName = company?.bank_name || "";
  // Kontoinhaber = rechtlicher Empfänger der Überweisung (kann vom Markennamen abweichen)
  const accountHolder = company?.account_holder || companyName;

  // 2. Rechnungsnummer generieren (RE-YYYY-NNN format, gap-free, zero-padded)
  const now = new Date();
  const year = now.getFullYear();
  const { data: lastInvoice } = await supabase
    .from("invoices")
    .select("invoice_number")
    .eq("company_id", company_id)
    .like("invoice_number", `RE-${year}-%`)
    .order("invoice_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextNumber = 1;
  if (lastInvoice?.invoice_number) {
    const match = lastInvoice.invoice_number.match(/RE-\d+-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }
  const invoiceNumber = `RE-${year}-${String(nextNumber).padStart(3, '0')}`;

  // 3. Preisberechnung (mit MwSt falls aktiviert)
  let subtotal = price;
  let taxAmount = 0;
  let total = price;

  if (vat_enabled && vat_rate > 0) {
    // Price is the gross/brutto price — back-calculate netto
    subtotal = Math.round((price / (1 + vat_rate / 100)) * 100) / 100;
    taxAmount = Math.round((price - subtotal) * 100) / 100;
    total = price;
  } else {
    subtotal = price;
    taxAmount = 0;
    total = price;
  }

  // 4. Invoice-Status bestimmen
  // Alle Rechnungen werden mit 'sent' erstellt — erst bei echter Zahlung wird 'paid' markiert
  // So können Rabatte angewendet werden, bevor die Rechnung als bezahlt gebucht wird
  const invoiceStatus = 'sent';
  const dueDate = payment_method === 'bar'
    ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]  // 3 Tage für bar
    : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 14 Tage für online

  // 5. Insert invoices row
  const { data: invoice, error: invoiceErr } = await supabase
    .from("invoices")
    .insert({
      company_id,
      customer_id,
      appointment_id,
      invoice_number: invoiceNumber,
      status: invoiceStatus,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: dueDate,
      subtotal: subtotal,
      tax_rate: vat_enabled ? vat_rate : 0,
      tax_amount: taxAmount,
      total: total,
      payment_method: payment_method,
      auto_generated: true,
      sent_at: new Date().toISOString(),
    })
    .select("id")
    .maybeSingle();

  if (invoiceErr || !invoice) {
    throw new Error(`Failed to create invoice: ${invoiceErr?.message || 'Unknown error'}`);
  }

  // 6. Insert invoice_items row (1 Zeile: Service + optional "(Erstsitzung)")
  const itemDescription = is_first_session && service_name
    ? `${service_name} (Erstsitzung)`
    : service_name || 'Leistung';

  const { error: itemErr } = await supabase
    .from("invoice_items")
    .insert({
      invoice_id: invoice.id,
      description: itemDescription,
      quantity: 1,
      unit_price: subtotal,
      total: subtotal,
      service_id: service_id || null,
    });

  if (itemErr) {
    console.error("Failed to create invoice item:", itemErr);
    // Don't throw — invoice is already created, item creation is best-effort
  }

  // 7. Generiere EPC QR-Code Daten (für Bar-Zahlungen)
  let qrData: string | undefined;
  if (payment_method === 'bar' && companyIban) {
    qrData = generateEPCQRCodeData(
      companyIban,
      companyBic,
      total,
      invoiceNumber,
      accountHolder
    );
  }

  return {
    number: invoiceNumber,
    total: total,
    subtotal: subtotal,
    tax_amount: taxAmount,
    tax_rate: vat_enabled ? vat_rate : 0,
    vat_enabled: vat_enabled,
    payment_method: payment_method || 'bar',
    qr_data: qrData,
    company_iban: companyIban,
    company_bic: companyBic,
    company_name: companyName,
    bank_name: companyBankName,
    account_holder: accountHolder,
  } as any;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function timeOverlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && aEnd > bStart;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sendConfirmationEmail(
  customer: { name: string; email: string },
  appointment: { id: string; start_time: string; end_time: string },
  companyId: string,
  options?: {
    price?: number | null;
    appliedDiscount?: string | null;
    isFirstSession?: boolean;
    cancellationDays?: number;
    vatEnabled?: boolean;
    vatRate?: number;
    paymentMethod?: string;
    serviceName?: string;
    invoice?: {
      number: string;
      total: number;
      subtotal: number;
      tax_amount: number;
      tax_rate: number;
      vat_enabled: boolean;
      payment_method?: string;
      qr_data?: string;
      company_iban?: string;
      company_bic?: string;
      company_name?: string;
      bank_name?: string;
      account_holder?: string;
    };
  }
) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    console.error("RESEND_API_KEY not set — skipping confirmation email");
    return;
  }

  const { data: company } = await supabase
    .from("companies")
    .select("company_name, logo_url, vat_enabled, vat_rate")
    .eq("id", companyId)
    .maybeSingle();

  const companyName = company?.company_name ?? "Back to Balance";
  const companyLogoUrl = company?.logo_url ?? null;
  const vatEnabled = options?.vatEnabled ?? company?.vat_enabled ?? false;
  const vatRate = options?.vatRate ?? company?.vat_rate ?? 19;

  // Parse date/time robustly (start_time may be "2026-04-27T11:15:00" without TZ)
  const startRaw = appointment.start_time;
  const endRaw = appointment.end_time;
  const datePart = startRaw.split("T")[0]; // "2026-04-27"
  const timePart = startRaw.split("T")[1]?.substring(0, 5) || "00:00"; // "11:15"
  const endTimePart = endRaw.split("T")[1]?.substring(0, 5) || "00:00";

  // Format date in German
  const [year, month, day] = datePart.split("-");
  const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const weekdays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const dateFormatted = `${weekdays[dateObj.getDay()]}, ${parseInt(day)}. ${monthNames[parseInt(month) - 1]} ${year}`;
  const timeFormatted = `${timePart} – ${endTimePart} Uhr`;

  // Generate ICS calendar file content
  const icsStart = `${year}${month}${day}T${timePart.replace(":", "")}00`;
  const icsEnd = `${year}${month}${day}T${endTimePart.replace(":", "")}00`;
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Back to Balance//Booking//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTART;TZID=Europe/Berlin:${icsStart}`,
    `DTEND;TZID=Europe/Berlin:${icsEnd}`,
    `SUMMARY:Termin bei ${companyName}`,
    `DESCRIPTION:Buchungs-ID: ${appointment.id}`,
    `UID:${appointment.id}@backtobalance.online`,
    "STATUS:CONFIRMED",
    `ORGANIZER;CN=${companyName}:mailto:kontakt@backtobalance.online`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const icsBase64 = btoa(icsContent);

  // Price display with VAT breakdown
  const priceVal = options?.price;
  const isFirst = options?.isFirstSession;
  const discount = options?.appliedDiscount;
  let priceHtml = '';
  if (priceVal) {
    if (vatEnabled && vatRate > 0) {
      const netto = priceVal;
      const vatAmount = Math.round(netto * vatRate) / 100;
      const brutto = Math.round((netto + vatAmount) * 100) / 100;
      priceHtml = `
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#8a7d60;">Netto</td>
                <td style="padding:6px 0;font-size:14px;color:#1a1505;">${netto.toFixed(2).replace('.', ',')} &euro;${isFirst ? ' <span style="color:#8fa942;font-size:13px;font-weight:600;">(Erstsitzungs-Vorteil)</span>' : ''}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#8a7d60;">zzgl. ${vatRate}% MwSt</td>
                <td style="padding:6px 0;font-size:14px;color:#1a1505;">${vatAmount.toFixed(2).replace('.', ',')} &euro;</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#8a7d60;">Gesamt</td>
                <td style="padding:6px 0;font-size:16px;font-weight:700;color:#1a1505;">${brutto.toFixed(2).replace('.', ',')} &euro;</td>
              </tr>`;
    } else {
      priceHtml = `
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#8a7d60;">Preis</td>
                <td style="padding:6px 0;font-size:16px;font-weight:700;color:#1a1505;">${priceVal} &euro;${isFirst ? ' <span style="color:#8fa942;font-size:13px;font-weight:600;">(Erstsitzungs-Vorteil)</span>' : ''}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding:4px 0 0;font-size:12px;color:#b0a888;line-height:1.5;">Gem&auml;&szlig; &sect; 19 UStG (Kleinunternehmerregelung) wird keine Umsatzsteuer berechnet. Der Preis ist ein Endpreis.</td>
              </tr>`;
    }
  }

  const logoHeaderHtml = companyLogoUrl
    ? `<img src="${companyLogoUrl}" alt="${companyName}" style="max-height:40px;max-width:200px;width:auto;" />`
    : `<h1 style="margin:0;color:#b61818;font-size:28px;font-weight:700;">Back to Balance</h1><p style="margin:6px 0 0;color:#8fa942;font-size:18px;font-weight:600;letter-spacing:0.08em;">Universe</p>`;

  const emailHtml = `
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e0;font-family:Georgia,'EB Garamond','Times New Roman',serif;">
  <tr><td align="center" style="padding:40px 20px;">
    <table width="560" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #e0d9c0;">
      <tr><td style="background-color:#f5f0e0;text-align:center;padding:36px 30px 28px;">
        ${logoHeaderHtml}
      </td></tr>
      <tr><td style="padding:36px 40px 24px;background-color:#ffffff;color:#3d3520;">
        <h2 style="margin:0 0 16px;color:#1a1505;font-size:22px;">Terminbest&auml;tigung${options?.serviceName ? ` &mdash; ${options.serviceName}` : ''}</h2>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#3d3520;">
          Hallo ${customer.name},<br><br>
          dein Termin f&uuml;r <strong>${options?.serviceName || 'ganzheitliche K&ouml;rperarbeit'}</strong> bei <strong>${companyName}</strong> wurde erfolgreich gebucht.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e0;border-radius:10px;margin:0 0 24px;">
          <tr><td style="padding:20px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#8a7d60;width:80px;">Datum</td>
                <td style="padding:6px 0;font-size:15px;font-weight:600;color:#1a1505;">${dateFormatted}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#8a7d60;">Uhrzeit</td>
                <td style="padding:6px 0;font-size:15px;font-weight:600;color:#1a1505;">${timeFormatted}</td>
              </tr>${priceHtml}
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#8a7d60;">Zahlung</td>
                <td style="padding:6px 0;font-size:14px;color:#1a1505;">${options?.paymentMethod === 'stripe' ? '<strong style="color:#2a7cab;">Online bezahlt</strong>' : '<strong>Vor Ort in bar</strong> &mdash; bitte bringe den Betrag passend mit'}</td>
              </tr>
              ${options?.paymentMethod !== 'stripe' && options?.invoice?.number ? `<tr><td colspan="2" style="padding:10px 0 4px;">
                <div style="background:#fffbe6;border:1px solid #e8c840;border-radius:8px;padding:12px;font-size:13px;color:#5a4a00;">
                  <strong>📄 Bitte bringen Sie Ihre Rechnung zum Termin mit.</strong><br>
                  <span style="opacity:0.85;font-size:12px;">Für Überweisungen: Verwendungszweck <strong>${options.invoice.number}</strong></span>
                </div>
              </td></tr>` : ''}
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#8a7d60;">ID</td>
                <td style="padding:6px 0;font-size:12px;color:#8a7d60;font-family:monospace;">${appointment.id}</td>
              </tr>
            </table>
          </td></tr>
        </table>
        ${options?.invoice ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e0;border-radius:10px;margin:0 0 24px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 12px;font-size:15px;font-weight:700;color:#1a1505;">Rechnung</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#8a7d60;">Rechnungsnummer</td>
                <td style="padding:6px 0;font-size:15px;font-weight:600;color:#1a1505;">${options.invoice.number}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#8a7d60;">Service</td>
                <td style="padding:6px 0;font-size:15px;font-weight:600;color:#1a1505;">${options?.serviceName || 'Körperarbeit'}</td>
              </tr>
              ${options.invoice.vat_enabled ? `
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#8a7d60;">Netto</td>
                <td style="padding:6px 0;font-size:15px;color:#1a1505;">${options.invoice.subtotal.toFixed(2).replace('.', ',')} &euro;</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#8a7d60;">zzgl. ${options.invoice.tax_rate}% MwSt</td>
                <td style="padding:6px 0;font-size:15px;color:#1a1505;">${options.invoice.tax_amount.toFixed(2).replace('.', ',')} &euro;</td>
              </tr>
              ` : `
              <tr>
                <td colspan="2" style="padding:6px 0;font-size:12px;color:#b0a888;line-height:1.5;">Gem&auml;&szlig; &sect; 19 UStG (Kleinunternehmerregelung) wird keine Umsatzsteuer ausgewiesen.</td>
              </tr>
              `}
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#8a7d60;">Gesamtbetrag</td>
                <td style="padding:6px 0;font-size:16px;font-weight:700;color:#1a1505;">
                  ${options.invoice.payment_method === 'stripe' ? '<span style="color:#2a7cab;">✓ Online bezahlt</span> (0,00 &euro;)' : options.invoice.total.toFixed(2).replace('.', ',') + ' &euro;'}
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#8a7d60;">Zahlungsart</td>
                <td style="padding:6px 0;font-size:14px;color:#1a1505;">
                  ${options.invoice.payment_method === 'stripe' ? '<strong style="color:#2a7cab;">✓ Online bezahlt</strong>' : '<strong>Vor Ort bar</strong> oder per &Uuml;berweisung'}
                </td>
              </tr>
            </table>
            ${options.invoice.payment_method !== 'stripe' && options.invoice.company_iban ? `
            <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e0d9c0;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#1a1505;">Bankverbindung &mdash; Zahlung per &Uuml;berweisung</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#8a7d60;width:120px;">Empf&auml;nger</td>
                  <td style="padding:4px 0;font-size:13px;color:#1a1505;">${options.invoice.account_holder || options.invoice.company_name || companyName}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#8a7d60;">IBAN</td>
                  <td style="padding:4px 0;font-size:13px;color:#1a1505;font-family:monospace;letter-spacing:0.04em;">${options.invoice.company_iban}</td>
                </tr>
                ${options.invoice.company_bic ? `<tr>
                  <td style="padding:4px 0;font-size:13px;color:#8a7d60;">BIC</td>
                  <td style="padding:4px 0;font-size:13px;color:#1a1505;font-family:monospace;">${options.invoice.company_bic}</td>
                </tr>` : ''}
                ${options.invoice.bank_name ? `<tr>
                  <td style="padding:4px 0;font-size:13px;color:#8a7d60;">Bank</td>
                  <td style="padding:4px 0;font-size:13px;color:#1a1505;">${options.invoice.bank_name}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#8a7d60;">Verwendungszweck</td>
                  <td style="padding:4px 0;font-size:13px;color:#1a1505;font-weight:600;">${options.invoice.number}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#8a7d60;">Betrag</td>
                  <td style="padding:4px 0;font-size:13px;color:#1a1505;font-weight:700;">${options.invoice.total.toFixed(2).replace('.', ',')} &euro;</td>
                </tr>
              </table>
              ${options.invoice.qr_data ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
                <tr><td align="center" style="padding:8px 0;">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=0&data=${encodeURIComponent(options.invoice.qr_data)}" alt="SEPA-&Uuml;berweisung QR-Code" width="180" height="180" style="display:block;border:8px solid #ffffff;border-radius:8px;" />
                  <p style="margin:8px 0 0;font-size:12px;color:#8a7d60;line-height:1.5;max-width:320px;">Scanne diesen QR-Code mit der Online-Banking-App deiner Bank &mdash; die &Uuml;berweisung ist dann bereits ausgef&uuml;llt.</p>
                </td></tr>
              </table>` : ''}
              <p style="margin:10px 0 0;font-size:12px;color:#b0a888;line-height:1.5;">Alternativ kannst du den Betrag vor Ort in bar bezahlen.</p>
            </div>
            ` : ''}
          </td></tr>
        </table>
        ` : ''}
        <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#3d3520;">
          Im Anhang findest du eine <strong>Kalenderdatei (.ics)</strong>, die du direkt in deinen Kalender importieren kannst.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f0;border:1px solid #e0d9c0;border-radius:8px;margin:0 0 20px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#3d3520;">Stornierung</p>
            <p style="margin:0;font-size:13px;color:#8a7d60;line-height:1.6;">
              Eine kostenfreie Stornierung ist bis <strong>${options?.cancellationDays ?? 3} Tage vor dem Termin</strong> m&ouml;glich.
            </p>
            <p style="margin:10px 0 0;">
              <a href="https://backtobalance.online/preise#stornierung" style="display:inline-block;background:#2a7cab;color:#ffffff;text-decoration:none;padding:8px 20px;border-radius:6px;font-size:13px;font-weight:600;">Termin stornieren</a>
            </p>
            <p style="margin:10px 0 0;font-size:12px;color:#b0a888;line-height:1.5;">
              Deine Buchungs-ID: <strong style="font-family:monospace;color:#3d3520;">${appointment.id}</strong>
            </p>
          </td></tr>
        </table>
        <p style="margin:0;font-size:12px;color:#b0a888;line-height:1.6;">
          Mit deiner Buchung hast du unsere <a href="https://backtobalance.online/buchungsbedingungen" style="color:#2a7cab;">Buchungsbedingungen</a>
          und <a href="https://backtobalance.online/impressum#datenschutz" style="color:#2a7cab;">Datenschutzhinweise</a> akzeptiert.
        </p>
        <div style="margin-top:24px;padding:12px;background:#f0e8d8;border-left:3px solid #b61818;font-size:12px;color:#8a7d60;">
          <strong style="color:#b61818;">⚠ Automatische Nachricht — Bitte nicht antworten</strong><br>
          Diese E-Mail wurde automatisch versendet. Antworten auf diese E-Mail können nicht bearbeitet werden. Kontaktiere uns über <a href="https://backtobalance.online/kontakt" style="color:#2a7cab;">unser Kontaktformular</a>.
        </div>
      </td></tr>
      <tr><td style="padding:24px 40px;background-color:#f5f0e0;border-top:1px solid #e0d9c0;text-align:center;">
        <p style="margin:0;font-size:15px;color:#3d3520;">Wir freuen uns auf dich!</p>
        <p style="margin:8px 0 0;font-size:13px;color:#8a7d60;">${companyName} &mdash; Ganzheitliche K&ouml;rperarbeit</p>
        <p style="margin:4px 0 0;font-size:11px;color:#b0a888;">Hildastr. 12, 79102 Freiburg im Breisgau</p>
      </td></tr>
    </table>
  </td></tr>
</table>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${companyName} <kontakt@backtobalance.online>`,
      to: customer.email,
      subject: `Terminbestätigung${options?.serviceName ? ` — ${options.serviceName}` : ' — Körperarbeit'} — ${dateFormatted}, ${timePart} Uhr`,
      html: emailHtml,
      attachments: [{
        content: icsBase64,
        filename: `termin-${datePart}.ics`,
      }],
    }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// GET PAYMENT DETAILS — Zahlungsdaten + SEPA Info laden für Dialog
async function handleGetPaymentDetails(body: any) {
  const { appointment_id, company_id } = body;

  if (!appointment_id || !company_id) {
    return json({ error: "appointment_id und company_id erforderlich" }, 400);
  }

  try {
    // 1. Invoice für Termin laden
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, number, subtotal, tax_amount, tax_rate, total, vat_enabled, payment_method')
      .eq('appointment_id', appointment_id)
      .eq('company_id', company_id)
      .maybeSingle();

    if (invoiceError || !invoice) {
      return json({ error: "Rechnung nicht gefunden" }, 404);
    }

    // 2. Company SEPA Details laden
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('company_iban, company_bic, company_name, bank_name')
      .eq('id', company_id)
      .maybeSingle();

    if (companyError || !company) {
      return json({ error: "Unternehmen nicht gefunden" }, 404);
    }

    // 3. EPC QR Code Data generieren
    const epcData = [
      "BCD",
      "002",
      "1",
      "SCT",
      company.company_bic || "",
      company.company_iban || "",
      company.company_name || "Back to Balance",
      String(Math.round(invoice.total * 100)), // Amount in cents
      "EUR",
      "",
      invoice.number,
      "",
    ].join("\n");

    return json({
      invoice_number: invoice.number,
      total: invoice.total,
      subtotal: invoice.subtotal,
      tax_amount: invoice.tax_amount,
      tax_rate: invoice.tax_rate,
      vat_enabled: invoice.vat_enabled,
      payment_method: invoice.payment_method,
      company_name: company.company_name,
      company_iban: company.company_iban,
      company_bic: company.company_bic,
      bank_name: company.bank_name,
      qr_data: epcData,
    });
  } catch (err) {
    console.error("Get payment details error:", err);
    return json({ error: "Zahlungsdaten konnten nicht geladen werden" }, 500);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SEND PAYMENT REMINDER — Zahlungserinnerung mit QR Code erneut senden
async function handleSendPaymentReminder(body: any) {
  const { appointment_id, company_id, customer_email } = body;

  if (!appointment_id || !company_id || !customer_email) {
    return json({ error: "appointment_id, company_id, customer_email erforderlich" }, 400);
  }

  try {
    const brevoKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoKey) return json({ error: "E-Mail nicht konfiguriert" }, 500);

    // 1. Invoice und Company Daten laden
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('number, total, subtotal, tax_rate, vat_enabled')
      .eq('appointment_id', appointment_id)
      .eq('company_id', company_id)
      .maybeSingle();

    if (invoiceError || !invoice) {
      return json({ error: "Rechnung nicht gefunden" }, 404);
    }

    const { data: company } = await supabase
      .from('companies')
      .select('company_iban, company_bic, company_name, bank_name')
      .eq('id', company_id)
      .maybeSingle();

    const details = {
      invoice_number: invoice.number,
      total: invoice.total,
      company_name: company?.company_name || "Back to Balance",
      company_iban: company?.company_iban,
      company_bic: company?.company_bic,
      bank_name: company?.bank_name,
    };

    // 2. Company Info already loaded above
    const companyName = company?.company_name || "Back to Balance";

    // 3. Zahlungs-E-Mail zusammenstellen
    const emailHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; color: #3d3520; margin: 0; padding: 20px; background: #fff; }
    table { width: 100%; border-collapse: collapse; }
  </style>
</head>
<body>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e0;">
  <tr><td style="padding:40px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #e0d9c0;background:#fff;">
      <tr><td style="background:#f5f0e0;text-align:center;padding:28px 30px 20px;">
        <h1 style="margin:0;color:#b61818;font-size:24px;">Back to Balance</h1>
        <p style="margin:4px 0 0;color:#8fa942;font-size:15px;">Zahlungserinnerung</p>
      </td></tr>
      <tr><td style="padding:28px 40px;background:#fff;color:#3d3520;">
        <h2 style="margin:0 0 12px;font-size:18px;">Zahlungserinnerung</h2>
        <p style="font-size:14px;line-height:1.7;margin:0 0 20px;">
          Hallo,<br><br>wir möchten dich höflich erinnern, dass dein Termin bei <strong>${companyName}</strong>
          noch ausstehend ist. Bitte überweise den Betrag auf folgende Daten:
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e0;border-radius:8px;padding:16px;margin:0 0 20px;">
          <tr><td style="padding:8px 0;font-size:13px;"><strong style="color:#8a7d60;">Empfänger:</strong></td><td style="text-align:right;"><strong>${details.company_name}</strong></td></tr>
          <tr><td style="padding:8px 0;font-size:13px;"><strong style="color:#8a7d60;">IBAN:</strong></td><td style="text-align:right;font-family:monospace;">${details.company_iban}</td></tr>
          ${details.company_bic ? `<tr><td style="padding:8px 0;font-size:13px;"><strong style="color:#8a7d60;">BIC:</strong></td><td style="text-align:right;font-family:monospace;">${details.company_bic}</td></tr>` : ''}
          ${details.bank_name ? `<tr><td style="padding:8px 0;font-size:13px;"><strong style="color:#8a7d60;">Bank:</strong></td><td style="text-align:right;">${details.bank_name}</td></tr>` : ''}
          <tr style="border-top:1px solid #e0d9c0;"><td style="padding:8px 0;font-size:13px;font-weight:600;"><strong>Betrag:</strong></td><td style="text-align:right;font-size:16px;font-weight:700;color:#b61818;">${details.total.toFixed(2).replace('.', ',')} €</td></tr>
          <tr><td style="padding:8px 0;font-size:13px;"><strong style="color:#8a7d60;">Referenz:</strong></td><td style="text-align:right;font-family:monospace;"><strong>${details.invoice_number}</strong></td></tr>
        </table>
        <p style="font-size:13px;color:#8a7d60;line-height:1.6;margin:0;">
          <strong>ⓘ Hinweis:</strong> Den QR-Code zur schnellen SEPA-Überweisung findest du in deiner Buchungs-App.
          Du kannst ihn mit deiner Banking-App scannen oder als Screenshot hochladen.
        </p>
      </td></tr>
      <tr><td style="padding:24px 40px;background-color:#f5f0e0;border-top:1px solid #e0d9c0;text-align:center;">
        <p style="margin:0;font-size:13px;color:#8a7d60;">${companyName} &mdash; Ganzheitliche Körperarbeit</p>
        <p style="margin:4px 0 0;font-size:11px;color:#b0a888;">Hildastr. 12, 79102 Freiburg im Breisgau</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

    // 4. E-Mail senden
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": brevoKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: companyName, email: "kontakt@backtobalance.online" },
        to: [{ email: customer_email }],
        subject: `Zahlungserinnerung — Rechnungsnummer ${details.invoice_number}`,
        htmlContent: emailHtml,
      }),
    });

    return json({ success: true, message: "Zahlungserinnerung versendet" });
  } catch (err) {
    console.error("Send payment reminder error:", err);
    return json({ error: "Zahlungserinnerung konnte nicht versendet werden" }, 500);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// APPLY DISCOUNT — Rabatt auf Rechnung anwenden + E-Mail senden
async function handleApplyDiscount(body: any) {
  const { appointment_id, company_id, discount_percent, discount_amount, discount_reason, customer_email } = body;

  if (!appointment_id || !company_id) {
    return json({ error: "appointment_id und company_id erforderlich" }, 400);
  }

  try {
    // 1. Aktuelle Invoice laden
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, subtotal, tax_rate, vat_enabled, total, status')
      .eq('appointment_id', appointment_id)
      .eq('company_id', company_id)
      .maybeSingle();

    if (invoiceError || !invoice) {
      return json({ error: "Rechnung nicht gefunden" }, 404);
    }

    // 1.5. Check: Rabatte nur auf noch nicht bezahlten Rechnungen
    if (invoice.status === 'paid') {
      return json({
        error: "Rabatte können nicht auf bereits bezahlten Rechnungen angewendet werden. Bitte kontaktiere den Admin für Rückerstattungen."
      }, 400);
    }

    // 2. Rabattbetrag berechnen
    const discountValue = discount_percent
      ? Math.round(invoice.subtotal * (discount_percent / 100) * 100) / 100
      : (discount_amount || 0);

    const discountDesc = discount_reason ||
      (discount_percent ? `Rabatt ${discount_percent}%` : `Rabatt ${discountValue.toFixed(2)}€`);

    // 3. Negatives Zeilenitem einfügen
    await supabase
      .from('invoice_items')
      .insert({
        invoice_id: invoice.id,
        description: discountDesc,
        quantity: 1,
        unit_price: -discountValue,
        total: -discountValue,
      });

    // 4. Neue Gesamtsumme berechnen
    const { data: items } = await supabase
      .from('invoice_items')
      .select('total')
      .eq('invoice_id', invoice.id);

    const newSubtotal = (items || []).reduce((sum: number, item: any) => sum + item.total, 0);
    const newTaxAmount = invoice.vat_enabled
      ? Math.round(newSubtotal * (invoice.tax_rate / 100) * 100) / 100
      : 0;
    const newTotal = newSubtotal + newTaxAmount;

    // 5. Invoice aktualisieren
    await supabase
      .from('invoices')
      .update({
        subtotal: newSubtotal,
        tax_amount: newTaxAmount,
        total: newTotal,
        sent_at: new Date().toISOString(),
      })
      .eq('id', invoice.id);

    // 6. Zahlungserinnerung mit neuer Summe senden
    if (customer_email) {
      await handleSendPaymentReminder({
        appointment_id,
        company_id,
        customer_email,
      });
    }

    return json({
      success: true,
      message: "Rabatt angewendet und Rechnung versendet",
      new_total: newTotal,
      discount_applied: discountValue,
    });
  } catch (err) {
    console.error("Apply discount error:", err);
    return json({ error: "Rabatt konnte nicht angewendet werden" }, 500);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATE REFERRAL CODE — Check if referral code exists and return referrer info
async function handleValidateReferralCode(body: any) {
  const { code, company_id } = body;

  if (!code || !company_id) {
    return json({ error: "Code und company_id erforderlich" }, 400);
  }

  try {
    // Query for customer with this referral code
    const { data: referrer, error: queryError } = await supabase
      .from('customers')
      .select('id, name, referral_code')
      .eq('referral_code', code.toUpperCase().trim())
      .eq('company_id', company_id)
      .maybeSingle();

    if (queryError) {
      console.error("Referral code query error:", queryError);
      return json({ valid: false, error: "Fehler bei der Prüfung des Codes" }, 400);
    }

    if (!referrer) {
      return json({ valid: false, error: "Referral-Code nicht gefunden" }, 404);
    }

    return json({
      valid: true,
      referrer_name: referrer.name || 'Empfehler',
      referrer_id: referrer.id,
      code: referrer.referral_code,
    });
  } catch (err) {
    console.error("Validate referral code error:", err);
    return json({ valid: false, error: "Interner Fehler bei der Code-Prüfung" }, 500);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIRM PAYMENT — Marks invoice as paid and triggers accounting
// Called when:
//   - Admin sets appointment status to "bezahlt" in CalendarView
//   - Admin clicks "Als bezahlt markieren" in InvoicesTab
//   - (future) Bank-Webhook detects matching Verwendungszweck
// 🔗 BANK-API HOOK: This function is also called by bank-webhook/index.ts with source='bank_webhook'
async function handleConfirmPayment(body: any) {
  const { appointment_id, invoice_id, company_id, payment_method, payment_reference, confirmed_by, source } = body;

  if (!company_id) {
    return json({ error: "company_id erforderlich" }, 400);
  }

  try {
    // 1. Find invoice by appointment_id or invoice_id
    let invoiceQuery = supabase
      .from('invoices')
      .select('id, invoice_number, total, status')
      .eq('company_id', company_id);

    if (invoice_id) {
      invoiceQuery = invoiceQuery.eq('id', invoice_id);
    } else if (appointment_id) {
      invoiceQuery = invoiceQuery.eq('appointment_id', appointment_id);
    } else {
      return json({ error: "appointment_id oder invoice_id erforderlich" }, 400);
    }

    const { data: invoice, error: invoiceError } = await invoiceQuery.maybeSingle();

    if (invoiceError || !invoice) {
      // No invoice found — not an error (e.g. test booking or bundle booking)
      return json({ success: true, message: "Kein Rechnungseintrag gefunden — übersprungen", skipped: true });
    }

    if (invoice.status === 'paid') {
      return json({ success: true, message: "Rechnung bereits bezahlt", already_paid: true });
    }

    // Point 7: Idempotency — prevent double accounting
    const { data: existingConfirmation } = await supabase
      .from('payment_confirmations')
      .select('id, confirmed_at')
      .eq('invoice_id', invoice.id)
      .maybeSingle();

    if (existingConfirmation) {
      return json({
        success: true,
        message: 'Zahlung bereits bestätigt (idempotent)',
        already_confirmed: true,
        confirmed_at: existingConfirmation.confirmed_at,
        invoice_number: invoice.invoice_number,
      });
    }

    const now = new Date().toISOString();
    const paymentRef = payment_reference || invoice.invoice_number;
    const method = payment_method || 'bar';

    // 2. Update invoice status to paid
    await supabase.from('invoices').update({
      status: 'paid',
      payment_method: method,
      payment_date: now,
    }).eq('id', invoice.id);

    // 3. Insert payment_records (triggers accounting)
    await supabase.from('payment_records').insert({
      company_id,
      type: 'income',
      amount: invoice.total,
      description: `Rechnung ${invoice.invoice_number}`,
      payment_method: method,
      reference_type: 'invoice',
      reference_id: invoice.id,
      date: now.split('T')[0],
    });

    // 4. Audit trail in payment_confirmations
    // 🔗 BANK-API HOOK: source='bank_webhook' when called from bank-webhook edge function
    await supabase.from('payment_confirmations').insert({
      invoice_id: invoice.id,
      company_id,
      confirmed_by_name: confirmed_by || 'Manual',
      payment_method: method,
      payment_reference: paymentRef,
      amount: invoice.total,
      source: source || 'manual',
    });

    return json({
      success: true,
      message: "Zahlung bestätigt und Buchhaltung aktualisiert",
      invoice_number: invoice.invoice_number,
      amount: invoice.total,
    });
  } catch (err) {
    console.error("Confirm payment error:", err);
    return json({ error: "Zahlung konnte nicht bestätigt werden" }, 500);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SELF-REGISTRATION INVITE — Sends email to new customer after first booking
// with pre-filled link to /self-registration (DSGVO + health questionnaire)
async function sendSelfRegistrationInvite(
  customer: { name: string; email: string; phone?: string },
  company_id: string
) {
  const brevoKey = Deno.env.get("BREVO_API_KEY");
  if (!brevoKey || !customer.email) return;

  // Resolve practitioner ID from company (for the ?p= param in the link)
  const { data: company } = await supabase
    .from('companies')
    .select('user_id, name')
    .eq('id', company_id)
    .maybeSingle();

  const practitionerId = company?.user_id || '';
  const companyName = company?.name || 'Ihrer Praxis';
  const appUrl = Deno.env.get("PUBLIC_APP_URL") ?? "https://app.backtobalance.de";

  // Build pre-filled URL
  const nameParts = (customer.name || '').trim().split(' ');
  const fname = encodeURIComponent(nameParts[0] || '');
  const lname = encodeURIComponent(nameParts.slice(1).join(' ') || '');
  const email = encodeURIComponent(customer.email);
  const phone = encodeURIComponent(customer.phone || '');
  const registrationUrl = `${appUrl}/self-registration?p=${practitionerId}&role=klient&email=${email}&fname=${fname}&lname=${lname}${phone ? `&phone=${phone}` : ''}`;

  const html = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f0e0;font-family:'EB Garamond',Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e0;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff8e7;border-radius:12px;overflow:hidden;max-width:600px;">
        <tr><td style="background:#b61818;padding:28px 32px;">
          <h1 style="margin:0;font-size:22px;color:#fff;font-weight:600;letter-spacing:0.5px;">Back to Balance</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 16px;font-size:20px;color:#b61818;">Willkommen, ${customer.name}!</h2>
          <p style="color:#3a3020;font-size:15px;line-height:1.6;margin:0 0 16px;">
            Schön, dass Sie einen Termin bei ${companyName} gebucht haben.
          </p>
          <p style="color:#3a3020;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Damit wir Sie bestmöglich begleiten können, bitten wir Sie, <strong>vor Ihrem ersten Termin</strong>
            die kurze Selbstregistrierung auszufüllen. Das dauert nur wenige Minuten und hilft uns,
            Ihre Sitzung individuell vorzubereiten.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:8px 0 28px;">
              <a href="${registrationUrl}"
                 style="background:#b61818;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600;display:inline-block;">
                Selbstregistrierung ausfüllen →
              </a>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0e9b6;border-radius:8px;margin-bottom:24px;">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0;font-size:13px;color:#5a4a00;line-height:1.5;">
                <strong>Was Sie erwartet:</strong><br>
                • Persönliche Angaben (bereits vorausgefüllt)<br>
                • Kurzer Gesundheitsfragebogen<br>
                • DSGVO-Einwilligung zur Datenspeicherung<br>
                • Unterschrift &amp; Bestätigung
              </p>
            </td></tr>
          </table>
          <p style="color:#8a7d60;font-size:13px;line-height:1.5;margin:0;">
            Falls Sie Fragen haben, antworten Sie einfach auf diese E-Mail.<br>
            Wir freuen uns auf Ihren Besuch.
          </p>
        </td></tr>
        <tr><td style="background:#f0e9b6;padding:16px 32px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#8a7d60;">${companyName} · Back to Balance Genossenschaft</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": brevoKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: companyName, email: "noreply@backtobalance.de" },
      to: [{ email: customer.email, name: customer.name }],
      subject: `Selbstregistrierung – Ihr Termin bei ${companyName}`,
      htmlContent: html,
    }),
  });
}
