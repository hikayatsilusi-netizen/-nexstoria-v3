/**
 * ============================================================
 *  NexStoria — config.js
 *  Konfigurasi pusat untuk semua servis & API
 * ============================================================
 */

const NexStoriaConfig = {
  supabase: {
    url:     "https://lkeehgivbuhkwdfrvexm.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrZWVoZ2l2YnVoa3dkZnJ2ZXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDg3OTIsImV4cCI6MjA4ODQ4NDc5Mn0.DgNMgoRjNOJK4uh-74lrpkMqM9_fiJi2j81RxQzNx3s",
  },
  cloudinary: {
    cloudName:    "dotejpjfv",
    uploadPreset: "nexstoria_unsigned",
  },
  emailWorker: {
    url: "https://nexstoria-email-worker.nexstoria.workers.dev",
  },
  app: {
    name:    "NexStoria",
    version: "1.0.0",
    env:     "production",
    baseUrl: "https://nexstoria.com",
  },
};

// ── Supabase Client (selamat dari race condition) ──
let DB = null;
function _initDB() {
  if (typeof window === 'undefined') return null;
  if (window.supabase && window.supabase.createClient) {
    return window.supabase.createClient(
      NexStoriaConfig.supabase.url,
      NexStoriaConfig.supabase.anonKey
    );
  }
  return null;
}
// Cuba init terus, kalau gagal retry bila DOMContentLoaded
DB = _initDB();
if (!DB) {
  document.addEventListener('DOMContentLoaded', function() {
    DB = _initDB();
    window.DB = DB;
  });
}

// ── Cloudinary Upload ──
async function uploadGambar(file, folder) {
  folder = folder || "nexstoria";
  var cloudName    = NexStoriaConfig.cloudinary.cloudName;
  var uploadPreset = NexStoriaConfig.cloudinary.uploadPreset;
  var formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);
  try {
    var res  = await fetch("https://api.cloudinary.com/v1_1/" + cloudName + "/image/upload", { method: "POST", body: formData });
    var data = await res.json();
    if (data.secure_url) return data.secure_url;
    console.error("Upload gagal:", data);
    return null;
  } catch(err) {
    console.error("Cloudinary error:", err);
    return null;
  }
}

// ── Email Helpers (via Cloudflare Worker) ──
var Email = {
  sendVerification: function(to, name, verificationUrl) {
    return _callEmailWorker("/send-verification", { to: to, name: name, verificationUrl: verificationUrl });
  },
  sendWelcome: function(to, name) {
    return _callEmailWorker("/send-welcome", { to: to, name: name });
  },
  sendResetPassword: function(to, name, resetUrl) {
    return _callEmailWorker("/send-reset-password", { to: to, name: name, resetUrl: resetUrl });
  }
};

async function _callEmailWorker(endpoint, payload) {
  var url = NexStoriaConfig.emailWorker.url;
  try {
    var res  = await fetch(url + endpoint, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload)
    });
    var data = await res.json();
    if (!res.ok) {
      console.error("Email gagal [" + endpoint + "]:", data.error);
      return { success: false, error: data.error };
    }
    return { success: true, id: data.id };
  } catch(err) {
    console.error("Email Worker error:", err);
    return { success: false, error: "Gagal sambung ke email server." };
  }
}

// ── Expose globals ──
window.NexStoriaConfig = NexStoriaConfig;
window.DB              = DB;
window.uploadGambar    = uploadGambar;
window.Email           = Email;
