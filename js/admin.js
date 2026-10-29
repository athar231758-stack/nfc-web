/**
 * Master Admin Management Suite Controller
 * Full CRUD, real-time live preview synchronization,
 * drag-and-drop reordering, leads CRM, and NFC QR Studio.
 */
(function(global) {
  // Preset Avatars for instant one-click selection
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80'
  ];

  // Preset Covers for instant one-click selection
  const coverPresets = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618005182062-8418ff240c92?auto=format&fit=crop&w=1200&q=80'
  ];

  let currentTab = 'profile';

  function initAdmin() {
    renderSidebarNav();
    bindTabEvents();
    populateFormFields();
    renderLinksList();
    renderServicesList();
    renderPortfolioList();
    renderLeadsTable();
    renderAnalytics();
    renderThemePicker();
    renderNfcStudio();
    setupLivePreview();
    setupPresets();
    setupMobileDrawer();
    setupFileUploads();

    // Subscribe to store updates to keep UI synced
    CardStore.subscribe((data, action) => {
      if (action !== 'input_keystroke') {
        populateFormFields();
        renderLinksList();
        renderServicesList();
        renderPortfolioList();
        renderLeadsTable();
        renderAnalytics();
      }
      updatePreviewPhone();
    });

    updatePreviewPhone();
  }

  // Render Navigation Items with Icons
  function renderSidebarNav() {
    const navItems = [
      { id: 'profile', label: 'Profile & Bio', icon: 'edit', badge: null },
      { id: 'contact', label: 'Contact Details', icon: 'phone', badge: null },
      { id: 'links', label: 'Links & Socials', icon: 'link', badge: () => CardStore.getData().links.length },
      { id: 'services', label: 'Services & Advisory', icon: 'sparkles', badge: () => CardStore.getData().services.length },
      { id: 'portfolio', label: 'Portfolio Showcase', icon: 'briefcase', badge: () => CardStore.getData().portfolio.length },
      { id: 'theme', label: 'Themes & Aesthetics', icon: 'sliders', badge: null },
      { id: 'leads', label: 'Leads & CRM Inbox', icon: 'userPlus', badge: () => CardStore.getData().leads.length },
      { id: 'analytics', label: 'Analytics & Insights', icon: 'barChart', badge: null },
      { id: 'nfc', label: 'NFC Tag & QR Studio', icon: 'nfc', badge: null },
      { id: 'settings', label: 'Security & Backup', icon: 'lock', badge: null }
    ];

    const navContainer = document.getElementById('adminNav');
    if (!navContainer) return;

    navContainer.innerHTML = navItems.map(item => {
      const bVal = item.badge ? item.badge() : null;
      return `
        <div class="nav-item ${item.id === currentTab ? 'active' : ''}" data-tab="${item.id}">
          ${Icons.get(item.icon, '', 18)}
          <span>${item.label}</span>
          ${bVal !== null ? `<span class="nav-badge">${bVal}</span>` : ''}
        </div>
      `;
    }).join('');
  }

  function bindTabEvents() {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        switchTab(tabId);
      });
    });
  }

  function switchTab(tabId) {
    if (global.SoundFx) SoundFx.tap();
    currentTab = tabId;
    document.querySelectorAll('.nav-item').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `tab-${tabId}`);
    });

    // Close mobile drawer if open
    closeMobileSidebar();
  }

  function setupMobileDrawer() {
    const toggleBtn = document.getElementById('adminSidebarToggle');
    const overlay = document.getElementById('adminSidebarOverlay');
    const sidebar = document.getElementById('adminSidebar');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        if (global.SoundFx) SoundFx.tap();
        sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active', sidebar.classList.contains('open'));
      });
    }

    if (overlay) {
      overlay.addEventListener('click', closeMobileSidebar);
    }

    const refreshBtn = document.getElementById('btnPreviewRefresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        if (global.SoundFx) SoundFx.tap();
        updatePreviewPhone();
        showAdminToast('🔄 Simulator refreshed!');
      });
    }
  }

  function closeMobileSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.getElementById('adminSidebarOverlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  }

  // Populate Form Fields from Store
  function populateFormFields() {
    const data = CardStore.getData();
    const p = data.profile || {};
    const c = data.contact || {};
    const s = data.settings || {};

    // Profile inputs
    setVal('profName', p.name);
    setVal('profTitle', p.title);
    setVal('profCompany', p.company);
    setVal('profPronouns', p.pronouns);
    setVal('profLocation', p.location);
    setVal('profBio', p.bio);
    setVal('profBadge', p.statusBadge);
    setVal('profAvatar', p.avatar);
    setVal('profCover', p.cover);
    setVal('profNfcId', p.nfcId);
    setVal('profVerified', p.verified !== false, true);

    // Contact inputs
    setVal('contPhone', c.phone);
    setVal('contWorkPhone', c.workPhone);
    setVal('contEmail', c.email);
    setVal('contWhatsapp', c.whatsapp);
    setVal('contWebsite', c.website);
    setVal('contAddress', c.address);

    // Settings inputs
    setVal('settPasscode', s.adminPasscode || 'admin123');
    setVal('settShowServices', s.showServices !== false, true);
    setVal('settShowPortfolio', s.showPortfolio !== false, true);
  }

  function setVal(id, value, isCheckbox) {
    const el = document.getElementById(id);
    if (!el) return;
    if (isCheckbox) el.checked = Boolean(value);
    else el.value = value || '';
  }

  // Setup Live Form Inputs Change Listeners
  function setupLivePreview() {
    // Profile inputs
    const profileFields = ['profName', 'profTitle', 'profCompany', 'profPronouns', 'profLocation', 'profBio', 'profBadge', 'profAvatar', 'profCover', 'profNfcId'];
    profileFields.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => {
        const update = {
          name: getVal('profName'),
          title: getVal('profTitle'),
          company: getVal('profCompany'),
          pronouns: getVal('profPronouns'),
          location: getVal('profLocation'),
          bio: getVal('profBio'),
          statusBadge: getVal('profBadge'),
          avatar: getVal('profAvatar'),
          cover: getVal('profCover'),
          nfcId: getVal('profNfcId')
        };
        CardStore.updateProfile(update);
      });
    });

    const profVerified = document.getElementById('profVerified');
    if (profVerified) {
      profVerified.addEventListener('change', () => {
        CardStore.updateProfile({ verified: profVerified.checked });
      });
    }

    // Contact inputs
    const contactFields = ['contPhone', 'contWorkPhone', 'contEmail', 'contWhatsapp', 'contWebsite', 'contAddress'];
    contactFields.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => {
        const update = {
          phone: getVal('contPhone'),
          workPhone: getVal('contWorkPhone'),
          email: getVal('contEmail'),
          whatsapp: getVal('contWhatsapp'),
          website: getVal('contWebsite'),
          address: getVal('contAddress')
        };
        CardStore.updateContact(update);
      });
    });

    // Settings toggles
    const settShowServices = document.getElementById('settShowServices');
    if (settShowServices) {
      settShowServices.addEventListener('change', () => {
        CardStore.updateSettings({ showServices: settShowServices.checked });
      });
    }
    const settShowPortfolio = document.getElementById('settShowPortfolio');
    if (settShowPortfolio) {
      settShowPortfolio.addEventListener('change', () => {
        CardStore.updateSettings({ showPortfolio: settShowPortfolio.checked });
      });
    }

    // Passcode change
    const btnSavePasscode = document.getElementById('btnSavePasscode');
    if (btnSavePasscode) {
      btnSavePasscode.addEventListener('click', () => {
        const newPass = getVal('settPasscode');
        if (newPass.length < 4) {
          showAdminToast('Passcode must be at least 4 characters');
          return;
        }
        CardStore.updateSettings({ adminPasscode: newPass });
        if (typeof AuthStore !== 'undefined') {
          const adminUser = AuthStore.getUsers().find(u => u.role === 'admin' || u.username === 'admin');
          if (adminUser) {
            AuthStore.updateUserProfile(adminUser.id, { password: newPass });
          }
        }
        showAdminToast('🔒 Admin passcode updated successfully!');
      });
    }

    // Export & Import Backup
    const btnExportJson = document.getElementById('btnExportJson');
    if (btnExportJson) {
      btnExportJson.addEventListener('click', () => {
        CardStore.exportJSON();
        showAdminToast('💾 Backup exported as JSON file!');
      });
    }

    const inputImportJson = document.getElementById('inputImportJson');
    if (inputImportJson) {
      inputImportJson.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const res = CardStore.importJSON(event.target.result);
          if (res.success) {
            showAdminToast('✅ Backup restored successfully!');
            initAdmin();
          } else {
            showAdminToast('❌ Error: ' + res.error);
          }
        };
        reader.readAsText(file);
      });
    }

    // Reset Demo
    const btnResetDemo = document.getElementById('btnResetDemo');
    if (btnResetDemo) {
      btnResetDemo.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all card data back to initial demo defaults?')) {
          CardStore.resetToDefault();
          showAdminToast('🔄 Card data reset to default presets!');
          initAdmin();
        }
      });
    }
  }

  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  // Setup Presets for Avatars & Covers with Active Highlight
  function setupPresets() {
    const data = CardStore.getData();
    const currentAvatar = (data.profile && data.profile.avatar) || '';
    const currentCover = (data.profile && data.profile.cover) || '';

    const avatarGrid = document.getElementById('avatarPresetGrid');
    if (avatarGrid) {
      avatarGrid.innerHTML = avatarPresets.map(url => `
        <img src="${url}" class="avatar-preset-item ${url === currentAvatar ? 'active' : ''}" alt="Preset Avatar" data-url="${url}" />
      `).join('');

      avatarGrid.querySelectorAll('.avatar-preset-item').forEach(img => {
        img.addEventListener('click', () => {
          if (global.SoundFx) SoundFx.tap();
          const url = img.getAttribute('data-url');
          setVal('profAvatar', url);
          CardStore.updateProfile({ avatar: url });
          avatarGrid.querySelectorAll('.avatar-preset-item').forEach(i => i.classList.remove('active'));
          img.classList.add('active');
          showAdminToast('Avatar updated!');
        });
      });
    }

    const coverGrid = document.getElementById('coverPresetGrid');
    if (coverGrid) {
      coverGrid.innerHTML = coverPresets.map(url => `
        <div class="cover-preset-item ${url === currentCover ? 'active' : ''}" style="background-image: url('${url}');" data-url="${url}"></div>
      `).join('');

      coverGrid.querySelectorAll('.cover-preset-item').forEach(item => {
        item.addEventListener('click', () => {
          if (global.SoundFx) SoundFx.tap();
          const url = item.getAttribute('data-url');
          setVal('profCover', url);
          CardStore.updateProfile({ cover: url });
          coverGrid.querySelectorAll('.cover-preset-item').forEach(c => c.classList.remove('active'));
          item.classList.add('active');
          showAdminToast('Cover banner updated!');
        });
      });
    }
  }

  function setupFileUploads() {
    // 1. Avatar local image upload
    const avatarInput = document.getElementById('uploadAvatarFile');
    if (avatarInput) {
      avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        CardStore.readImageFile(file, (dataUrl) => {
          setVal('profAvatar', dataUrl);
          CardStore.updateProfile({ avatar: dataUrl });
          if (global.SoundFx) SoundFx.success();
          showAdminToast('📸 Custom avatar photo uploaded!');
          // Unhighlight presets
          const grid = document.getElementById('avatarPresetGrid');
          if (grid) grid.querySelectorAll('.avatar-preset-item').forEach(i => i.classList.remove('active'));
        }, (err) => {
          showAdminToast('❌ ' + err);
        });
      });
    }

    // 2. Cover local image upload
    const coverInput = document.getElementById('uploadCoverFile');
    if (coverInput) {
      coverInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        CardStore.readImageFile(file, (dataUrl) => {
          setVal('profCover', dataUrl);
          CardStore.updateProfile({ cover: dataUrl });
          if (global.SoundFx) SoundFx.success();
          showAdminToast('🖼️ Custom cover banner uploaded!');
          const grid = document.getElementById('coverPresetGrid');
          if (grid) grid.querySelectorAll('.cover-preset-item').forEach(i => i.classList.remove('active'));
        }, (err) => {
          showAdminToast('❌ ' + err);
        });
      });
    }
  }

  // Update Live Phone Mockup
  function updatePreviewPhone() {
    const phoneScreen = document.getElementById('livePhonePreview');
    if (!phoneScreen) return;
    CardApp.render(phoneScreen, true);
  }

  // Links List Management (Add, Edit, Reorder, Delete)
  function renderLinksList() {
    const container = document.getElementById('adminLinksList');
    if (!container) return;

    const data = CardStore.getData();
    const links = data.links || [];

    if (links.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          No links added yet. Click "Add New Link" above to add your first channel!
        </div>
      `;
      return;
    }

    container.innerHTML = links.map((link, index) => `
      <div class="admin-item-row" data-id="${link.id}">
        <div class="item-row-left">
          <div class="item-drag-handle" title="Move">
            ${Icons.get('gripVertical', '', 18)}
          </div>
          <div class="link-icon-box" style="color: ${link.color || 'var(--accent-primary)'}; width: 34px; height: 34px;">
            ${Icons.get(link.icon || 'link', '', 18)}
          </div>
          <div class="item-row-info">
            <div class="item-row-title">${escapeHtml(link.title)}</div>
            <div class="item-row-meta">${escapeHtml(link.url)} &bull; ${link.clicks || 0} taps</div>
          </div>
        </div>
        <div class="item-row-actions">
          <button class="btn btn-icon sm btn-secondary" onclick="AdminApp.moveLink('${link.id}', -1)" title="Move Up" ${index === 0 ? 'disabled' : ''}>
            ${Icons.get('chevronUp', '', 14)}
          </button>
          <button class="btn btn-icon sm btn-secondary" onclick="AdminApp.moveLink('${link.id}', 1)" title="Move Down" ${index === links.length - 1 ? 'disabled' : ''}>
            ${Icons.get('chevronDown', '', 14)}
          </button>
          <button class="btn btn-icon sm btn-secondary" onclick="AdminApp.openEditLinkModal('${link.id}')" title="Edit">
            ${Icons.get('edit', '', 14)}
          </button>
          <button class="btn btn-icon sm btn-secondary" onclick="AdminApp.deleteLink('${link.id}')" title="Delete" style="color: var(--ruby-rose);">
            ${Icons.get('trash', '', 14)}
          </button>
        </div>
      </div>
    `).join('');
  }

  // Link Modals (Add / Edit)
  function openLinkModal(linkId) {
    const isEdit = Boolean(linkId);
    const data = CardStore.getData();
    const existing = isEdit ? data.links.find(l => l.id === linkId) : null;

    let modal = document.getElementById('linkEditorModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'linkEditorModal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    const platforms = Icons.getAllPlatforms();

    modal.innerHTML = `
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? '✏️ Edit Link' : '➕ Add New Link'}</h3>
          <button class="modal-close-btn" onclick="document.getElementById('linkEditorModal').classList.remove('active')">&times;</button>
        </div>
        <form id="linkEditorForm">
          <div class="form-group">
            <label class="form-label">Platform / Icon</label>
            <select class="form-select" id="linkModalPlatform">
              ${platforms.map(p => `
                <option value="${p.id}" ${existing && existing.icon === p.id ? 'selected' : ''}>${p.name}</option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Button Title *</label>
            <input type="text" class="form-input" id="linkModalTitle" value="${existing ? escapeHtml(existing.title) : ''}" placeholder="e.g. LinkedIn Network" required />
          </div>
          <div class="form-group">
            <label class="form-label">Subtitle / Description</label>
            <input type="text" class="form-input" id="linkModalSubtitle" value="${existing ? escapeHtml(existing.subtitle || '') : ''}" placeholder="e.g. 18k+ followers" />
          </div>
          <div class="form-group">
            <label class="form-label">Destination URL *</label>
            <input type="url" class="form-input" id="linkModalUrl" value="${existing ? escapeHtml(existing.url) : 'https://'}" placeholder="https://..." required />
          </div>
          <div class="form-group" style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; margin-top: 1rem;">
            <div>
              <div style="font-weight: 600; font-size: 0.9rem;">Highlight as Featured</div>
              <div style="font-size: 0.785rem; color: var(--text-muted);">Gives this link a glowing accent border</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="linkModalHighlight" ${existing && existing.highlight ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="form-group" style="display: flex; flex-direction: row; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-weight: 600; font-size: 0.9rem;">Active / Visible</div>
              <div style="font-size: 0.785rem; color: var(--text-muted);">Show or hide on public card</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="linkModalActive" ${existing && existing.active !== false ? 'checked' : 'checked'} />
              <span class="toggle-slider"></span>
            </label>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.85rem; margin-top: 1.25rem;">
            ${isEdit ? 'Save Changes' : 'Add Link to Card'}
          </button>
        </form>
      </div>
    `;

    modal.classList.add('active');

    // Auto-fill template when platform changes
    const platformSelect = modal.querySelector('#linkModalPlatform');
    platformSelect.addEventListener('change', () => {
      const selectedPlat = Icons.getPlatform(platformSelect.value);
      if (selectedPlat && !existing) {
        modal.querySelector('#linkModalTitle').value = selectedPlat.name;
        modal.querySelector('#linkModalUrl').value = selectedPlat.prefix;
      }
    });

    // Form submit
    modal.querySelector('#linkEditorForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const platId = modal.querySelector('#linkModalPlatform').value;
      const platInfo = Icons.getPlatform(platId);

      const linkPayload = {
        title: modal.querySelector('#linkModalTitle').value.trim(),
        subtitle: modal.querySelector('#linkModalSubtitle').value.trim(),
        url: modal.querySelector('#linkModalUrl').value.trim(),
        icon: platId,
        color: platInfo ? platInfo.color : '#10b981',
        highlight: modal.querySelector('#linkModalHighlight').checked,
        active: modal.querySelector('#linkModalActive').checked
      };

      if (isEdit) {
        CardStore.updateLink(linkId, linkPayload);
        showAdminToast('Link updated successfully!');
      } else {
        CardStore.addLink(linkPayload);
        showAdminToast('New link added to card!');
      }

      modal.classList.remove('active');
      renderLinksList();
      renderSidebarNav();
    });
  }

  function moveLink(id, delta) {
    const data = CardStore.getData();
    const links = [...data.links];
    const idx = links.findIndex(l => l.id === id);
    if (idx === -1) return;
    const targetIdx = idx + delta;
    if (targetIdx < 0 || targetIdx >= links.length) return;

    const temp = links[idx];
    links[idx] = links[targetIdx];
    links[targetIdx] = temp;

    CardStore.reorderLinks(links);
    renderLinksList();
  }

  function deleteLink(id) {
    if (confirm('Are you sure you want to remove this link?')) {
      CardStore.deleteLink(id);
      renderLinksList();
      renderSidebarNav();
      showAdminToast('Link deleted');
    }
  }

  // Services Management
  function renderServicesList() {
    const container = document.getElementById('adminServicesList');
    if (!container) return;

    const data = CardStore.getData();
    const services = data.services || [];

    if (services.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          No services added yet. Click "Add Service" to create advisory or offerings cards!
        </div>
      `;
      return;
    }

    container.innerHTML = services.map(s => `
      <div class="admin-item-row" data-id="${s.id}">
        <div class="item-row-left">
          <div class="link-icon-box" style="width: 34px; height: 34px; color: var(--accent-primary);">
            ${Icons.get(s.icon || 'sparkles', '', 18)}
          </div>
          <div class="item-row-info">
            <div class="item-row-title">${escapeHtml(s.title)}</div>
            <div class="item-row-meta">${escapeHtml(s.price || 'Free')} &bull; ${escapeHtml(s.description || '')}</div>
          </div>
        </div>
        <div class="item-row-actions">
          <button class="btn btn-icon sm btn-secondary" onclick="AdminApp.openEditServiceModal('${s.id}')" title="Edit">
            ${Icons.get('edit', '', 14)}
          </button>
          <button class="btn btn-icon sm btn-secondary" onclick="AdminApp.deleteService('${s.id}')" title="Delete" style="color: var(--ruby-rose);">
            ${Icons.get('trash', '', 14)}
          </button>
        </div>
      </div>
    `).join('');
  }

  function openServiceModal(srvId) {
    const isEdit = Boolean(srvId);
    const data = CardStore.getData();
    const existing = isEdit ? data.services.find(s => s.id === srvId) : null;

    let modal = document.getElementById('serviceEditorModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'serviceEditorModal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? '✏️ Edit Service' : '➕ Add Service Offering'}</h3>
          <button class="modal-close-btn" onclick="document.getElementById('serviceEditorModal').classList.remove('active')">&times;</button>
        </div>
        <form id="serviceEditorForm">
          <div class="form-group">
            <label class="form-label">Service Title *</label>
            <input type="text" class="form-input" id="srvModalTitle" value="${existing ? escapeHtml(existing.title) : ''}" placeholder="e.g. AI Product Architecture" required />
          </div>
          <div class="form-group">
            <label class="form-label">Price / Rate Tag</label>
            <input type="text" class="form-input" id="srvModalPrice" value="${existing ? escapeHtml(existing.price) : ''}" placeholder="e.g. From $5,000 or $350 / hr" />
          </div>
          <div class="form-group">
            <label class="form-label">Badge Tag (Optional)</label>
            <input type="text" class="form-input" id="srvModalBadge" value="${existing ? escapeHtml(existing.badge || '') : ''}" placeholder="e.g. Popular or Limited" />
          </div>
          <div class="form-group">
            <label class="form-label">Service Description *</label>
            <textarea class="form-textarea" id="srvModalDesc" placeholder="Describe the outcome, deliverables, and timeline." required>${existing ? escapeHtml(existing.description || '') : ''}</textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.85rem; margin-top: 1rem;">
            ${isEdit ? 'Save Service' : 'Add Service'}
          </button>
        </form>
      </div>
    `;

    modal.classList.add('active');

    modal.querySelector('#serviceEditorForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const payload = {
        title: modal.querySelector('#srvModalTitle').value.trim(),
        price: modal.querySelector('#srvModalPrice').value.trim(),
        badge: modal.querySelector('#srvModalBadge').value.trim(),
        description: modal.querySelector('#srvModalDesc').value.trim(),
        icon: 'sparkles'
      };

      if (isEdit) {
        CardStore.updateService(srvId, payload);
        showAdminToast('Service updated!');
      } else {
        CardStore.addService(payload);
        showAdminToast('New service added!');
      }

      modal.classList.remove('active');
      renderServicesList();
      renderSidebarNav();
    });
  }

  function deleteService(id) {
    if (confirm('Delete this service offering?')) {
      CardStore.deleteService(id);
      renderServicesList();
      renderSidebarNav();
      showAdminToast('Service deleted');
    }
  }

  // Portfolio Management
  function renderPortfolioList() {
    const container = document.getElementById('adminPortfolioList');
    if (!container) return;

    const data = CardStore.getData();
    const portfolio = data.portfolio || [];

    if (portfolio.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          No portfolio items added yet. Click "Add Project" to showcase your work!
        </div>
      `;
      return;
    }

    container.innerHTML = portfolio.map(item => `
      <div class="admin-item-row" data-id="${item.id}">
        <div class="item-row-left">
          ${item.image ? `<img src="${escapeHtml(item.image)}" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover;" />` : ''}
          <div class="item-row-info">
            <div class="item-row-title">${escapeHtml(item.title)}</div>
            <div class="item-row-meta">${escapeHtml(item.category || '')} &bull; ${escapeHtml(item.description || '')}</div>
          </div>
        </div>
        <div class="item-row-actions">
          <button class="btn btn-icon sm btn-secondary" onclick="AdminApp.openEditPortfolioModal('${item.id}')" title="Edit">
            ${Icons.get('edit', '', 14)}
          </button>
          <button class="btn btn-icon sm btn-secondary" onclick="AdminApp.deletePortfolio('${item.id}')" title="Delete" style="color: var(--ruby-rose);">
            ${Icons.get('trash', '', 14)}
          </button>
        </div>
      </div>
    `).join('');
  }

  function openPortfolioModal(portId) {
    const isEdit = Boolean(portId);
    const data = CardStore.getData();
    const existing = isEdit ? data.portfolio.find(p => p.id === portId) : null;

    let modal = document.getElementById('portfolioEditorModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'portfolioEditorModal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? '✏️ Edit Project' : '➕ Add Portfolio Project'}</h3>
          <button class="modal-close-btn" onclick="document.getElementById('portfolioEditorModal').classList.remove('active')">&times;</button>
        </div>
        <form id="portfolioEditorForm">
          <div class="form-group">
            <label class="form-label">Project Title *</label>
            <input type="text" class="form-input" id="portModalTitle" value="${existing ? escapeHtml(existing.title) : ''}" placeholder="e.g. AetherOS Spatial UI" required />
          </div>
          <div class="form-group">
            <label class="form-label">Category / Tag</label>
            <input type="text" class="form-input" id="portModalCat" value="${existing ? escapeHtml(existing.category) : ''}" placeholder="e.g. AI / Spatial UI" />
          </div>
          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
              <label class="form-label" style="margin-bottom: 0;">Thumbnail Image URL *</label>
              <label class="btn btn-secondary btn-sm" style="cursor: pointer; padding: 0.2rem 0.55rem; font-size: 0.725rem;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                <span>Upload File</span>
                <input type="file" id="uploadPortImgFile" accept="image/*" style="display: none;" />
              </label>
            </div>
            <input type="url" class="form-input" id="portModalImg" value="${existing ? escapeHtml(existing.image) : 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80'}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Demo Link</label>
            <input type="url" class="form-input" id="portModalLink" value="${existing ? escapeHtml(existing.link || '') : 'https://'}" />
          </div>
          <div class="form-group">
            <label class="form-label">Brief Description</label>
            <textarea class="form-textarea" id="portModalDesc" placeholder="Summary of results and tech stack.">${existing ? escapeHtml(existing.description || '') : ''}</textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.85rem; margin-top: 1rem;">
            ${isEdit ? 'Save Project' : 'Add Project'}
          </button>
        </form>
      </div>
    `;

    modal.classList.add('active');

    // Portfolio local image upload
    const portFileInput = modal.querySelector('#uploadPortImgFile');
    if (portFileInput) {
      portFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        CardStore.readImageFile(file, (dataUrl) => {
          modal.querySelector('#portModalImg').value = dataUrl;
          if (global.SoundFx) SoundFx.success();
          showAdminToast('📸 Project image loaded!');
        }, (err) => {
          showAdminToast('❌ ' + err);
        });
      });
    }

    modal.querySelector('#portfolioEditorForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const payload = {
        title: modal.querySelector('#portModalTitle').value.trim(),
        category: modal.querySelector('#portModalCat').value.trim(),
        image: modal.querySelector('#portModalImg').value.trim(),
        link: modal.querySelector('#portModalLink').value.trim(),
        description: modal.querySelector('#portModalDesc').value.trim()
      };

      if (isEdit) {
        CardStore.updatePortfolio(portId, payload);
        showAdminToast('Project updated!');
      } else {
        CardStore.addPortfolio(payload);
        showAdminToast('New project added!');
      }

      modal.classList.remove('active');
      renderPortfolioList();
      renderSidebarNav();
    });
  }

  function deletePortfolio(id) {
    if (confirm('Delete this portfolio project?')) {
      CardStore.deletePortfolio(id);
      renderPortfolioList();
      renderSidebarNav();
      showAdminToast('Project deleted');
    }
  }

  // Leads CRM Table
  function renderLeadsTable() {
    const container = document.getElementById('adminLeadsTableContainer');
    if (!container) return;

    const data = CardStore.getData();
    const leads = data.leads || [];

    if (leads.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
          No contacts exchanged yet. When someone taps "Exchange Info" on your card, their contact details will appear here automatically!
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <span style="font-size: 0.9rem; color: var(--text-secondary);">Showing ${leads.length} leads</span>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-sm btn-primary" onclick="CardStore.exportLeadsCSV()">
            ${Icons.get('download', '', 14)} Export CSV
          </button>
          <button class="btn btn-sm btn-secondary" onclick="AdminApp.clearLeads()" style="color: var(--ruby-rose);">
            ${Icons.get('trash', '', 14)} Clear All
          </button>
        </div>
      </div>
      <div class="leads-table-container">
        <table class="leads-table">
          <thead>
            <tr>
              <th>Contact Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Note</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${leads.map(lead => `
              <tr>
                <td style="font-weight: 700; color: var(--text-primary);">${escapeHtml(lead.name)}</td>
                <td><a href="mailto:${escapeHtml(lead.email)}" style="color: var(--accent-primary);">${escapeHtml(lead.email)}</a></td>
                <td><a href="tel:${escapeHtml(lead.phone)}">${escapeHtml(lead.phone || '-')}</a></td>
                <td>${escapeHtml(lead.company || '-')}</td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(lead.note || '-')}</td>
                <td style="font-family: var(--font-mono); font-size: 0.75rem;">${escapeHtml(lead.date)}</td>
                <td>
                  <select onchange="CardStore.updateLeadStatus('${lead.id}', this.value)" style="background: rgba(255,255,255,0.06); border: 1px solid var(--card-border); color: var(--text-primary); padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.75rem;">
                    <option value="New" ${lead.status === 'New' ? 'selected' : ''}>🟢 New</option>
                    <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>🟡 Contacted</option>
                    <option value="Converted" ${lead.status === 'Converted' ? 'selected' : ''}>⭐ Converted</option>
                  </select>
                </td>
                <td>
                  <button class="btn btn-icon sm btn-secondary" onclick="AdminApp.deleteLead('${lead.id}')" title="Delete lead" style="color: var(--ruby-rose);">
                    ${Icons.get('trash', '', 14)}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function deleteLead(id) {
    if (confirm('Delete this lead entry?')) {
      CardStore.deleteLead(id);
      renderLeadsTable();
      renderSidebarNav();
      showAdminToast('Lead deleted');
    }
  }

  function clearLeads() {
    if (confirm('Are you sure you want to delete ALL collected leads?')) {
      CardStore.clearAllLeads();
      renderLeadsTable();
      renderSidebarNav();
      showAdminToast('All leads cleared');
    }
  }

  // Analytics View
  function renderAnalytics() {
    const data = CardStore.getData();
    const a = data.analytics || {};
    const links = data.links || [];

    setElemText('statViews', a.pageViews || 0);
    setElemText('statDownloads', a.vcardDownloads || 0);
    setElemText('statClicks', a.totalClicks || 0);
    setElemText('statLeads', a.exchangeCount || 0);

    const rankingContainer = document.getElementById('topLinksRanking');
    if (!rankingContainer) return;

    const sorted = [...links].sort((x, y) => (y.clicks || 0) - (x.clicks || 0));

    rankingContainer.innerHTML = sorted.map((item, idx) => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-family: var(--font-mono); font-weight: 700; color: var(--text-muted); width: 20px;">#${idx + 1}</span>
          <div class="link-icon-box" style="width: 32px; height: 32px; color: ${item.color};">
            ${Icons.get(item.icon || 'link', '', 16)}
          </div>
          <div>
            <div style="font-weight: 600; font-size: 0.9rem;">${escapeHtml(item.title)}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(item.url)}</div>
          </div>
        </div>
        <div style="text-align: right;">
          <span class="badge badge-accent">${item.clicks || 0} taps</span>
        </div>
      </div>
    `).join('');
  }

  function setElemText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val.toLocaleString();
  }

  // Theme Picker
  function renderThemePicker() {
    const container = document.getElementById('adminThemePresets');
    if (!container) return;

    const themes = [
      { id: 'obsidian', name: 'Obsidian Dark', desc: 'Cyber onyx with emerald & electric cyan highlights', colors: ['#08090d', '#10b981', '#06b6d4'] },
      { id: 'champagne', name: 'Champagne Luxury', desc: 'Matte black & brushed 24k champagne gold', colors: ['#070707', '#fbbf24', '#b45309'] },
      { id: 'aurora', name: 'Aurora Glass', desc: 'Deep indigo & glowing ultraviolet neon mesh', colors: ['#070a14', '#8b5cf6', '#06b6d4'] },
      { id: 'cyber', name: 'Cyber Matrix', desc: 'Jet pitch black & electric acid lime green', colors: ['#020408', '#10b981', '#34d399'] },
      { id: 'crimson', name: 'Crimson Rose', desc: 'Velvet dark noir & glowing metallic ruby', colors: ['#0a0407', '#f43f5e', '#fb7185'] },
      { id: 'minimal', name: 'Minimal Slate', desc: 'Pure graphite & frosty titanium white', colors: ['#0b0f17', '#e2e8f0', '#94a3b8'] }
    ];

    const currentTheme = CardStore.getData().theme.themeId || 'obsidian';

    container.innerHTML = themes.map(th => `
      <div class="theme-card-option ${th.id === currentTheme ? 'active' : ''}" data-theme-id="${th.id}">
        <div style="font-weight: 700; font-size: 1rem;">${th.name}</div>
        <p style="font-size: 0.785rem; color: var(--text-muted); margin-top: 0.25rem;">${th.desc}</p>
        <div class="theme-preview-palette">
          ${th.colors.map(c => `<div class="palette-swatch" style="background: ${c};"></div>`).join('')}
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.theme-card-option').forEach(card => {
      card.addEventListener('click', () => {
        const tId = card.getAttribute('data-theme-id');
        container.querySelectorAll('.theme-card-option').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        CardStore.updateTheme({ themeId: tId });
        document.body.setAttribute('data-theme', tId);
        showAdminToast(`🎨 Applied "${tId.toUpperCase()}" theme preset!`);
      });
    });

    // Custom Color picker
    const colorPicker = document.getElementById('customAccentColor');
    if (colorPicker) {
      colorPicker.value = CardStore.getData().theme.accentColor || '#10b981';
      colorPicker.addEventListener('input', () => {
        CardStore.updateTheme({ accentColor: colorPicker.value });
        document.documentElement.style.setProperty('--accent-primary', colorPicker.value);
      });
    }
  }

  // ─── QR Studio (Smart Redirect + Per-Card Manager + Generator) ───
  function renderNfcStudio() {
    let defaultCardUrl = '';
    if (window.location.origin && window.location.origin !== 'null') {
      defaultCardUrl = window.location.origin + window.location.pathname.replace('admin.html', 'card.html');
    } else {
      defaultCardUrl = window.location.href.replace('admin.html', 'card.html');
    }

    const data = CardStore.getData();
    if (!data.qrConfig) data.qrConfig = {};

    // Fix or initialize permalinkUrl in store
    if (!data.qrConfig.permalinkUrl || data.qrConfig.permalinkUrl.startsWith('null') || data.qrConfig.permalinkUrl.startsWith('file:')) {
      data.qrConfig.permalinkUrl = defaultCardUrl;
      CardStore.save();
    }
    let permalinkUrl = data.qrConfig.permalinkUrl || defaultCardUrl;

    // ─── SECTION 1: Smart Redirect QR Elements ───
    const smartPreview       = document.getElementById('smartQrPreview');
    const permalinkEl        = document.getElementById('smartQrPermalink');
    const labelEl            = document.getElementById('smartQrContentLabel');
    const toggleEl           = document.getElementById('qrRedirectToggle');
    const destInput          = document.getElementById('qrRedirectDestInput');
    const dotEl              = document.getElementById('qrRedirectDot');
    const statusEl           = document.getElementById('qrRedirectStatusText');
    const cardPermalinkInput = document.getElementById('qrCardPermalinkInput');
    const btnAutoDetect      = document.getElementById('btnAutoDetectCardUrl');
    const modeSmartRadio     = document.getElementById('qrModeSmart');
    const modeFixedRadio     = document.getElementById('qrModeFixed');
    const btnCopySmart       = document.getElementById('btnCopySmartQrUrl');
    const btnDlSmart         = document.getElementById('btnDownloadSmartQr');
    const btnTestSmart       = document.getElementById('btnTestSmartQr');
    const btnSaveRedir       = document.getElementById('btnSaveQrRedirect');

    // Populate initial inputs from stored configuration
    if (toggleEl) toggleEl.checked = !!data.qrConfig.redirectEnabled;
    if (destInput) destInput.value = data.qrConfig.redirectDest || '';
    if (cardPermalinkInput) cardPermalinkInput.value = permalinkUrl;

    const savedMode = data.qrConfig.redirectMode || 'smart';
    if (modeSmartRadio && modeFixedRadio) {
      if (savedMode === 'fixed') modeFixedRadio.checked = true;
      else modeSmartRadio.checked = true;
    }

    // Helper: Normalize URL
    function cleanUrl(url) {
      if (typeof CardApp !== 'undefined' && CardApp.normalizeUrl) {
        return CardApp.normalizeUrl(url);
      }
      if (!url) return '';
      let str = String(url).trim();
      if (!str) return '';
      if (str.startsWith('//')) return 'https:' + str;
      if (!/^https?:\/\//i.test(str) && !/^mailto:/i.test(str) && !/^tel:/i.test(str)) {
        str = 'https://' + str;
      }
      return str;
    }

    // Compute active QR code payload
    function getActiveQrPayload() {
      const isRedirectOn = toggleEl ? toggleEl.checked : false;
      const rawDest = destInput ? destInput.value.trim() : '';
      const destUrl = cleanUrl(rawDest);
      const isFixedMode = modeFixedRadio ? modeFixedRadio.checked : false;
      const baseCardUrl = (cardPermalinkInput && cardPermalinkInput.value.trim()) ? cardPermalinkInput.value.trim() : permalinkUrl;

      if (isRedirectOn && destUrl) {
        if (isFixedMode) {
          // Fixed mode: embed ?r=destination so card.html can redirect ANY device
          const separator = baseCardUrl.includes('?') ? '&' : '?';
          const fixedRedirectUrl = baseCardUrl + separator + 'r=' + encodeURIComponent(destUrl);
          return {
            qrText: fixedRedirectUrl,
            destinationUrl: destUrl,
            displayLabel: 'Fixed Card URL with Smart Redirect Param',
            isRedirect: true
          };
        } else {
          // Universal Dynamic Mode: direct forward URL so ANY smartphone camera redirects immediately
          return {
            qrText: destUrl,
            destinationUrl: destUrl,
            displayLabel: 'Direct Forward URL (Universal Phone Scan)',
            isRedirect: true
          };
        }
      }

      return {
        qrText: baseCardUrl,
        destinationUrl: baseCardUrl,
        displayLabel: 'Public NFC Digital Card URL',
        isRedirect: false
      };
    }

    // Real-time UI refresh for QR preview, status text, and indicators
    function refreshSmartQrUI() {
      const payload = getActiveQrPayload();

      // Render updated vector QR preview
      if (smartPreview && typeof QRCode !== 'undefined') {
        smartPreview.innerHTML = QRCode.renderSVG({
          text: payload.qrText,
          size: 220,
          darkColor: '#0a0d14',
          lightColor: '#ffffff',
          rounded: true
        });
      }

      // Update permalink label and displayed target
      if (permalinkEl) {
        permalinkEl.textContent = payload.qrText;
        permalinkEl.title = payload.qrText;
      }
      if (labelEl) {
        labelEl.textContent = payload.displayLabel;
      }

      // Update dot and status message
      const isRedirectOn = toggleEl ? toggleEl.checked : false;
      if (dotEl) {
        dotEl.style.background = isRedirectOn ? 'var(--accent-primary)' : '#64748b';
        dotEl.style.boxShadow  = isRedirectOn ? '0 0 10px var(--accent-primary)' : 'none';
      }
      if (statusEl) {
        if (isRedirectOn) {
          const destText = payload.destinationUrl ? escapeHtml(payload.destinationUrl) : '(empty destination)';
          statusEl.innerHTML = `Redirect: <strong style="color:var(--accent-primary)">ON</strong> — Forwarding to: <span style="font-family:var(--font-mono); font-size:0.8rem; color:var(--accent-primary);">${destText}</span>`;
        } else {
          statusEl.innerHTML = `Redirect: <strong>OFF</strong> — QR opens your digital business card directly`;
        }
      }
    }

    // Attach Toggle change listener with instant state save and refresh
    if (toggleEl) {
      toggleEl.addEventListener('change', () => {
        const enabled = toggleEl.checked;
        const dest = destInput ? cleanUrl(destInput.value) : '';
        CardStore.getData().qrConfig.redirectEnabled = enabled;
        if (dest) CardStore.getData().qrConfig.redirectDest = dest;
        CardStore.save();
        refreshSmartQrUI();
        showAdminToast(enabled ? '🔗 Redirect turned ON' : '📱 Redirect turned OFF — QR opens card');
      });
    }

    // Real-time input listener on destination input
    if (destInput) {
      destInput.addEventListener('input', () => {
        refreshSmartQrUI();
      });
      destInput.addEventListener('blur', () => {
        if (destInput.value.trim()) {
          destInput.value = cleanUrl(destInput.value);
          refreshSmartQrUI();
        }
      });
    }

    // Mode radio change listeners
    if (modeSmartRadio) {
      modeSmartRadio.addEventListener('change', () => {
        CardStore.getData().qrConfig.redirectMode = 'smart';
        CardStore.save();
        refreshSmartQrUI();
      });
    }
    if (modeFixedRadio) {
      modeFixedRadio.addEventListener('change', () => {
        CardStore.getData().qrConfig.redirectMode = 'fixed';
        CardStore.save();
        refreshSmartQrUI();
      });
    }

    // Quick Preset Chips
    const presetButtons = document.querySelectorAll('#qrQuickPresets .qr-preset-chip');
    presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.getAttribute('data-preset');
        if (destInput && preset) {
          destInput.value = preset;
          if (toggleEl && !toggleEl.checked) {
            toggleEl.checked = true;
          }
          CardStore.getData().qrConfig.redirectEnabled = true;
          CardStore.getData().qrConfig.redirectDest = preset;
          CardStore.save();
          refreshSmartQrUI();
          showAdminToast(`⚡ Set destination to ${preset}`);
        }
      });
    });

    // Auto-detect Host Button
    if (btnAutoDetect && cardPermalinkInput) {
      btnAutoDetect.addEventListener('click', () => {
        let detected = '';
        if (window.location.origin && window.location.origin !== 'null') {
          detected = window.location.origin + window.location.pathname.replace('admin.html', 'card.html');
        } else {
          detected = window.location.href.replace('admin.html', 'card.html');
        }
        cardPermalinkInput.value = detected;
        permalinkUrl = detected;
        CardStore.getData().qrConfig.permalinkUrl = detected;
        CardStore.save();
        refreshSmartQrUI();
        showAdminToast('🌐 Host URL updated to ' + detected);
      });
    }

    // Copy URL button
    if (btnCopySmart) {
      btnCopySmart.addEventListener('click', () => {
        const payload = getActiveQrPayload();
        navigator.clipboard.writeText(payload.qrText).then(() =>
          showAdminToast('📋 Copied QR link: ' + payload.qrText));
      });
    }

    // Download Smart QR button
    if (btnDlSmart) {
      btnDlSmart.addEventListener('click', () => {
        const payload = getActiveQrPayload();
        const canvas = document.createElement('canvas');
        QRCode.renderCanvas(canvas, {
          text: payload.qrText,
          size: 1000,
          darkColor: '#0a0d14',
          lightColor: '#ffffff'
        });
        const a = document.createElement('a');
        a.download = payload.isRedirect ? 'tapcard_smart_redirect_qr.png' : 'tapcard_public_card_qr.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
        showAdminToast('📥 QR code downloaded (1000×1000px high-res)!');
      });
    }

    // Test Smart QR button (opens current destination in a new browser tab)
    if (btnTestSmart) {
      btnTestSmart.addEventListener('click', () => {
        const payload = getActiveQrPayload();
        if (payload.destinationUrl) {
          window.open(payload.destinationUrl, '_blank');
          showAdminToast('🚀 Opening target destination: ' + payload.destinationUrl);
        } else {
          showAdminToast('⚠️ Please enter a destination URL first');
        }
      });
    }

    // Save redirect settings button
    if (btnSaveRedir) {
      btnSaveRedir.addEventListener('click', () => {
        const rawDest = destInput ? destInput.value.trim() : '';
        const dest = rawDest ? cleanUrl(rawDest) : '';
        const enabled = toggleEl ? toggleEl.checked : false;
        const customPermalink = cardPermalinkInput ? cardPermalinkInput.value.trim() : '';
        const mode = (modeFixedRadio && modeFixedRadio.checked) ? 'fixed' : 'smart';

        if (destInput && dest) destInput.value = dest;

        CardStore.getData().qrConfig.redirectEnabled = enabled;
        CardStore.getData().qrConfig.redirectDest    = dest;
        CardStore.getData().qrConfig.redirectMode    = mode;
        if (customPermalink) {
          CardStore.getData().qrConfig.permalinkUrl = customPermalink;
          permalinkUrl = customPermalink;
        }
        CardStore.save();
        refreshSmartQrUI();

        if (enabled && !dest) {
          showAdminToast('⚠️ Redirect is ON, but destination is empty. Please enter a URL.');
        } else if (enabled) {
          showAdminToast(`✅ Redirect active! QR forwards to: ${dest}`);
        } else {
          showAdminToast('✅ Redirect disabled. QR opens your card directly.');
        }
      });
    }

    // Initial render of the Smart QR UI
    refreshSmartQrUI();

    // ─── SECTION 2: Per-Card QR Manager ───
    function renderCardQrList() {
      const listEl = document.getElementById('cardQrList');
      if (!listEl) return;
      const cards = CardStore.getData().qrConfig.savedCards || [];
      if (cards.length === 0) {
        listEl.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:2rem; border:1px dashed var(--card-border); border-radius:var(--radius-md);">No card QRs yet. Click "Add Card QR" to create one.</div>`;
        return;
      }
      listEl.innerHTML = cards.map(card => `
        <div class="qr-card-row" data-qr-id="${card.id}">
          <div class="qr-card-row-preview" id="qrPrev_${card.id}"></div>
          <div class="qr-card-row-info">
            <div class="qr-card-row-label">${escapeHtml(card.label)}</div>
            <div class="qr-card-row-url">${escapeHtml(card.url)}</div>
            <div class="qr-card-row-date">Added ${card.createdAt}</div>
          </div>
          <div class="qr-card-row-actions">
            <button class="btn btn-sm btn-secondary" onclick="AdminApp.downloadCardQr('${card.id}')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Download
            </button>
            <button class="btn btn-sm btn-outline" onclick="AdminApp.copyCardQrUrl('${card.id}')">Copy URL</button>
            <button class="btn btn-sm" style="background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.3);color:#f87171;" onclick="AdminApp.deleteCardQr('${card.id}')">Remove</button>
          </div>
        </div>
      `).join('');

      // Render mini QR previews
      cards.forEach(card => {
        const previewEl = document.getElementById(`qrPrev_${card.id}`);
        if (previewEl && QRCode) {
          previewEl.innerHTML = QRCode.renderSVG({ text: card.url, size: 80, darkColor: '#0a0d14', lightColor: '#ffffff', rounded: true });
        }
      });
    }

    renderCardQrList();

    // Add Card QR form
    const btnAddCard = document.getElementById('btnAddCardQr');
    if (btnAddCard) {
      btnAddCard.addEventListener('click', () => {
        const form = document.getElementById('qrAddCardForm');
        if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
      });
    }

    const btnSaveNewCard = document.getElementById('btnSaveNewCardQr');
    if (btnSaveNewCard) {
      btnSaveNewCard.addEventListener('click', () => {
        const label = (document.getElementById('qrNewCardLabel') || {}).value?.trim();
        const url   = (document.getElementById('qrNewCardUrl') || {}).value?.trim();
        if (!label || !url) { showAdminToast('⚠️ Please fill in both Label and URL.'); return; }
        const newCard = { id: 'qrc-' + Date.now(), label, url, createdAt: new Date().toISOString().split('T')[0] };
        CardStore.getData().qrConfig.savedCards.push(newCard);
        CardStore.save();
        document.getElementById('qrAddCardForm').style.display = 'none';
        document.getElementById('qrNewCardLabel').value = '';
        document.getElementById('qrNewCardUrl').value   = '';
        renderCardQrList();
        showAdminToast(`✅ Card QR saved: "${label}"`);
      });
    }

    // ─── SECTION 3: QR Generator ───
    let generatorText  = permalinkUrl;
    let generatorDark  = '#0a0d14';
    let generatorLight = '#ffffff';

    function renderGeneratorPreview() {
      const el = document.getElementById('generatorQrPreview');
      if (!el || !generatorText) return;
      el.innerHTML = QRCode.renderSVG({
        text: generatorText,
        size: 220,
        darkColor: generatorDark,
        lightColor: generatorLight,
        rounded: true
      });
    }

    // Pre-fill with card URL and render
    const genInput = document.getElementById('qrGenInput');
    if (genInput) {
      genInput.value = permalinkUrl;
      genInput.addEventListener('input', () => { generatorText = genInput.value; });
    }
    renderGeneratorPreview();

    // Color pickers sync
    function syncColor(pickerId, hexId, setter) {
      const picker = document.getElementById(pickerId);
      const hex    = document.getElementById(hexId);
      if (picker) picker.addEventListener('input', () => { if (hex) hex.value = picker.value; setter(picker.value); });
      if (hex) hex.addEventListener('change', () => { if (picker) picker.value = hex.value; setter(hex.value); });
    }
    syncColor('qrGenDark',  'qrGenDarkHex',  v => { generatorDark  = v; });
    syncColor('qrGenLight', 'qrGenLightHex', v => { generatorLight = v; });

    const btnGenerate = document.getElementById('btnGenerateQr');
    if (btnGenerate) {
      btnGenerate.addEventListener('click', () => {
        generatorText = (document.getElementById('qrGenInput') || {}).value?.trim() || permalinkUrl;
        if (!generatorText) { showAdminToast('⚠️ Enter a URL or text first.'); return; }
        renderGeneratorPreview();
        SoundFx.tap();
        showAdminToast('✅ QR generated!');
      });
    }

    const btnDlGen = document.getElementById('btnDownloadGeneratedQr');
    if (btnDlGen) {
      btnDlGen.addEventListener('click', () => {
        const t = (document.getElementById('qrGenInput') || {}).value?.trim() || permalinkUrl;
        const canvas = document.createElement('canvas');
        QRCode.renderCanvas(canvas, { text: t, size: 1000, darkColor: generatorDark, lightColor: generatorLight });
        const a = document.createElement('a');
        a.download = 'tapcard_custom_qr.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
        showAdminToast('📥 Custom QR downloaded (1000×1000px)!');
      });
    }

    const btnSaveGen = document.getElementById('btnSaveGeneratedToCards');
    if (btnSaveGen) {
      btnSaveGen.addEventListener('click', () => {
        const t = (document.getElementById('qrGenInput') || {}).value?.trim();
        if (!t) { showAdminToast('⚠️ Enter a URL first.'); return; }
        const label = prompt('Label for this QR card?', t.length > 40 ? t.slice(0,40)+'…' : t);
        if (!label) return;
        const newCard = { id: 'qrc-' + Date.now(), label, url: t, createdAt: new Date().toISOString().split('T')[0] };
        CardStore.getData().qrConfig.savedCards.push(newCard);
        CardStore.save();
        renderCardQrList();
        showAdminToast(`✅ Saved to Per-Card Manager: "${label}"`);
      });
    }
  }

  // Per-Card QR actions exposed globally
  function downloadCardQr(id) {
    const card = (CardStore.getData().qrConfig.savedCards || []).find(c => c.id === id);
    if (!card) return;
    const canvas = document.createElement('canvas');
    QRCode.renderCanvas(canvas, { text: card.url, size: 1000, darkColor: '#0a0d14', lightColor: '#ffffff' });
    const a = document.createElement('a');
    a.download = `tapcard_qr_${card.label.replace(/\s+/g,'_')}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    showAdminToast(`📥 Downloaded QR for "${card.label}"`);
  }

  function copyCardQrUrl(id) {
    const card = (CardStore.getData().qrConfig.savedCards || []).find(c => c.id === id);
    if (!card) return;
    navigator.clipboard.writeText(card.url).then(() =>
      showAdminToast(`📋 Copied: ${card.url}`));
  }

  function deleteCardQr(id) {
    const qc = CardStore.getData().qrConfig;
    qc.savedCards = (qc.savedCards || []).filter(c => c.id !== id);
    CardStore.save();
    // Re-render list
    const listEl = document.getElementById('cardQrList');
    if (listEl) {
      // trigger re-render by calling the inner function via a re-init
      const cards = qc.savedCards;
      if (cards.length === 0) {
        listEl.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:2rem; border:1px dashed var(--card-border); border-radius:var(--radius-md);">No card QRs yet.</div>`;
      } else {
        listEl.innerHTML = cards.map(card => `
          <div class="qr-card-row" data-qr-id="${card.id}">
            <div class="qr-card-row-preview" id="qrPrev_${card.id}"></div>
            <div class="qr-card-row-info">
              <div class="qr-card-row-label">${escapeHtml(card.label)}</div>
              <div class="qr-card-row-url">${escapeHtml(card.url)}</div>
              <div class="qr-card-row-date">Added ${card.createdAt}</div>
            </div>
            <div class="qr-card-row-actions">
              <button class="btn btn-sm btn-secondary" onclick="AdminApp.downloadCardQr('${card.id}')">Download</button>
              <button class="btn btn-sm btn-outline" onclick="AdminApp.copyCardQrUrl('${card.id}')">Copy URL</button>
              <button class="btn btn-sm" style="background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.3);color:#f87171;" onclick="AdminApp.deleteCardQr('${card.id}')">Remove</button>
            </div>
          </div>
        `).join('');
        cards.forEach(card => {
          const el = document.getElementById(`qrPrev_${card.id}`);
          if (el) el.innerHTML = QRCode.renderSVG({ text: card.url, size: 80, darkColor: '#0a0d14', lightColor: '#ffffff', rounded: true });
        });
      }
    }
    showAdminToast('🗑️ Card QR removed.');
  }



  function showAdminToast(msg) {
    CardApp.showToast(msg);
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

  global.AdminApp = {
    init: initAdmin,
    switchTab: switchTab,
    openNewLinkModal: () => openLinkModal(null),
    openEditLinkModal: (id) => openLinkModal(id),
    moveLink: moveLink,
    deleteLink: deleteLink,
    openNewServiceModal: () => openServiceModal(null),
    openEditServiceModal: (id) => openServiceModal(id),
    deleteService: deleteService,
    openNewPortfolioModal: () => openPortfolioModal(null),
    openEditPortfolioModal: (id) => openPortfolioModal(id),
    deletePortfolio: deletePortfolio,
    deleteLead: deleteLead,
    clearLeads: clearLeads,
    downloadCardQr: downloadCardQr,
    copyCardQrUrl: copyCardQrUrl,
    deleteCardQr: deleteCardQr
  };
})(typeof window !== "undefined" ? window : this);
