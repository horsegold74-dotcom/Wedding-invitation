/* ==========================================================================
   Michael & Raheel — Christian Wedding Invitation Interactive Engine
   Date: 23 / 11 / 2026 — 9:00 AM
   Venue: St. Mary's Church, Port Said (كنيسة السيدة العذراء مريم ببورسعيد)
   ========================================================================== */

(() => {
  'use strict';

  const WEDDING_CONFIG = {
    groomAr: 'مايكل',
    brideAr: 'رحيل',
    groomEn: 'Michael',
    brideEn: 'Raheel',
    isoDate: '2026-11-23T09:00:00+02:00',
    endIsoDate: '2026-11-23T12:00:00+02:00',
    mapsUrl: 'https://maps.app.goo.gl/Dx5ufvGqsqt8ftdJ8?g_st=ic',
    whatsappNumber: '201205729014', // 01205729014 in international format (Egypt +20)
    venueAr: 'كنيسة السيدة العذراء مريم ببورسعيد',
    venueEn: "St. Mary's Coptic Orthodox Church, Port Said",
    musicLoopStart: 0.25,
    musicLoopEnd: 25.15 // Loops the violin melody cleanly before the 26s reel outro beat
  };

  let currentLang = 'ar';
  let isMusicPlaying = false;
  let audioCtx = null;

  // DOM Elements
  const body = document.body;
  const envelopeOverlay = document.getElementById('envelope-overlay');
  const waxSealBtn = document.getElementById('wax-seal-btn');
  const replayEnvelopeBtn = document.getElementById('replay-envelope-btn');
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  const musicFab = document.getElementById('music-fab');
  const bgMusic = document.getElementById('bg-music');
  const revealAllDateBtn = document.getElementById('reveal-all-date-btn');
  const rsvpOpenBtn = document.getElementById('rsvp-open-btn');
  const rsvpModal = document.getElementById('rsvp-modal');
  const rsvpCloseBtn = document.getElementById('rsvp-close-btn');
  const rsvpForm = document.getElementById('rsvp-form');
  const wishesWall = document.getElementById('wishes-wall');
  const googleCalBtn = document.getElementById('google-cal-btn');
  const icsCalBtn = document.getElementById('ics-cal-btn');
  const copyMapBtn = document.getElementById('copy-map-btn');
  const toastEl = document.getElementById('luxury-toast');

  /* ========================================================================
     Web Audio Celestial Harp / Chime Sound Effects
     ======================================================================== */
  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }

  function playCelestialChime(notes = [523.25, 659.25, 783.99, 1046.5]) {
    try {
      initAudioContext();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.06, now + idx * 0.09 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 1.15);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 1.2);
      });
    } catch (_) {
      // Ignore audio context restrictions
    }
  }

  /* ========================================================================
     Background Romantic Violin Soundtrack (Clean Seamless Loop)
     ======================================================================== */
  if (bgMusic) {
    bgMusic.volume = 0.78;
    bgMusic.addEventListener('timeupdate', () => {
      if (bgMusic.currentTime >= WEDDING_CONFIG.musicLoopEnd) {
        bgMusic.currentTime = WEDDING_CONFIG.musicLoopStart;
        if (isMusicPlaying) {
          bgMusic.play().catch(() => {});
        }
      }
    });
  }

  function setMusicState(play) {
    if (!bgMusic) return;
    if (play) {
      if (bgMusic.currentTime >= WEDDING_CONFIG.musicLoopEnd || bgMusic.currentTime < 0.1) {
        bgMusic.currentTime = WEDDING_CONFIG.musicLoopStart;
      }
      bgMusic.play().then(() => {
        isMusicPlaying = true;
        updateMusicButtonUI();
      }).catch(() => {
        isMusicPlaying = false;
        updateMusicButtonUI();
      });
    } else {
      bgMusic.pause();
      isMusicPlaying = false;
      updateMusicButtonUI();
    }
  }

  function updateMusicButtonUI() {
    if (!musicFab) return;
    musicFab.classList.toggle('is-playing', isMusicPlaying);
    const pauseIcon = musicFab.querySelector('.icon-pause');
    const playIcon = musicFab.querySelector('.icon-play');
    if (pauseIcon && playIcon) {
      pauseIcon.style.display = isMusicPlaying ? 'block' : 'none';
      playIcon.style.display = isMusicPlaying ? 'none' : 'block';
    }
  }

  if (musicFab) {
    musicFab.addEventListener('click', (e) => {
      e.stopPropagation();
      setMusicState(!isMusicPlaying);
    });
  }

  /* ========================================================================
     1. Interactive 3D Envelope Opening & Replay
     ======================================================================== */
  let envelopeOpening = false;

  function openEnvelope() {
    if (envelopeOpening || !envelopeOverlay) return;
    envelopeOpening = true;

    playCelestialChime([523.25, 659.25, 783.99, 987.77, 1318.51]);
    setMusicState(true);

    // Burst golden sparkles from the center wax seal
    spawnBurstParticles(window.innerWidth / 2, window.innerHeight / 2, 34);

    envelopeOverlay.classList.add('is-opening');

    setTimeout(() => {
      body.classList.remove('envelope-locked');
      envelopeOverlay.classList.add('is-hidden');
    }, 1350);
  }

  function replayEnvelope() {
    if (!envelopeOverlay) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    envelopeOverlay.classList.remove('is-hidden', 'is-opening');
    body.classList.add('envelope-locked');
    envelopeOpening = false;
  }

  if (envelopeOverlay) {
    envelopeOverlay.addEventListener('click', openEnvelope);
  }
  if (waxSealBtn) {
    waxSealBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEnvelope();
    });
  }
  if (replayEnvelopeBtn) {
    replayEnvelopeBtn.addEventListener('click', replayEnvelope);
  }

  /* ========================================================================
     2. Interactive Scratch-to-Reveal Date Cards (23 | November | 2026)
     ======================================================================== */
  const scratchCanvases = Array.from(document.querySelectorAll('.scratch-canvas'));
  const scratchedState = new Map();

  function drawFoilCover(canvas) {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(Math.floor(rect.width), 95);
    const height = Math.max(Math.floor(rect.height), 110);

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.globalCompositeOperation = 'source-over';

    // Luxury Pearl & Champagne Gold Shimmer Gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#F7F0E4');
    grad.addColorStop(0.28, '#E5D3B3');
    grad.addColorStop(0.5, '#FBF7F0');
    grad.addColorStop(0.75, '#DEC69B');
    grad.addColorStop(1, '#F3E9D8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle metallic sheen diagonal lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 1;
    for (let i = -height; i < width + height; i += 12) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i - height, height);
      ctx.stroke();
    }

    // Inner ornamental frame on the scratch foil
    ctx.strokeStyle = 'rgba(182, 142, 68, 0.48)';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(7, 7, width - 14, height - 14);

    // Center Sparkle Star & Hint Text
    ctx.fillStyle = '#9A7836';
    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦', width / 2, height / 2 - 10);

    ctx.font = '600 11px Cairo, sans-serif';
    ctx.fillStyle = '#866830';
    const hintLabel = currentLang === 'ar' ? 'امسح هنا' : 'Scratch';
    ctx.fillText(hintLabel, width / 2, height / 2 + 10);

    ctx.restore();
    canvas.classList.remove('is-cleared');
    scratchedState.set(canvas, false);
  }

  function scratchAtPoint(canvas, clientX, clientY) {
    if (scratchedState.get(canvas)) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = canvas.width / rect.width;
    const x = (clientX - rect.left) * dpr;
    const y = (clientY - rect.top) * dpr;

    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    const radius = 22 * dpr;
    const radial = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius);
    radial.addColorStop(0, 'rgba(0,0,0,1)');
    radial.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Emit golden dust particle at finger/cursor
    spawnBurstParticles(clientX, clientY, 2);
  }

  function checkScratchCompletion(canvas) {
    if (scratchedState.get(canvas)) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    try {
      const data = ctx.getImageData(0, 0, width, height).data;
      let transparentPixels = 0;
      const step = 16; // sample every 4th pixel
      const totalSampled = Math.floor(data.length / step);

      for (let i = 3; i < data.length; i += step) {
        if (data[i] < 110) transparentPixels++;
      }

      const ratio = transparentPixels / totalSampled;
      if (ratio > 0.38) {
        revealCanvasCard(canvas);
      }
    } catch (_) {
      // Fallback if imageData restricted
    }
  }

  function revealCanvasCard(canvas) {
    if (scratchedState.get(canvas)) return;
    scratchedState.set(canvas, true);
    canvas.classList.add('is-cleared');
    const rect = canvas.getBoundingClientRect();
    spawnBurstParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 14);
    playCelestialChime([659.25, 880, 1046.5]);

    // Check if all 3 date cards are now revealed
    const allCleared = scratchCanvases.every((c) => scratchedState.get(c));
    if (allCleared && revealAllDateBtn) {
      revealAllDateBtn.textContent =
        currentLang === 'ar'
          ? '✦ ٢٣ نوفمبر ٢٠٢٦ • ٩:٠٠ صباحاً ✦'
          : '✦ 23 November 2026 • 9:00 AM ✦';
    }
  }

  function setupScratchCards() {
    scratchCanvases.forEach((canvas) => {
      drawFoilCover(canvas);
      let isDrawing = false;

      const onPointerDown = (e) => {
        isDrawing = true;
        const pt = e.touches ? e.touches[0] : e;
        scratchAtPoint(canvas, pt.clientX, pt.clientY);
      };

      const onPointerMove = (e) => {
        if (!isDrawing) return;
        if (e.cancelable) e.preventDefault();
        const pt = e.touches ? e.touches[0] : e;
        scratchAtPoint(canvas, pt.clientX, pt.clientY);
      };

      const onPointerUp = () => {
        if (!isDrawing) return;
        isDrawing = false;
        checkScratchCompletion(canvas);
      };

      canvas.addEventListener('mousedown', onPointerDown);
      canvas.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);

      canvas.addEventListener('touchstart', onPointerDown, { passive: true });
      canvas.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('touchend', onPointerUp);
    });
  }

  if (revealAllDateBtn) {
    revealAllDateBtn.addEventListener('click', () => {
      const allCleared = scratchCanvases.every((c) => scratchedState.get(c));
      if (allCleared) {
        // Reset scratch foil if user wants to scratch again!
        scratchCanvases.forEach((c) => drawFoilCover(c));
        revealAllDateBtn.textContent =
          currentLang === 'ar'
            ? '✦ اكشف التاريخ بالكامل ✦'
            : '✦ Reveal Full Date ✦';
      } else {
        scratchCanvases.forEach((c, idx) => {
          setTimeout(() => revealCanvasCard(c), idx * 160);
        });
      }
    });
  }

  /* ========================================================================
     3. Live Countdown to 23/11/2026 at 9:00 AM (Cairo Time +02:00)
     ======================================================================== */
  const elDays = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMinutes = document.getElementById('cd-minutes');
  const elSeconds = document.getElementById('cd-seconds');

  function updateCountdown() {
    const target = new Date(WEDDING_CONFIG.isoDate).getTime();
    const now = Date.now();
    const diff = Math.max(0, target - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if (elDays) elDays.textContent = String(days).padStart(2, '0');
    if (elHours) elHours.textContent = String(hours).padStart(2, '0');
    if (elMinutes) elMinutes.textContent = String(minutes).padStart(2, '0');
    if (elSeconds) elSeconds.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ========================================================================
     4. Calendar Integration (Google Calendar + .ICS Download)
     ======================================================================== */
  const eventTitle = 'صلاة إكليل وزفاف مايكل & رحيل | Michael & Raheel Wedding';
  const eventDetails =
    'نتشرف بحضوركم صلاة إكليل وزفاف مايكل ورحيل في كنيسة السيدة العذراء مريم ببورسعيد يوم الاثنين 23/11/2026 الساعة 9:00 صباحاً.\nLocation: ' +
    WEDDING_CONFIG.mapsUrl;
  const eventLocation = 'كنيسة السيدة العذراء مريم ببورسعيد - ' + WEDDING_CONFIG.mapsUrl;

  if (googleCalBtn) {
    // 2026-11-23 09:00:00+02:00 is 20261123T070000Z in UTC
    const gCalUrl = new URL('https://calendar.google.com/calendar/render');
    gCalUrl.searchParams.set('action', 'TEMPLATE');
    gCalUrl.searchParams.set('text', eventTitle);
    gCalUrl.searchParams.set('dates', '20261123T070000Z/20261123T100000Z');
    gCalUrl.searchParams.set('details', eventDetails);
    gCalUrl.searchParams.set('location', eventLocation);
    googleCalBtn.href = gCalUrl.toString();
  }

  if (icsCalBtn) {
    icsCalBtn.addEventListener('click', () => {
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Michael & Raheel Wedding//AR',
        'BEGIN:VEVENT',
        'UID:michael-raheel-20261123@wedding',
        'DTSTAMP:20261112T000000Z',
        'DTSTART:20261123T070000Z',
        'DTEND:20261123T100000Z',
        `SUMMARY:${eventTitle}`,
        `DESCRIPTION:${eventDetails.replace(/\n/g, '\\n')}`,
        `LOCATION:${eventLocation}`,
        `URL:${WEDDING_CONFIG.mapsUrl}`,
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Michael-and-Raheel-Wedding-2026-11-23.ics';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(
        currentLang === 'ar'
          ? 'تم تحميل موعد الإكليل لإضافته للتقويم ✦'
          : 'Wedding calendar invite downloaded ✦'
      );
    });
  }

  if (copyMapBtn) {
    copyMapBtn.addEventListener('click', () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(WEDDING_CONFIG.mapsUrl).then(() => {
          showToast(
            currentLang === 'ar'
              ? 'تم نسخ رابط موقع الكنيسة بنجاح ✦'
              : 'Church location link copied ✦'
          );
        });
      }
    });
  }

  /* ========================================================================
     5. Slide-up RSVP Modal & Persistent Blessings Wall (00:23 - 00:25)
     ======================================================================== */
  const STORAGE_KEY = 'michael_raheel_wedding_wishes_v1';

  const defaultWishes = [
    {
      name: 'العائلة والأحباء',
      attending: 'yes',
      guests: 4,
      message: 'ألف مبروك يا مايكل ويا رحيل! ربنا يبارك إكليلكم ويملأ بيتكم سلام وفرح وبركة بشفاعة العذراء مريم 🤍✞'
    },
    {
      name: 'أصدقاء العروسين',
      attending: 'yes',
      guests: 2,
      message: 'فرحتنا بيكم مالهاش حدود! زيجة مباركة وسعيدة بنعمة ربنا، مستنيين نفرح بيكم يوم ٢٣ نوفمبر!'
    }
  ];

  function loadWishes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultWishes;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : defaultWishes;
    } catch (_) {
      return defaultWishes;
    }
  }

  function saveWishes(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (_) {}
  }

  function renderWishes() {
    if (!wishesWall) return;
    const wishes = loadWishes();
    wishesWall.innerHTML = '';

    wishes.slice(0, 6).forEach((item) => {
      const card = document.createElement('div');
      card.className = 'wish-item';

      const statusText =
        item.attending === 'yes'
          ? currentLang === 'ar'
            ? `سيحضر (${item.guests || 1}) 🤍`
            : `Attending (${item.guests || 1}) 🤍`
          : currentLang === 'ar'
          ? 'تهنئة محبة 💐'
          : 'Warm Wishes 💐';

      card.innerHTML = `
        <div class="wish-item-header">
          <span class="wish-author">✞ ${escapeHtml(item.name)}</span>
          <span class="wish-status-badge">${escapeHtml(statusText)}</span>
        </div>
        <p class="wish-text">${escapeHtml(item.message)}</p>
      `;
      wishesWall.appendChild(card);
    });
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function openRsvpModal() {
    if (!rsvpModal) return;
    rsvpModal.classList.add('is-open');
    rsvpModal.setAttribute('aria-hidden', 'false');
  }

  function closeRsvpModal() {
    if (!rsvpModal) return;
    rsvpModal.classList.remove('is-open');
    rsvpModal.setAttribute('aria-hidden', 'true');
  }

  if (rsvpOpenBtn) rsvpOpenBtn.addEventListener('click', openRsvpModal);
  if (rsvpCloseBtn) rsvpCloseBtn.addEventListener('click', closeRsvpModal);
  if (rsvpModal) {
    rsvpModal.addEventListener('click', (e) => {
      if (e.target === rsvpModal) closeRsvpModal();
    });
  }

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('rsvp-name');
      const guestsInput = document.getElementById('rsvp-guests');
      const messageInput = document.getElementById('rsvp-message');
      const attendingRadio = rsvpForm.querySelector('input[name="attending"]:checked');

      const name = (nameInput?.value || '').trim();
      if (!name) return;

      const attending = attendingRadio ? attendingRadio.value : 'yes';
      const guests = parseInt(guestsInput?.value || '1', 10) || 1;
      const message =
        (messageInput?.value || '').trim() ||
        (currentLang === 'ar'
          ? 'ألف مبروك للعروسين مايكل ورحيل! إكليل مبارك بنعمة الرب 🤍'
          : 'Congratulations Michael & Raheel! Wishing you a blessed marriage 🤍');

      const currentList = loadWishes();
      currentList.unshift({ name, attending, guests, message });
      saveWishes(currentList);
      renderWishes();

      // Build the WhatsApp RSVP message and open a chat with the couple
      const attendanceLine =
        attending === 'yes'
          ? `نعم، سأحضر بإذن الله 🤍 (عدد الحضور: ${guests})`
          : 'للأسف لن أتمكن من الحضور 💐';
      const waText = [
        '✞ تأكيد حضور زفاف مايكل & رحيل ✞',
        '📅 الاثنين 23/11/2026 • 9:00 صباحاً',
        '⛪ كنيسة السيدة العذراء مريم ببورسعيد',
        '',
        `👤 الاسم: ${name}`,
        `✅ الحضور: ${attendanceLine}`,
        '',
        `💌 التهنئة: ${message}`
      ].join('\n');
      const waUrl = `https://wa.me/${WEDDING_CONFIG.whatsappNumber}?text=${encodeURIComponent(waText)}`;
      const waWindow = window.open(waUrl, '_blank');
      if (!waWindow) {
        window.location.href = waUrl;
      }

      playCelestialChime([523.25, 659.25, 783.99, 1046.5, 1318.51]);
      spawnBurstParticles(window.innerWidth / 2, window.innerHeight * 0.65, 28);

      rsvpForm.reset();
      closeRsvpModal();
      showToast(
        currentLang === 'ar'
          ? `شكراً يا ${name}! اضغط "إرسال" في واتساب لتصل رسالتك للعروسين 🤍`
          : `Thank you ${name}! Tap "Send" in WhatsApp to deliver your RSVP 🤍`
      );
    });
  }

  renderWishes();

  /* ========================================================================
     6. Bilingual Language Toggle (AR / EN)
     ======================================================================== */
  function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-ar][data-en]').forEach((el) => {
      el.textContent = lang === 'ar' ? el.getAttribute('data-ar') : el.getAttribute('data-en');
    });

    document.querySelectorAll('[data-placeholder-ar][data-placeholder-en]').forEach((el) => {
      el.placeholder =
        lang === 'ar'
          ? el.getAttribute('data-placeholder-ar')
          : el.getAttribute('data-placeholder-en');
    });

    if (langToggleBtn) {
      langToggleBtn.textContent = lang === 'ar' ? 'EN ✦ العربية' : 'عربي ✦ EN';
    }

    // Redraw un-scratched canvases so hint text matches language
    scratchCanvases.forEach((canvas) => {
      if (!scratchedState.get(canvas)) {
        drawFoilCover(canvas);
      }
    });

    renderWishes();
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      setLanguage(currentLang === 'ar' ? 'en' : 'ar');
    });
  }

  /* ========================================================================
     7. Scroll Reveal Observer & Toast Helper
     ======================================================================== */
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3600);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    },
    { threshold: 0.14 }
  );

  document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el));

  /* ========================================================================
     8. Ambient & Interactive Golden Dust Sparkle Particle Engine
     ======================================================================== */
  const sparkleCanvas = document.getElementById('sparkles-canvas');
  const particles = [];

  function resizeSparkleCanvas() {
    if (!sparkleCanvas) return;
    sparkleCanvas.width = window.innerWidth;
    sparkleCanvas.height = window.innerHeight;
  }

  function spawnBurstParticles(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.6 + Math.random() * 3.2;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.6,
        size: 1.5 + Math.random() * 2.8,
        alpha: 0.95,
        decay: 0.014 + Math.random() * 0.015,
        color: Math.random() > 0.35 ? '#E2BD6B' : '#FFFDF7'
      });
    }
  }

  // Ambient floating dust motes
  for (let i = 0; i < 18; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -0.2 - Math.random() * 0.35,
      size: 1.2 + Math.random() * 2,
      alpha: 0.25 + Math.random() * 0.45,
      ambient: true,
      color: '#DFB968'
    });
  }

  function animateSparkles() {
    if (sparkleCanvas) {
      const ctx = sparkleCanvas.getContext('2d');
      ctx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.ambient) {
          if (p.y < -10) p.y = sparkleCanvas.height + 10;
          if (p.x < -10) p.x = sparkleCanvas.width + 10;
          if (p.x > sparkleCanvas.width + 10) p.x = -10;
        } else {
          p.alpha -= p.decay;
          if (p.alpha <= 0.02) {
            particles.splice(i, 1);
            continue;
          }
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = '#E6C373';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    requestAnimationFrame(animateSparkles);
  }

  window.addEventListener('resize', () => {
    resizeSparkleCanvas();
  });

  window.addEventListener('DOMContentLoaded', () => {
    resizeSparkleCanvas();
    setupScratchCards();
    animateSparkles();
  });

  // Ensure scratch cards initialize even if DOMContentLoaded already fired
  if (document.readyState !== 'loading') {
    resizeSparkleCanvas();
    setTimeout(setupScratchCards, 80);
  }
})();

