// Supabase Edge Function: send-writer-email
// Deploy: supabase functions deploy send-writer-email
// Panggil dari admin page selepas lulus/tolak permohonan penulis

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_EMAIL = "NexStoria <noreply@nexstoria.pages.dev>";

// ── Template Emel Kelulusan ────────────────────────────────────────────────
function templateLulus(name: string): string {
  return `<!DOCTYPE html>
<html lang="ms">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f4ff;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;padding:32px 16px;">
<tr><td align="center">
<table width="540" cellpadding="0" cellspacing="0" style="max-width:540px;width:100%;">
  <tr>
    <td style="background:linear-gradient(135deg,#0d1f0d,#1b6927,#0d1f0d);border-radius:20px 20px 0 0;padding:36px 32px;text-align:center;">
      <div style="font-size:44px;margin-bottom:10px;">🎉</div>
      <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 8px;">Tahniah! Kamu Kini Penulis NexStoria!</h1>
      <p style="color:rgba(255,255,255,0.65);font-size:13px;margin:0;">Permohonan kamu telah diluluskan ✅</p>
    </td>
  </tr>
  <tr>
    <td style="background:#fff;padding:32px;">
      <p style="color:#1a1a2e;font-size:15px;line-height:1.7;margin:0 0 20px;">
        Hai <strong>${name}</strong> 👋,<br><br>
        Kami dengan gembiranya memaklumkan bahawa permohonan kamu untuk menjadi <strong>Penulis NexStoria</strong> telah <strong style="color:#16a34a;">diluluskan</strong>! 🥳<br><br>
        Akaun kamu kini telah ditingkatkan. Kamu boleh mula menulis, menerbitkan cerita, dan berkongsi imaginasi kamu dengan pembaca dari seluruh dunia.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="https://nexstoria.pages.dev/nexstoria-author-profile.html"
           style="display:inline-block;background:linear-gradient(135deg,#4ade80,#16a34a);color:#fff;text-decoration:none;font-size:15px;font-weight:800;padding:14px 44px;border-radius:14px;box-shadow:0 6px 20px rgba(22,163,74,0.35);">
          ✍️ &nbsp;Mula Menulis Sekarang →
        </a>
      </div>
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="text-align:center;padding:0 6px;">
            <div style="background:#f0fdf4;border-radius:12px;padding:14px 10px;">
              <div style="font-size:20px;">📖</div>
              <div style="font-size:12px;font-weight:800;color:#065f46;margin-top:6px;">Terbit Cerita</div>
            </div>
          </td>
          <td style="text-align:center;padding:0 6px;">
            <div style="background:#fefce8;border-radius:12px;padding:14px 10px;">
              <div style="font-size:20px;">⭐</div>
              <div style="font-size:12px;font-weight:800;color:#92400e;margin-top:6px;">Terima Bintang</div>
            </div>
          </td>
          <td style="text-align:center;padding:0 6px;">
            <div style="background:#eff6ff;border-radius:12px;padding:14px 10px;">
              <div style="font-size:20px;">🤖</div>
              <div style="font-size:12px;font-weight:800;color:#1e40af;margin-top:6px;">AI Terjemahan</div>
            </div>
          </td>
        </tr>
      </table>
      <div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:0 10px 10px 0;padding:14px 16px;margin-top:24px;">
        <p style="color:#065f46;font-size:12px;font-weight:700;margin:0 0 4px;">💡 Tips Permulaan</p>
        <p style="color:#374151;font-size:12px;line-height:1.6;margin:0;">Log masuk ke profil penulis kamu dan lengkapkan nama pena. Kemudian, mulakan cerita pertama dari Dashboard Penulis!</p>
      </div>
    </td>
  </tr>
  <tr>
    <td style="background:#0d0d1f;border-radius:0 0 20px 20px;padding:20px 32px;text-align:center;">
      <p style="color:rgba(255,255,255,0.35);font-size:11px;margin:0;line-height:1.6;">
        <a href="https://nexstoria.pages.dev" style="color:#4ade80;text-decoration:none;">nexstoria.pages.dev</a>
        &nbsp;·&nbsp; Jika ini adalah kesilapan, hubungi pasukan kami.
      </p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// ── Template Emel Penolakan ────────────────────────────────────────────────
function templateTolak(name: string): string {
  return `<!DOCTYPE html>
<html lang="ms">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f4ff;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;padding:32px 16px;">
<tr><td align="center">
<table width="540" cellpadding="0" cellspacing="0" style="max-width:540px;width:100%;">
  <tr>
    <td style="background:linear-gradient(135deg,#0d0d1f,#2d1b69,#0d0d1f);border-radius:20px 20px 0 0;padding:36px 32px;text-align:center;">
      <div style="font-size:44px;margin-bottom:10px;">📋</div>
      <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 8px;">Kemas Kini Permohonan Penulis</h1>
      <p style="color:rgba(255,255,255,0.65);font-size:13px;margin:0;">Maklumat penting mengenai permohonan kamu</p>
    </td>
  </tr>
  <tr>
    <td style="background:#fff;padding:32px;">
      <p style="color:#1a1a2e;font-size:15px;line-height:1.7;margin:0 0 20px;">
        Hai <strong>${name}</strong> 👋,<br><br>
        Terima kasih kerana berminat untuk menjadi Penulis NexStoria. Setelah semakan oleh pasukan kami, kami tidak dapat meluluskan permohonan kamu <strong>pada masa ini</strong>.
      </p>
      <div style="background:#fef9f0;border:1.5px solid #fcd34d;border-radius:12px;padding:18px 20px;margin-bottom:24px;">
        <p style="color:#92400e;font-size:13px;font-weight:700;margin:0 0 8px;">📌 Ini bukan penolakan kekal</p>
        <p style="color:#374151;font-size:13px;line-height:1.6;margin:0;">
          Kamu <strong>boleh memohon semula</strong> selepas 30 hari dengan portfolio yang lebih kukuh.
        </p>
      </div>
      <div style="text-align:center;margin:20px 0 0;">
        <a href="https://nexstoria.pages.dev/nexstoria-explore.html"
           style="display:inline-block;background:linear-gradient(135deg,#a78bfa,#7c3aed);color:#fff;text-decoration:none;font-size:14px;font-weight:800;padding:13px 36px;border-radius:14px;box-shadow:0 6px 20px rgba(124,58,237,0.3);">
          📖 &nbsp;Terus Meneroka Cerita →
        </a>
      </div>
    </td>
  </tr>
  <tr>
    <td style="background:#0d0d1f;border-radius:0 0 20px 20px;padding:20px 32px;text-align:center;">
      <p style="color:rgba(255,255,255,0.35);font-size:11px;margin:0;line-height:1.6;">
        <a href="https://nexstoria.pages.dev" style="color:#a78bfa;text-decoration:none;">nexstoria.pages.dev</a>
        &nbsp;·&nbsp; Soalan? Hubungi kami di support@nexstoria.pages.dev
      </p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// ── Handler Utama ──────────────────────────────────────────────────────────
serve(async (req) => {
  // CORS untuk panggilan dari browser
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { type, email, name } = await req.json();
    // type: "approved" | "rejected"
    // email: emel penerima
    // name: nama pengguna

    if (!type || !email || !name) {
      return new Response(
        JSON.stringify({ error: "type, email dan name diperlukan" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const isApproved = type === "approved";
    const subject = isApproved
      ? "🎉 Tahniah! Permohonan Penulis NexStoria Diluluskan!"
      : "📋 Kemas Kini Permohonan Penulis NexStoria";
    const html = isApproved ? templateLulus(name) : templateTolak(name);

    // Hantar melalui Resend API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend API error: ${err}`);
    }

    const data = await res.json();
    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
