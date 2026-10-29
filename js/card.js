/**
 * Public NFC Digital Business Card Controller
 * Handles dynamic rendering, click tracking, vCard download,
 * Exchange Contact lead capture, and QR Code sharing.
 */
(function(global) {
  function renderCard(targetElement, isPreviewMode) {
    const root = targetElement || document.getElementById('cardApp');
    if (!root) return;

    const data = CardStore.getData();
    const p = data.profile || {};
    const c = data.contact || {};
    const l = data.links || [];
    const s = data.services || [];
    const pf = data.portfolio || [];
    const th = data.theme || {};
    const set = data.settings || {};

    // Apply active theme to document body
    if (document.body && !isPreviewMode) {
      document.body.setAttribute('data-theme', th.themeId || 'obsidian');
      if (th.accentColor) {
        document.documentElement.style.setProperty('--accent-primary', th.accentColor);
      }
    }

    // Build Quick Contact icons
    const quickActionsHtml = `
      <div class="quick-contact-bar">
        ${c.phone ? `
          <a href="tel:${c.phone}" class="quick-action-item" title="Call">
            <div class="quick-action-icon">${Icons.get('phone', '', 20)}</div>
            <span>Call</span>
          </a>
        ` : ''}
        ${c.email ? `
          <a href="mailto:${c.email}" class="quick-action-item" title="Email">
            <div class="quick-action-icon">${Icons.get('mail', '', 20)}</div>
            <span>Email</span>
          </a>
        ` : ''}
        ${c.whatsapp ? `
          <a href="${c.whatsapp.startsWith('http') ? c.whatsapp : 'https://wa.me/' + c.whatsapp.replace(/[^0-9]/g, '')}" target="_blank" rel="noopener noreferrer" class="quick-action-item" title="WhatsApp">
            <div class="quick-action-icon">${Icons.get('whatsapp', '', 20)}</div>
            <span>WhatsApp</span>
          </a>
        ` : ''}
        ${c.address ? `
          <a href="https://maps.google.com/?q=${encodeURIComponent(c.address)}" target="_blank" rel="noopener noreferrer" class="quick-action-item" title="Office Location">
            <div class="quick-action-icon">${Icons.get('mapPin', '', 20)}</div>
            <span>Office</span>
          </a>
        ` : ''}
        ${c.website ? `
          <a href="${c.website}" target="_blank" rel="noopener noreferrer" class="quick-action-item" title="Website">
            <div class="quick-action-icon">${Icons.get('website', '', 20)}</div>
            <span>Site</span>
          </a>
        ` : ''}
      </div>
    `;

    // Build Links list
    const activeLinks = l.filter(item => item.active !== false);
    const linksHtml = activeLinks.length > 0 ? `
      <div class="card-section">
        <div class="section-title-wrap">
          <span class="card-section-title">
            ${Icons.get('link', '', 16)} Links & Channels
          </span>
          <span class="badge badge-subtle" style="font-size: 0.685rem;">${activeLinks.length} Items</span>
        </div>
        <div class="links-list">
          ${activeLinks.map(item => `
            <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="link-card ${item.highlight ? 'highlighted' : ''}" data-link-id="${item.id}">
              <div class="link-left">
                <div class="link-icon-box" style="color: ${item.color || 'var(--accent-primary)'};">
                  ${Icons.get(item.icon || 'link', '', 22)}
                </div>
                <div class="link-texts">
                  <div class="link-title">${escapeHtml(item.title)}</div>
                  ${item.subtitle ? `<div class="link-subtitle">${escapeHtml(item.subtitle)}</div>` : ''}
                </div>
              </div>
              <div class="link-arrow">
                ${Icons.get('arrowUpRight', '', 18)}
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    ` : '';

    // Build Services section
    const servicesHtml = (set.showServices !== false && s && s.length > 0) ? `
      <div class="card-section">
        <div class="section-title-wrap">
          <span class="card-section-title">
            ${Icons.get('sparkles', '', 16)} Services & Advisory
          </span>
        </div>
        <div class="services-list">
          ${s.map(srv => `
            <div class="service-card">
              <div class="service-header">
                <span class="service-title">${escapeHtml(srv.title)}</span>
                ${srv.price ? `<span class="service-price">${escapeHtml(srv.price)}</span>` : ''}
              </div>
              ${srv.description ? `<p class="service-desc">${escapeHtml(srv.description)}</p>` : ''}
              ${srv.badge ? `<span class="badge badge-accent" style="font-size: 0.65rem;">${escapeHtml(srv.badge)}</span>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    // Build Portfolio section
    const portfolioHtml = (set.showPortfolio !== false && pf && pf.length > 0) ? `
      <div class="card-section">
        <div class="section-title-wrap">
          <span class="card-section-title">
            ${Icons.get('briefcase', '', 16)} Featured Work
          </span>
        </div>
        <div class="portfolio-grid">
          ${pf.map(item => `
            <a href="${item.link || '#'}" target="_blank" rel="noopener noreferrer" class="portfolio-card">
              ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" class="portfolio-card-img" loading="lazy" />` : ''}
              <div class="portfolio-content">
                ${item.category ? `<div class="portfolio-tag">${escapeHtml(item.category)}</div>` : ''}
                <div class="portfolio-name">${escapeHtml(item.title)}</div>
                ${item.description ? `<p class="portfolio-desc">${escapeHtml(item.description)}</p>` : ''}
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    ` : '';

    // Render full HTML
    root.innerHTML = `
      <div class="card-container" id="cardContainerInner">
        <!-- Simulated NFC Tap Dynamic Island Banner -->
        <div class="nfc-tap-banner" id="nfcTapBanner">
          <div class="nfc-banner-icon">
            ${Icons.get('nfc', '', 20)}
          </div>
          <div class="nfc-banner-texts">
            <div class="nfc-banner-title">
              <span>NFC Tag Detected</span>
              <span class="badge badge-accent" style="font-size: 0.6rem; padding: 0.15rem 0.4rem;">NTAG216</span>
            </div>
            <div class="nfc-banner-subtitle">${escapeHtml(p.name || 'Alexander Vance')} &bull; ${escapeHtml(p.nfcId || 'NFC-8849-VANC')}</div>
          </div>
        </div>

        <!-- Top Bar -->
        <div class="card-topbar">
          <div class="nfc-status-pill" id="btnPillSimulateNfc" style="cursor: pointer;" title="Click to Simulate NFC Tap">
            <span class="nfc-pulse-dot"></span>
            <span>${escapeHtml(p.nfcId || 'NFC-ACTIVE')}</span>
          </div>
          <div class="topbar-actions">
            <button class="topbar-btn" id="btnSimulateNfcTop" title="Simulate Contactless NFC Tap">
              ${Icons.get('nfc', '', 16)}
            </button>
            <button class="topbar-btn" id="btnCycleThemeTop" title="Switch Theme Preset">
              ${Icons.get('sparkles', '', 16)}
            </button>
            <button class="topbar-btn" id="btnTopShare" title="Share Digital Card">
              ${Icons.get('share', '', 16)}
            </button>
            <button class="topbar-btn" id="btnTopQr" title="Show QR Code">
              ${Icons.get('qrCode', '', 16)}
            </button>
          </div>
        </div>

        <!-- Cover Banner -->
        <div class="card-cover" style="background-image: url('${escapeHtml(p.cover || '')}');"></div>

        <!-- Header Profile Body -->
        <div class="card-header-body">
          <div class="avatar-wrapper">
            <img src="${escapeHtml(p.avatar || '')}" alt="${escapeHtml(p.name)}" class="avatar-img" />
            ${p.verified !== false ? `
              <div class="verified-badge" title="Verified Digital NFC Profile">
                ${Icons.get('check', '', 14)}
              </div>
            ` : ''}
          </div>

          ${p.statusBadge ? `
            <div class="status-badge-pill">
              <span>${escapeHtml(p.statusBadge)}</span>
            </div>
          ` : ''}

          <h1 class="profile-name">
            <span>${escapeHtml(p.name || 'Alexander Vance')}</span>
            ${p.pronouns ? `<span class="pronouns-tag">${escapeHtml(p.pronouns)}</span>` : ''}
          </h1>

          <div class="profile-title">${escapeHtml(p.title || '')}</div>
          ${p.company ? `<div class="profile-company">${escapeHtml(p.company)}</div>` : ''}
          ${p.location ? `
            <div class="profile-location">
              ${Icons.get('mapPin', '', 14)} ${escapeHtml(p.location)}
            </div>
          ` : ''}

          ${p.bio ? `<div class="profile-bio">${escapeHtml(p.bio)}</div>` : ''}

          <!-- Primary Actions (Save Contact, Exchange, Share) -->
          <div class="card-primary-actions">
            <button class="btn btn-primary btn-save-contact" id="btnSaveContact">
              ${Icons.get('download', '', 18)} Save to Contacts (.vcf)
            </button>
            <button class="btn btn-secondary btn-exchange" id="btnExchangeContact">
              ${Icons.get('userPlus', '', 16)} Exchange Info
            </button>
            <button class="btn btn-secondary btn-share-card" id="btnShareModal">
              ${Icons.get('share', '', 16)} Share Card
            </button>
          </div>

          <!-- Quick Action Icons -->
          ${quickActionsHtml}
        </div>

        <!-- Links List -->
        ${linksHtml}

        <!-- Services -->
        ${servicesHtml}

        <!-- Portfolio -->
        ${portfolioHtml}

        <!-- Footer -->
        <div class="card-footer">
          <div class="footer-branding">
            ${Icons.get('nfc', '', 16)} Powered by <strong>TapCard NFC</strong>
          </div>
          <div class="footer-controls">
            <button class="btn-pill-action" id="btnFooterSimulateNfc">
              ${Icons.get('nfc', '', 13)} Simulate NFC Tap
            </button>
            <button class="btn-pill-action" id="btnFooterTheme">
              ${Icons.get('sparkles', '', 13)} Switch Theme
            </button>
            <button class="btn-pill-action" id="btnFooterSound" title="Toggle audio effects">
              <span id="soundIconSpan">${Icons.get('zap', '', 13)}</span>
              <span id="soundTextSpan">Sound On</span>
            </button>
            <a href="admin.html" class="admin-lock-link" title="Open Admin Panel">
              ${Icons.get('lock', '', 13)} Admin Suite
            </a>
          </div>
        </div>
      </div>
    `;

    // Attach Event Listeners
    attachCardEvents(root, data);
  }

  function triggerNfcSimulation(root, data) {
    if (global.SoundFx) SoundFx.nfcChime();

    // Create ripple effect
    const container = root.querySelector('#cardContainerInner') || root;
    const rippleWrap = document.createElement('div');
    rippleWrap.className = 'nfc-ripple-overlay';
    rippleWrap.innerHTML = `
      <div class="nfc-ripple-ring"></div>
      <div class="nfc-ripple-ring"></div>
      <div class="nfc-ripple-ring"></div>
    `;
    container.appendChild(rippleWrap);
    setTimeout(() => rippleWrap.remove(), 1600);

    // Show dynamic island banner
    const banner = root.querySelector('#nfcTapBanner');
    if (banner) {
      banner.classList.add('show');
      setTimeout(() => {
        banner.classList.remove('show');
      }, 3500);
    }

    showToast('📡 Contactless NFC Card Tapped! Profile loaded.');
  }

  function cycleThemePreset() {
    if (global.SoundFx) SoundFx.tap();
    const themes = ['obsidian', 'champagne', 'aurora', 'cyber', 'crimson', 'minimal'];
    const currentTheme = CardStore.getData().theme.themeId || 'obsidian';
    const nextIdx = (themes.indexOf(currentTheme) + 1) % themes.length;
    const nextTheme = themes[nextIdx];
    CardStore.updateTheme({ themeId: nextTheme });
    document.body.setAttribute('data-theme', nextTheme);
    showToast(`🎨 Theme changed to ${nextTheme.toUpperCase()}`);
  }

  function attachCardEvents(root, data) {
    // 0. NFC Simulation Taps
    const btnSimTop = root.querySelector('#btnSimulateNfcTop');
    const btnSimPill = root.querySelector('#btnPillSimulateNfc');
    const btnSimFooter = root.querySelector('#btnFooterSimulateNfc');
    const handleSim = () => triggerNfcSimulation(root, data);

    if (btnSimTop) btnSimTop.addEventListener('click', handleSim);
    if (btnSimPill) btnSimPill.addEventListener('click', handleSim);
    if (btnSimFooter) btnSimFooter.addEventListener('click', handleSim);

    // Theme Switchers
    const btnThemeTop = root.querySelector('#btnCycleThemeTop');
    const btnThemeFooter = root.querySelector('#btnFooterTheme');
    if (btnThemeTop) btnThemeTop.addEventListener('click', cycleThemePreset);
    if (btnThemeFooter) btnThemeFooter.addEventListener('click', cycleThemePreset);

    // Sound toggle
    const btnSound = root.querySelector('#btnFooterSound');
    if (btnSound && global.SoundFx) {
      btnSound.addEventListener('click', () => {
        const isMuted = SoundFx.toggleMute();
        const textSpan = root.querySelector('#soundTextSpan');
        if (textSpan) textSpan.textContent = isMuted ? 'Sound Off' : 'Sound On';
        if (!isMuted) SoundFx.tap();
        showToast(isMuted ? '🔇 Audio feedback muted' : '🔊 Audio feedback active');
      });
    }

    // 1. Save Contact (.vcf)
    const btnSave = root.querySelector('#btnSaveContact');
    if (btnSave) {
      btnSave.addEventListener('click', (e) => {
        e.preventDefault();
        if (global.SoundFx) SoundFx.success();
        CardStore.trackVCardDownload();
        VCard.download(data.profile, data.contact, data.links);
        showToast('📇 Contact card (.vcf) downloaded to your phone!');
      });
    }

    // 2. Exchange Contact (Lead modal)
    const btnExchange = root.querySelector('#btnExchangeContact');
    if (btnExchange) {
      btnExchange.addEventListener('click', () => {
        if (global.SoundFx) SoundFx.tap();
        openLeadModal();
      });
    }

    // 3. Share & QR Modals
    const btnShare = root.querySelector('#btnShareModal');
    const btnTopShare = root.querySelector('#btnTopShare');
    const btnTopQr = root.querySelector('#btnTopQr');

    const handleShareClick = () => {
      if (global.SoundFx) SoundFx.tap();
      openShareModal(data);
    };

    if (btnShare) btnShare.addEventListener('click', handleShareClick);
    if (btnTopShare) btnTopShare.addEventListener('click', handleShareClick);
    if (btnTopQr) btnTopQr.addEventListener('click', handleShareClick);

    // 4. Link clicks tracking & tactile sound
    root.querySelectorAll('.link-card').forEach(card => {
      card.addEventListener('click', () => {
        if (global.SoundFx) SoundFx.tap();
        const linkId = card.getAttribute('data-link-id');
        if (linkId) CardStore.trackLinkClick(linkId);
      });
    });

    root.querySelectorAll('.quick-action-item').forEach(item => {
      item.addEventListener('click', () => {
        if (global.SoundFx) SoundFx.tap();
      });
    });
  }

  // Lead Capture Modal
  function openLeadModal() {
    let modalBackdrop = document.getElementById('leadModalBackdrop');
    if (!modalBackdrop) {
      modalBackdrop = document.createElement('div');
      modalBackdrop.id = 'leadModalBackdrop';
      modalBackdrop.className = 'modal-backdrop';
      modalBackdrop.innerHTML = `
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title">🤝 Exchange Contact</h3>
            <button class="modal-close-btn" id="btnCloseLeadModal">&times;</button>
          </div>
          <p style="font-size: 0.885rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
            Send your contact details directly to Alexander's verified inbox so you can connect.
          </p>
          <form id="leadCaptureForm">
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <input type="text" class="form-input" id="leadName" placeholder="e.g. Sarah Jenkins" required />
            </div>
            <div class="form-group">
              <label class="form-label">Email Address *</label>
              <input type="email" class="form-input" id="leadEmail" placeholder="sarah@company.com" required />
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input type="tel" class="form-input" id="leadPhone" placeholder="+1 (555) 000-0000" />
            </div>
            <div class="form-group">
              <label class="form-label">Company / Organization</label>
              <input type="text" class="form-input" id="leadCompany" placeholder="e.g. Acme Corp" />
            </div>
            <div class="form-group">
              <label class="form-label">Quick Note / Reason for Connecting</label>
              <textarea class="form-textarea" id="leadNote" placeholder="Great meeting you at the conference! Let's chat next week."></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.85rem; margin-top: 0.5rem;">
              Send My Contact Info
            </button>
          </form>
        </div>
      `;
      document.body.appendChild(modalBackdrop);

      // Close events
      modalBackdrop.querySelector('#btnCloseLeadModal').addEventListener('click', () => {
        modalBackdrop.classList.remove('active');
      });
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) modalBackdrop.classList.remove('active');
      });

      // Submit
      modalBackdrop.querySelector('#leadCaptureForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = modalBackdrop.querySelector('#leadName').value.trim();
        const email = modalBackdrop.querySelector('#leadEmail').value.trim();
        const phone = modalBackdrop.querySelector('#leadPhone').value.trim();
        const company = modalBackdrop.querySelector('#leadCompany').value.trim();
        const note = modalBackdrop.querySelector('#leadNote').value.trim();

        CardStore.addLead({ name, email, phone, company, note });
        if (global.SoundFx) SoundFx.success();
        modalBackdrop.classList.remove('active');
        modalBackdrop.querySelector('#leadCaptureForm').reset();
        showToast('✅ Your contact info has been sent successfully!');
      });
    }

    modalBackdrop.classList.add('active');
  }

  // Share & QR Modal
  function openShareModal(data) {
    let shareBackdrop = document.getElementById('shareModalBackdrop');
    if (!shareBackdrop) {
      shareBackdrop = document.createElement('div');
      shareBackdrop.id = 'shareModalBackdrop';
      shareBackdrop.className = 'modal-backdrop';
      document.body.appendChild(shareBackdrop);
    }

    // Determine current public URL for this card
    const storeData = (typeof CardStore !== 'undefined' && CardStore.getData) ? CardStore.getData() : {};
    const savedPermalink = storeData.qrConfig && storeData.qrConfig.permalinkUrl;
    const cardUrl = (savedPermalink && !savedPermalink.startsWith('null'))
      ? savedPermalink
      : (window.location.origin && window.location.origin !== 'null')
        ? window.location.origin + window.location.pathname.replace('admin.html', 'card.html').replace('index.html', 'card.html')
        : window.location.href.replace('admin.html', 'card.html').replace('index.html', 'card.html');
    const qrSvg = QRCode.renderSVG({
      text: cardUrl,
      size: 200,
      darkColor: '#0a0d14',
      lightColor: '#ffffff',
      rounded: true
    });

    shareBackdrop.innerHTML = `
      <div class="modal-container" style="text-align: center;">
        <div class="modal-header">
          <h3 class="modal-title">📲 Share NFC Digital Card</h3>
          <button class="modal-close-btn" id="btnCloseShareModal">&times;</button>
        </div>
        <p style="font-size: 0.885rem; color: var(--text-secondary); margin-bottom: 1rem;">
          Anyone can scan this QR code with their camera or tap their phone against your physical NFC tag.
        </p>

        <!-- QR Code Display Box -->
        <div class="qr-container-box">
          <div class="qr-code-svg-wrap">
            ${qrSvg}
          </div>
        </div>

        <!-- URL Copy Box -->
        <div class="qr-nfc-url-box">
          <div class="qr-nfc-url-text">${escapeHtml(cardUrl)}</div>
          <button class="btn btn-sm btn-primary" id="btnCopyShareUrl">
            ${Icons.get('copy', '', 14)} Copy
          </button>
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: center;">
          <button class="btn btn-secondary btn-sm" id="btnDownloadQrCode">
            ${Icons.get('download', '', 14)} Save QR Image
          </button>
          <button class="btn btn-secondary btn-sm" id="btnNativeShare">
            ${Icons.get('share', '', 14)} Send Link...
          </button>
        </div>
      </div>
    `;

    shareBackdrop.classList.add('active');

    // Close event
    shareBackdrop.querySelector('#btnCloseShareModal').addEventListener('click', () => {
      shareBackdrop.classList.remove('active');
    });
    shareBackdrop.addEventListener('click', (e) => {
      if (e.target === shareBackdrop) shareBackdrop.classList.remove('active');
    });

    // Copy URL
    shareBackdrop.querySelector('#btnCopyShareUrl').addEventListener('click', () => {
      navigator.clipboard.writeText(cardUrl).then(() => {
        showToast('🔗 Card URL copied to clipboard!');
      });
    });

    // Native Share
    shareBackdrop.querySelector('#btnNativeShare').addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: data.profile.name + ' - Digital Business Card',
          text: `Connect with ${data.profile.name} (${data.profile.title})`,
          url: cardUrl
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(cardUrl).then(() => {
          showToast('🔗 Link copied to clipboard!');
        });
      }
    });

    // Download QR Code as Image
    shareBackdrop.querySelector('#btnDownloadQrCode').addEventListener('click', () => {
      const canvas = document.createElement('canvas');
      QRCode.renderCanvas(canvas, {
        text: cardUrl,
        size: 800,
        darkColor: '#0a0d14',
        lightColor: '#ffffff',
        includeNfcIcon: true
      });
      const link = document.createElement('a');
      link.download = `nfc_card_qr_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('📥 High-res QR code image downloaded!');
    });
  }

  // Toast Notification Helper
  function showToast(message) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span class="toast-icon">${Icons.get('sparkles', '', 18)}</span>
      <span>${escapeHtml(message)}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 20);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ── Helper: Normalize URL to ensure valid protocol ──
  function normalizeUrl(url) {
    if (!url) return '';
    let clean = String(url).trim();
    if (!clean) return '';
    if (clean.startsWith('//')) {
      return 'https:' + clean;
    }
    if (!/^https?:\/\//i.test(clean) && !/^mailto:/i.test(clean) && !/^tel:/i.test(clean)) {
      clean = 'https://' + clean;
    }
    return clean;
  }

  // ── Helper: Execute animated redirect with fallback overlay ──
  function executeSmartRedirect(targetUrl, sourceLabel) {
    try {
      const overlay = document.createElement('div');
      overlay.id = 'smartRedirectOverlay';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:999999;background:#08090d;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding:1.5rem;text-align:center;box-sizing:border-box;';
      overlay.innerHTML = `
        <div style="width:48px;height:48px;border:3px solid rgba(16,185,129,0.2);border-top-color:#10b981;border-radius:50%;animation:qrSpin 0.7s linear infinite;margin-bottom:1.25rem;"></div>
        <style>@keyframes qrSpin{to{transform:rotate(360deg)}}</style>
        <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:#10b981;font-weight:700;margin-bottom:0.4rem;">🔗 Smart QR Redirect</div>
        <h3 style="margin:0 0 0.5rem;font-size:1.15rem;font-weight:600;">Forwarding to destination...</h3>
        <p style="color:#94a3b8;font-size:0.85rem;max-width:340px;word-break:break-all;margin:0 0 1.25rem;line-height:1.4;">${escapeHtml(targetUrl)}</p>
        <a href="${escapeHtml(targetUrl)}" id="btnManualRedirect" style="display:inline-block;padding:0.6rem 1.4rem;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);border-radius:9999px;color:#fff;text-decoration:none;font-size:0.85rem;font-weight:500;">Tap here if not redirected</a>
        <div style="margin-top:1.5rem;">
          <a href="${window.location.pathname}?preview=true" style="color:#64748b;font-size:0.75rem;text-decoration:underline;">Cancel & View NFC Card</a>
        </div>
      `;
      document.body.appendChild(overlay);
    } catch(e) {}

    setTimeout(() => {
      try {
        window.location.replace(targetUrl);
      } catch(e) {
        window.location.href = targetUrl;
      }
    }, 150);
  }

  // ── Smart QR Redirect check ──
  // Called once on card.html load.
  // Supports universal query parameter redirect (?r= or ?redirect= or ?to=),
  // as well as local store redirect configuration.
  function checkSmartQrRedirect() {
    try {
      const urlParams = new URLSearchParams(window.location.search);

      // Bypass redirect if preview/editor/noredirect flag is present
      if (urlParams.get('preview') === 'true' || urlParams.get('noredirect') === '1' || urlParams.get('edit') === 'true') {
        return false;
      }

      // Priority 1: Check URL query parameter (e.g. card.html?r=https://example.com)
      // This works universally across ANY mobile phone, tablet, or external scanner!
      const paramRedirect = urlParams.get('r') || urlParams.get('redirect') || urlParams.get('to');
      if (paramRedirect && paramRedirect.trim()) {
        const targetUrl = normalizeUrl(paramRedirect);
        executeSmartRedirect(targetUrl, 'URL Parameter');
        return true;
      }

      // Priority 2: Check locally configured redirect in CardStore
      if (typeof CardStore !== 'undefined' && CardStore.getData) {
        const data = CardStore.getData();
        const qc   = data.qrConfig || {};
        if (qc.redirectEnabled && qc.redirectDest && qc.redirectDest.trim()) {
          const targetUrl = normalizeUrl(qc.redirectDest);
          executeSmartRedirect(targetUrl, 'Store Config');
          return true; // redirect fired
        }
      }
    } catch(e) {
      console.warn('Smart redirect check encountered an error:', e);
    }
    return false;
  }

  global.CardApp = {
    render: renderCard,
    showToast: showToast,
    openLeadModal: openLeadModal,
    openShareModal: openShareModal,
    checkSmartQrRedirect: checkSmartQrRedirect,
    normalizeUrl: normalizeUrl
  };
})(typeof window !== "undefined" ? window : this);
