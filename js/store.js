/**
 * Central State Store & Persistence Layer for NFC Digital Business Card
 * Supports reactive pub/sub, localStorage sync, lead capture, and analytics.
 */
(function(global) {
  const STORAGE_KEY = 'nfc_business_card_v2';
  const AUTH_KEY = 'nfc_admin_auth_session';

  const defaultData = {
    profile: {
      name: 'Alexander Vance',
      title: 'Founder & Creative Technologist',
      company: 'Apex Design & Tech Labs',
      pronouns: 'he/him',
      location: 'San Francisco, CA & Remote',
      bio: 'Pioneering the intersection of AI, spatial computing, and human-centered design. Built products scaled to 10M+ users. Angel investor, speaker & design advisor.',
      statusBadge: '🚀 Open for Advisory & Keynotes',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      nfcId: 'NFC-8849-VANC',
      verified: true
    },
    contact: {
      phone: '+1 (415) 890-2341',
      workPhone: '+1 (415) 555-0199',
      email: 'alexander@apextech.io',
      whatsapp: '+14158902341',
      website: 'https://apextech.io',
      address: '550 Montgomery St, San Francisco, CA 94111',
      quickActions: ['phone', 'mail', 'whatsapp', 'mapPin']
    },
    links: [
      {
        id: 'link-1',
        title: 'LinkedIn Network',
        subtitle: '18k+ followers & industry perspectives',
        url: 'https://linkedin.com/in/alexandervance',
        icon: 'linkedin',
        color: '#0a66c2',
        highlight: true,
        active: true,
        clicks: 842
      },
      {
        id: 'link-2',
        title: 'Direct WhatsApp',
        subtitle: 'Encrypted message or voice note',
        url: 'https://wa.me/14158902341',
        icon: 'whatsapp',
        color: '#25d366',
        highlight: true,
        active: true,
        clicks: 615
      },
      {
        id: 'link-3',
        title: 'Book a Strategy Call',
        subtitle: '30-minute 1-on-1 via Calendly',
        url: 'https://calendly.com',
        icon: 'calendar',
        color: '#006bff',
        highlight: false,
        active: true,
        clicks: 394
      },
      {
        id: 'link-4',
        title: 'X / Twitter Updates',
        subtitle: '@alexvance — Daily AI & product insights',
        url: 'https://x.com/alexvance',
        icon: 'twitter',
        color: '#1da1f2',
        highlight: false,
        active: true,
        clicks: 288
      },
      {
        id: 'link-5',
        title: 'GitHub Repositories',
        subtitle: 'Open-source models, UI kits & experiments',
        url: 'https://github.com/alexandervance',
        icon: 'github',
        color: '#24292e',
        highlight: false,
        active: true,
        clicks: 219
      },
      {
        id: 'link-6',
        title: 'Apex Studio Portfolio',
        subtitle: 'Design engineering case studies & client work',
        url: 'https://apextech.io',
        icon: 'website',
        color: '#8b5cf6',
        highlight: false,
        active: true,
        clicks: 508
      },
      {
        id: 'link-7',
        title: 'Instagram Visual Diary',
        subtitle: '@alex.vance — Architecture & travel',
        url: 'https://instagram.com/alex.vance',
        icon: 'instagram',
        color: '#e1306c',
        highlight: false,
        active: true,
        clicks: 172
      }
    ],
    services: [
      {
        id: 'srv-1',
        title: 'AI Product Architecture & Sprint',
        description: 'End-to-end design engineering from LLM latency tuning to sleek interactive web surfaces.',
        price: 'From $12,500',
        badge: 'Popular',
        icon: 'sparkles'
      },
      {
        id: 'srv-2',
        title: 'Executive Advisory & Mentorship',
        description: 'Strategic guidance on fundraising, team design scaling, and product roadmap for tech founders.',
        price: '$500 / hr',
        badge: 'Limited Spots',
        icon: 'briefcase'
      },
      {
        id: 'srv-3',
        title: 'Keynote & Tech Summit Speaking',
        description: 'Captivating talks on Spatial Computing, Artificial Intelligence, and the Future of Interface Design.',
        price: 'Custom',
        badge: 'Booking 2026',
        icon: 'zap'
      }
    ],
    portfolio: [
      {
        id: 'port-1',
        title: 'AetherOS Spatial System',
        category: 'Spatial UI / VisionOS',
        description: 'Next-generation mixed reality operating interface with sub-10ms gesture response.',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        link: 'https://apextech.io'
      },
      {
        id: 'port-2',
        title: 'NeuroFlow Biometrics',
        category: 'AI / Health Tech',
        description: 'Cognitive load monitoring platform powered by custom local machine learning models.',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
        link: 'https://apextech.io'
      },
      {
        id: 'port-3',
        title: 'TapSphere NFC Platform',
        category: 'Hardware & Web3',
        description: 'Encrypted hardware NFC smart cards with zero-latency profile handoff.',
        image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
        link: 'https://apextech.io'
      }
    ],
    theme: {
      themeId: 'obsidian', // obsidian | champagne | aurora | cyber | minimal | crimson
      accentColor: '#10b981',
      cardStyle: 'glass', // glass | solid | glow | minimal
      fontChoice: 'outfit', // outfit | jakarta | inter | space
      bgAnimation: 'mesh', // mesh | grid | orbs | none
      buttonShape: 'pill' // pill | rounded | sharp
    },
    leads: [
      {
        id: 'lead-1',
        name: 'Elena Rostova',
        email: 'elena.r@novacapital.com',
        phone: '+1 (212) 555-8912',
        company: 'Nova Capital Partners',
        note: 'Loved your keynote at the World Tech Expo. Would love to discuss a Series A advisory role.',
        date: '2026-10-24 14:32',
        status: 'Contacted'
      },
      {
        id: 'lead-2',
        name: 'Marcus Sterling',
        email: 'marcus@lumina-robotics.ai',
        phone: '+44 7911 123456',
        company: 'Lumina Robotics',
        note: 'Let us connect on spatial UI architectures for our medical robotic arm cockpit.',
        date: '2026-10-25 09:15',
        status: 'New'
      }
    ],
    analytics: {
      pageViews: 1482,
      vcardDownloads: 624,
      exchangeCount: 89,
      totalClicks: 3038
    },
    settings: {
      adminPasscode: 'admin123',
      showServices: true,
      showPortfolio: true,
      showLeadCapture: true,
      enableShareModal: true
    },
    qrConfig: {
      // The QR code can operate in Universal Smart QR mode (encodes destination directly or with ?r= param for universal mobile redirect)
      // or Fixed Permalink mode (encodes fixed card URL).
      permalinkUrl: '',          // auto-set to card.html URL on first load
      redirectEnabled: false,    // when true, redirects to redirectDest
      redirectDest: '',          // the target URL behind the QR
      redirectMode: 'smart',     // 'smart' (universal dynamic QR for all devices) or 'fixed' (fixed card permalink)
      // Per-card generator history (saved custom QR codes)
      savedCards: [
        { id: 'qrc-1', label: 'LinkedIn Profile', url: 'https://linkedin.com/in/alexandervance', createdAt: '2026-10-01' },
        { id: 'qrc-2', label: 'Portfolio Website', url: 'https://apextech.io', createdAt: '2026-10-10' }
      ]
    }
  };

  const CardStore = {
    _data: null,
    _listeners: [],

    init: function() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Deep merge with defaults to ensure all keys exist
          this._data = Object.assign({}, defaultData, parsed);
          // Ensure arrays and objects exist
          this._data.profile = Object.assign({}, defaultData.profile, parsed.profile);
          // If profile name was accidentally corrupted by testing (e.g. pipe chars or missing spaces), clean it
          if (this._data.profile.name && this._data.profile.name.includes('|')) {
            this._data.profile.name = this._data.profile.name.replace(/\|/g, ' ').replace(/\s+/g, ' ').trim();
          }
          this._data.contact = Object.assign({}, defaultData.contact, parsed.contact);
          this._data.theme = Object.assign({}, defaultData.theme, parsed.theme);
          this._data.settings = Object.assign({}, defaultData.settings, parsed.settings);
          this._data.analytics = Object.assign({}, defaultData.analytics, parsed.analytics);
          // Merge qrConfig
          this._data.qrConfig = Object.assign({}, defaultData.qrConfig, parsed.qrConfig || {});
          // Fix any corrupted or null-prefixed permalink URLs from file:// testing
          if (this._data.qrConfig.permalinkUrl && (this._data.qrConfig.permalinkUrl.startsWith('null') || this._data.qrConfig.permalinkUrl.startsWith('file://'))) {
            this._data.qrConfig.permalinkUrl = '';
          }
          if (!Array.isArray(this._data.qrConfig.savedCards)) this._data.qrConfig.savedCards = defaultData.qrConfig.savedCards;
          if (!Array.isArray(this._data.links)) this._data.links = defaultData.links;
          if (!Array.isArray(this._data.services)) this._data.services = defaultData.services;
          if (!Array.isArray(this._data.portfolio)) this._data.portfolio = defaultData.portfolio;
          if (!Array.isArray(this._data.leads)) this._data.leads = defaultData.leads;
        } else {
          this._data = JSON.parse(JSON.stringify(defaultData));
          this.save();
        }
      } catch (e) {
        console.error('Error loading card data from storage, using defaults', e);
        this._data = JSON.parse(JSON.stringify(defaultData));
      }

      // Listen for changes from other tabs
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            this._data = JSON.parse(e.newValue);
            this._notify('external_sync');
          } catch (err) {
            console.error('Storage sync error', err);
          }
        }
      });

      return this;
    },

    getData: function() {
      if (!this._data) this.init();
      return this._data;
    },

    save: function() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
        this._notify('save');
      } catch (e) {
        console.error('Error saving data to localStorage', e);
      }
    },

    subscribe: function(callback) {
      if (typeof callback === 'function') {
        this._listeners.push(callback);
      }
      return () => {
        this._listeners = this._listeners.filter(cb => cb !== callback);
      };
    },

    _notify: function(action) {
      const dataCopy = JSON.parse(JSON.stringify(this._data));
      this._listeners.forEach(cb => {
        try { cb(dataCopy, action); } catch (e) { console.error('Listener error', e); }
      });
      // Also dispatch custom DOM event
      window.dispatchEvent(new CustomEvent('nfc_card_data_changed', { detail: { action, data: dataCopy } }));
    },

    // Profile updates
    updateProfile: function(profileFields) {
      this._data.profile = Object.assign({}, this._data.profile, profileFields);
      this.save();
    },

    // Contact updates
    updateContact: function(contactFields) {
      this._data.contact = Object.assign({}, this._data.contact, contactFields);
      this.save();
    },

    // Theme updates
    updateTheme: function(themeFields) {
      this._data.theme = Object.assign({}, this._data.theme, themeFields);
      this.save();
    },

    // Settings updates
    updateSettings: function(settingsFields) {
      this._data.settings = Object.assign({}, this._data.settings, settingsFields);
      this.save();
    },

    // QR Configuration updates
    updateQrConfig: function(qrFields) {
      if (!this._data) this.init();
      if (!this._data.qrConfig) this._data.qrConfig = {};
      this._data.qrConfig = Object.assign({}, this._data.qrConfig, qrFields);
      this.save();
      return this._data.qrConfig;
    },

    // Links CRUD
    addLink: function(link) {
      const newLink = Object.assign({
        id: 'link-' + Date.now(),
        title: 'New Link',
        subtitle: '',
        url: 'https://',
        icon: 'link',
        color: '#6366f1',
        highlight: false,
        active: true,
        clicks: 0
      }, link);
      this._data.links.push(newLink);
      this.save();
      return newLink;
    },

    updateLink: function(id, fields) {
      const idx = this._data.links.findIndex(l => l.id === id);
      if (idx !== -1) {
        this._data.links[idx] = Object.assign({}, this._data.links[idx], fields);
        this.save();
        return this._data.links[idx];
      }
      return null;
    },

    deleteLink: function(id) {
      this._data.links = this._data.links.filter(l => l.id !== id);
      this.save();
    },

    reorderLinks: function(newLinksArray) {
      this._data.links = newLinksArray;
      this.save();
    },

    // Services CRUD
    addService: function(service) {
      const newService = Object.assign({
        id: 'srv-' + Date.now(),
        title: 'New Service',
        description: '',
        price: '$0',
        badge: '',
        icon: 'sparkles'
      }, service);
      this._data.services.push(newService);
      this.save();
      return newService;
    },

    updateService: function(id, fields) {
      const idx = this._data.services.findIndex(s => s.id === id);
      if (idx !== -1) {
        this._data.services[idx] = Object.assign({}, this._data.services[idx], fields);
        this.save();
        return this._data.services[idx];
      }
      return null;
    },

    deleteService: function(id) {
      this._data.services = this._data.services.filter(s => s.id !== id);
      this.save();
    },

    // Portfolio CRUD
    addPortfolio: function(item) {
      const newItem = Object.assign({
        id: 'port-' + Date.now(),
        title: 'New Project',
        category: 'Design & Code',
        description: '',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
        link: 'https://'
      }, item);
      this._data.portfolio.push(newItem);
      this.save();
      return newItem;
    },

    updatePortfolio: function(id, fields) {
      const idx = this._data.portfolio.findIndex(p => p.id === id);
      if (idx !== -1) {
        this._data.portfolio[idx] = Object.assign({}, this._data.portfolio[idx], fields);
        this.save();
        return this._data.portfolio[idx];
      }
      return null;
    },

    deletePortfolio: function(id) {
      this._data.portfolio = this._data.portfolio.filter(p => p.id !== id);
      this.save();
    },

    // Leads / CRM
    addLead: function(leadInfo) {
      const now = new Date();
      const dateStr = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + ' ' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0');

      const newLead = {
        id: 'lead-' + Date.now(),
        name: leadInfo.name || 'Anonymous Contact',
        email: leadInfo.email || '',
        phone: leadInfo.phone || '',
        company: leadInfo.company || '',
        note: leadInfo.note || '',
        date: dateStr,
        status: 'New'
      };

      this._data.leads.unshift(newLead);
      this._data.analytics.exchangeCount = (this._data.analytics.exchangeCount || 0) + 1;
      this.save();
      return newLead;
    },

    deleteLead: function(id) {
      this._data.leads = this._data.leads.filter(l => l.id !== id);
      this.save();
    },

    updateLeadStatus: function(id, status) {
      const lead = this._data.leads.find(l => l.id === id);
      if (lead) {
        lead.status = status;
        this.save();
      }
    },

    clearAllLeads: function() {
      this._data.leads = [];
      this.save();
    },

    exportLeadsCSV: function() {
      const headers = ['ID', 'Name', 'Email', 'Phone', 'Company', 'Note', 'Date', 'Status'];
      const rows = this._data.leads.map(lead => [
        `"${lead.id}"`,
        `"${(lead.name || '').replace(/"/g, '""')}"`,
        `"${(lead.email || '').replace(/"/g, '""')}"`,
        `"${(lead.phone || '').replace(/"/g, '""')}"`,
        `"${(lead.company || '').replace(/"/g, '""')}"`,
        `"${(lead.note || '').replace(/"/g, '""')}"`,
        `"${lead.date}"`,
        `"${lead.status}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `nfc_leads_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    // Analytics Trackers
    trackPageView: function() {
      if (!this._data) this.init();
      this._data.analytics.pageViews = (this._data.analytics.pageViews || 0) + 1;
      this.save();
    },

    trackVCardDownload: function() {
      if (!this._data) this.init();
      this._data.analytics.vcardDownloads = (this._data.analytics.vcardDownloads || 0) + 1;
      this.save();
    },

    trackLinkClick: function(linkId) {
      if (!this._data) this.init();
      const link = this._data.links.find(l => l.id === linkId);
      if (link) {
        link.clicks = (link.clicks || 0) + 1;
      }
      this._data.analytics.totalClicks = (this._data.analytics.totalClicks || 0) + 1;
      this.save();
    },

    // Backup & Restore
    exportJSON: function() {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this._data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `nfc_card_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    },

    importJSON: function(jsonString) {
      try {
        const parsed = JSON.parse(jsonString);
        if (parsed && parsed.profile && parsed.links) {
          this._data = parsed;
          this.save();
          return { success: true };
        } else {
          return { success: false, error: 'Invalid backup file structure' };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
    },

    resetToDefault: function() {
      this._data = JSON.parse(JSON.stringify(defaultData));
      this.save();
      return this._data;
    },

    // Auth Session
    isAuthenticated: function() {
      return sessionStorage.getItem(AUTH_KEY) === 'true';
    },

    login: function(passcode) {
      const actualPasscode = (this._data && this._data.settings && this._data.settings.adminPasscode) || 'admin123';
      if (passcode === actualPasscode) {
        sessionStorage.setItem(AUTH_KEY, 'true');
        return true;
      }
      return false;
    },

    logout: function() {
      sessionStorage.removeItem(AUTH_KEY);
    },

    // Helper to read local image file (< 5MB) as DataURL
    readImageFile: function(file, callback, errorCallback) {
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        if (typeof errorCallback === 'function') errorCallback('Please select a valid image file (PNG, JPG, WebP, SVG).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        if (typeof errorCallback === 'function') errorCallback('Image must be smaller than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = function(e) {
        if (typeof callback === 'function') callback(e.target.result);
      };
      reader.onerror = function() {
        if (typeof errorCallback === 'function') errorCallback('Failed to read image file.');
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * SoundFx - Lightweight procedural Web Audio API synthesizer
   * Provides ultra-crisp tactile audio feedback with zero external sound files.
   */
  const SoundFx = {
    ctx: null,
    muted: false,

    init: function() {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
    },

    setMuted: function(isMuted) {
      this.muted = Boolean(isMuted);
    },

    toggleMute: function() {
      this.muted = !this.muted;
      return this.muted;
    },

    // Subtle tactile tap / button click
    tap: function() {
      if (this.muted) return;
      try {
        this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(750, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(350, this.ctx.currentTime + 0.035);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.035);
      } catch (e) {}
    },

    // NFC Contactless Tap chime (like Apple Pay / Google Wallet)
    nfcChime: function() {
      if (this.muted) return;
      try {
        this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const now = this.ctx.currentTime;
        [587.33, 880].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.09);
          gain.gain.setValueAtTime(0.12, now + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.28);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.09);
          osc.stop(now + idx * 0.09 + 0.28);
        });
      } catch (e) {}
    },

    // Success melodic arpeggio (for contact save or lead submission)
    success: function() {
      if (this.muted) return;
      try {
        this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.065);
          gain.gain.setValueAtTime(0.09, now + idx * 0.065);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.065 + 0.22);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.065);
          osc.stop(now + idx * 0.065 + 0.22);
        });
      } catch (e) {}
    }
  };

  // Initialize immediately
  CardStore.init();

  global.CardStore = CardStore;
  global.SoundFx = SoundFx;
})(typeof window !== "undefined" ? window : this);
