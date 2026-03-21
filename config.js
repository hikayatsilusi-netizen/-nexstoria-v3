/**
 * ============================================================
 *  NexStoria — config.js
 *  Konfigurasi pusat untuk semua servis & API
 *  
 *  ARAHAN:
 *  1. Isi nilai yang bertanda  <-- TUKAR INI
 *  2. Letakkan fail ini dalam folder root projek
 *  3. Load dalam setiap HTML page SEBELUM script lain:
 *     <script src="/config.js"></script>
 * ============================================================
 */

const NexStoriaConfig = {

  // ──────────────────────────────────────────────────────────
  // 🗄️  SUPABASE
  // Dapatkan dari: Supabase Dashboard → Project Settings → API
  // ──────────────────────────────────────────────────────────
  supabase: {
    url:     "https://lkeehgivbuhkwdfrvexm.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrZWVoZ2l2YnVoa3dkZnJ2ZXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDg3OTIsImV4cCI6MjA4ODQ4NDc5Mn0.DgNMgoRjNOJK4uh-74lrpkMqM9_fiJi2j81RxQzNx3s",
  },

  // ──────────────────────────────────────────────────────────
  // 🖼️  CLOUDINARY
  // Dapatkan cloudName dari: Cloudinary Dashboard → Home
  // uploadPreset: buat Unsigned Preset di Settings → Upload
  // ──────────────────────────────────────────────────────────
  cloudinary: {
    cloudName:    "dotejpjfv",
    uploadPreset: "nexstoria_unsigned",
  },

  // ──────────────────────────────────────────────────────────
  // 📧  RESEND (via Cloudflare Worker)
  // Selepas deploy Worker, salin URL Worker di sini
  // ──────────────────────────────────────────────────────────
  emailWorker: {
    url: "https://nexstoria-email-worker.nexstoria.workers.dev",
  },

  // ──────────────────────────────────────────────────────────
  // ⚙️  APP SETTINGS
  // ──────────────────────────────────────────────────────────
  app: {
    name:    "NexStoria",
    version: "1.0.0",
    env:     "production", // "development" atau "production"
    baseUrl: "https://nexstoria.com",
  },
};


// ============================================================
//  🔧 HELPERS — Sedia untuk guna terus dalam mana-mana page
// ============================================================

/**
 * SUPABASE CLIENT
 * Guna: const { data, error } = await DB.from('stories').select()
 */
const DB = window.supabase
  ? window.supabase.createClient(
      NexStoriaConfig.supabase.url,
      NexStoriaConfig.supabase.anonKey
    )
  : null;


/**
 * CLOUDINARY UPLOAD
 * Guna: const url = await uploadGambar(fileInput.files[0])
 * Return: URL gambar yang dah diupload, atau null kalau gagal
 */
async function uploadGambar(file, folder = "nexstoria") {
  const { cloudName, uploadPreset } = NexStoriaConfig.cloudinary;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();

    if (data.secure_url) {
      console.log("✅ Upload berjaya:", data.secure_url);
      return data.secure_url;
    } else {
      console.error("❌ Upload gagal:", data);
      return null;
    }
  } catch (err) {
    console.error("❌ Cloudinary error:", err);
    return null;
  }
}


/**
 * EMAIL HELPERS (via Cloudflare Worker → Resend)
 */
const Email = {

  /** Hantar email verification */
  async sendVerification(to, name, verificationUrl) {
    return await _callEmailWorker("/send-verification", { to, name, verificationUrl });
  },

  /** Hantar welcome email */
  async sendWelcome(to, name) {
    return await _callEmailWorker("/send-welcome", { to, name });
  },

  /** Hantar reset password email */
  async sendResetPassword(to, name, resetUrl) {
    return await _callEmailWorker("/send-reset-password", { to, name, resetUrl });
  },
};

async function _callEmailWorker(endpoint, payload) {
  const { url } = NexStoriaConfig.emailWorker;
  try {
    const res = await fetch(`${url}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error(`❌ Email gagal [${endpoint}]:`, data.error);
      return { success: false, error: data.error };
    }
    console.log(`✅ Email berjaya dihantar [${endpoint}]`);
    return { success: true, id: data.id };
  } catch (err) {
    console.error("❌ Email Worker error:", err);
    return { success: false, error: "Gagal sambung ke email server." };
  }
}


// ──────────────────────────────────────────────────────────
//  Expose globals
// ──────────────────────────────────────────────────────────
window.NexStoriaConfig = NexStoriaConfig;
window.DB             = DB;
window.uploadGambar   = uploadGambar;
window.Email          = Email;

// Log environment (buang dalam production kalau nak)
if (NexStoriaConfig.app.env === "development") {
  console.log("🚀 NexStoria Config loaded:", NexStoriaConfig.app);
}
