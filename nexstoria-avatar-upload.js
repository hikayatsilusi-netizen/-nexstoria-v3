/* ══════════════════════════════════════════════════════
   NexStoria — Avatar Upload via Cloudinary
   Salin kod ini ke bahagian <script> dalam:
   - nexstoria-author-profile.html
   - nexstoria-reader-profile.html
   
   Gantikan CLOUD_NAME dengan cloud name Cloudinary anda
   ══════════════════════════════════════════════════════ */

// ── KONFIGURASI CLOUDINARY ──
const CLOUDINARY_CLOUD_NAME = 'dotejpjfv'; // ← Ganti dengan cloud name anda
const CLOUDINARY_UPLOAD_PRESET = 'nexstoria_unsigned'; // Preset yang digunakan dalam config.js

// ── BUKA MODAL AVATAR ──
function openAvatarModal() {
  // Bina modal jika belum ada
  if (!document.getElementById('avatar-upload-modal')) {
    buildAvatarModal();
  }
  document.getElementById('avatar-upload-modal').classList.add('open');
}

function closeAvatarModal() {
  const modal = document.getElementById('avatar-upload-modal');
  if (modal) modal.classList.remove('open');
  // Reset state
  const preview = document.getElementById('avu-preview');
  const dropArea = document.getElementById('avu-drop');
  if (preview) preview.style.display = 'none';
  if (dropArea) dropArea.style.display = 'flex';
  const input = document.getElementById('avu-file-input');
  if (input) input.value = '';
}

// ── BINA HTML MODAL ──
function buildAvatarModal() {
  const modal = document.createElement('div');
  modal.id = 'avatar-upload-modal';
  modal.style.cssText = `
    position:fixed;inset:0;z-index:9000;
    background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);
    display:none;align-items:center;justify-content:center;padding:20px;
  `;
  modal.classList.add('avatar-modal-overlay');

  modal.innerHTML = `
    <div style="
      background:white;border-radius:28px;width:100%;max-width:380px;
      padding:28px 24px;box-shadow:0 24px 60px rgba(0,0,0,0.25);
      animation:avuSlideIn 0.35s cubic-bezier(.175,.885,.32,1.275);
      position:relative;
    ">
      <style>
        #avatar-upload-modal.open { display:flex; }
        @keyframes avuSlideIn {
          from { opacity:0; transform:translateY(20px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .avu-drop-area {
          border:2.5px dashed #e2e8f7;border-radius:18px;
          padding:32px 20px;display:flex;flex-direction:column;
          align-items:center;gap:10px;cursor:pointer;transition:.25s;
          background:#f8faff;text-align:center;
        }
        .avu-drop-area:hover, .avu-drop-area.drag {
          border-color:#38bdf8;background:#e0f2fe;
        }
        .avu-preview-wrap {
          display:none;flex-direction:column;align-items:center;gap:14px;
        }
        .avu-preview-img {
          width:120px;height:120px;border-radius:50%;
          object-fit:cover;border:4px solid #e2e8f7;
          box-shadow:0 8px 24px rgba(0,0,0,0.12);
        }
        .avu-progress {
          width:100%;height:6px;border-radius:3px;
          background:#e2e8f7;overflow:hidden;margin-top:4px;display:none;
        }
        .avu-progress-fill {
          height:100%;border-radius:3px;width:0%;transition:width .3s;
          background:linear-gradient(90deg,#38bdf8,#a78bfa);
        }
        .avu-btn-save {
          width:100%;padding:13px;border-radius:14px;border:none;
          background:linear-gradient(135deg,#a78bfa,#7c3aed);
          color:white;font-family:'Nunito',sans-serif;font-size:14px;
          font-weight:800;cursor:pointer;transition:.2s;margin-top:4px;
          display:flex;align-items:center;justify-content:center;gap:8px;
        }
        .avu-btn-save:hover { transform:translateY(-2px);box-shadow:0 8px 24px rgba(124,58,237,.35); }
        .avu-btn-save:disabled { opacity:.5;pointer-events:none; }
        .avu-btn-cancel {
          width:100%;padding:11px;border-radius:14px;
          background:#f8faff;border:1.5px solid #e2e8f7;
          color:#6b7a9e;font-family:'Nunito',sans-serif;font-size:13px;
          font-weight:800;cursor:pointer;margin-top:8px;transition:.2s;
        }
        .avu-btn-cancel:hover { border-color:#38bdf8;color:#0284c7; }
        .avu-error {
          font-size:12px;font-weight:700;color:#ff4757;
          text-align:center;margin-top:4px;display:none;
        }
        .avu-rules {
          font-size:11px;color:#94a3b8;text-align:center;
          line-height:1.6;margin-top:8px;
        }
      </style>

      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
        <div style="font-family:'Baloo 2',cursive;font-size:1.1rem;font-weight:800;color:#1a1a2e;">
          📷 Tukar Gambar Profil
        </div>
        <button onclick="closeAvatarModal()" style="
          background:#f1f5f9;border:none;border-radius:50%;
          width:32px;height:32px;cursor:pointer;font-size:16px;
          display:flex;align-items:center;justify-content:center;
        ">✕</button>
      </div>

      <!-- Drop area -->
      <div class="avu-drop-area" id="avu-drop"
        onclick="document.getElementById('avu-file-input').click()"
        ondragover="event.preventDefault();this.classList.add('drag')"
        ondragleave="this.classList.remove('drag')"
        ondrop="event.preventDefault();this.classList.remove('drag');handleAvatarDrop(event)">
        <div style="font-size:2.5rem;">🖼️</div>
        <div style="font-family:'Baloo 2',cursive;font-size:.95rem;font-weight:800;color:#1a1a2e;">
          Pilih atau seret gambar
        </div>
        <div style="font-size:11px;color:#94a3b8;">JPG, PNG, WebP · Maksimum 5MB</div>
        <input type="file" id="avu-file-input" accept="image/jpeg,image/png,image/webp"
          style="display:none" onchange="handleAvatarFile(event)">
      </div>

      <!-- Preview -->
      <div class="avu-preview-wrap" id="avu-preview">
        <img id="avu-preview-img" class="avu-preview-img" src="" alt="Preview">
        <div style="font-size:12px;font-weight:700;color:#059669;" id="avu-preview-label">
          ✅ Gambar sedia untuk dimuat naik
        </div>
        <div class="avu-progress" id="avu-progress">
          <div class="avu-progress-fill" id="avu-progress-fill"></div>
        </div>
      </div>

      <div class="avu-error" id="avu-error"></div>

      <div class="avu-rules">
        🔒 Gambar anda disimpan dengan selamat<br>
        Hanya anda yang boleh menukar gambar profil
      </div>

      <button class="avu-btn-save" id="avu-btn-save" onclick="uploadAvatarToCloudinary()" style="display:none;">
        <span>☁️</span> Simpan Gambar Profil
      </button>
      <button class="avu-btn-cancel" onclick="closeAvatarModal()">Batal</button>
    </div>
  `;

  document.body.appendChild(modal);
}

// ── HANDLE FILE DROP ──
function handleAvatarDrop(e) {
  const file = e.dataTransfer.files[0];
  if (file) processAvatarFile(file);
}

function handleAvatarFile(e) {
  const file = e.target.files[0];
  if (file) processAvatarFile(file);
}

function processAvatarFile(file) {
  const errEl = document.getElementById('avu-error');
  errEl.style.display = 'none';

  // Validate jenis
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) {
    errEl.textContent = '❌ Format tidak disokong. Sila gunakan JPG, PNG, atau WebP.';
    errEl.style.display = 'block';
    return;
  }

  // Validate saiz (5MB)
  if (file.size > 5 * 1024 * 1024) {
    errEl.textContent = '❌ Gambar terlalu besar. Had maksimum: 5MB.';
    errEl.style.display = 'block';
    return;
  }

  // Tunjuk preview
  const reader = new FileReader();
  reader.onload = (ev) => {
    document.getElementById('avu-preview-img').src = ev.target.result;
    document.getElementById('avu-drop').style.display = 'none';
    document.getElementById('avu-preview').style.display = 'flex';
    document.getElementById('avu-btn-save').style.display = 'flex';
    // Simpan file untuk upload
    window._avatarFileToUpload = file;
  };
  reader.readAsDataURL(file);
}

// ── UPLOAD KE CLOUDINARY ──
async function uploadAvatarToCloudinary() {
  const file = window._avatarFileToUpload;
  if (!file) return;

  if (!CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME') {
    document.getElementById('avu-error').textContent = '⚠️ Sila tetapkan CLOUDINARY_CLOUD_NAME dalam kod.';
    document.getElementById('avu-error').style.display = 'block';
    return;
  }

  const btn = document.getElementById('avu-btn-save');
  const progressWrap = document.getElementById('avu-progress');
  const progressFill = document.getElementById('avu-progress-fill');
  const label = document.getElementById('avu-preview-label');
  const errEl = document.getElementById('avu-error');

  btn.disabled = true;
  btn.innerHTML = '<span>⏳</span> Memuat naik…';
  progressWrap.style.display = 'block';
  errEl.style.display = 'none';

  try {
    // Compress gambar sebelum upload
    const compressedBlob = await compressAvatarImage(file);

    // Bina FormData untuk Cloudinary
    const formData = new FormData();
    formData.append('file', compressedBlob);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'nexstoria/avatars');
    // Transformasi automatik — crop muka, 400x400
    formData.append('transformation', 'w_400,h_400,c_fill,g_face,q_auto,f_auto');

    // Upload dengan progress tracking via XHR
    const cloudUrl = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 85);
          progressFill.style.width = pct + '%';
          label.textContent = `⬆️ Memuat naik… ${pct}%`;
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          resolve(data.secure_url);
        } else {
          reject(new Error('Upload gagal: ' + xhr.status));
        }
      };
      xhr.onerror = () => reject(new Error('Masalah sambungan internet'));
      xhr.send(formData);
    });

    progressFill.style.width = '95%';
    label.textContent = '💾 Menyimpan ke profil…';

    // Simpan URL ke Supabase via RPC (backend validate URL)
    const { data: result, error } = await sb.rpc('update_avatar_url', {
      p_url: cloudUrl,
    });

    if (error || !result?.ok) {
      throw new Error(result?.error || error?.message || 'Gagal menyimpan');
    }

    progressFill.style.width = '100%';
    label.textContent = '✅ Gambar profil berjaya dikemaskini!';
    label.style.color = '#059669';

    // Kemaskini semua elemen avatar dalam halaman
    refreshAvatarDisplay(cloudUrl);

    setTimeout(() => closeAvatarModal(), 1500);

  } catch (err) {
    errEl.textContent = '❌ ' + (err.message || 'Gagal memuat naik. Cuba lagi.');
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.innerHTML = '<span>☁️</span> Cuba Lagi';
    progressWrap.style.display = 'none';
  }
}

// ── COMPRESS GAMBAR SEBELUM UPLOAD ──
function compressAvatarImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const MAX = 800;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        const scale = Math.min(MAX / width, MAX / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => resolve(blob || file),
        'image/jpeg',
        0.88
      );
    };
    img.src = url;
  });
}

// ── KEMASKINI PAPARAN AVATAR DI HALAMAN ──
function refreshAvatarDisplay(newUrl) {
  // Kemaskini semua img tag yang ada avatar
  document.querySelectorAll(
    '.writer-avatar img, .reader-avatar img, .nav-avatar img, [id*="avatar"] img'
  ).forEach(img => { img.src = newUrl; });

  // Untuk avatar yang guna initial/emoji — tukar ke gambar
  ['writer-avatar-el', 'reader-avatar-el', 'nav-avatar-icon'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    let img = el.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit;position:absolute;inset:0;';
      el.appendChild(img);
    }
    img.src = newUrl;
  });
}
