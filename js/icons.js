/**
 * Central SVG Icons Library for NFC Digital Business Card
 * Pixel-perfect, scalable icons for 30+ platforms and UI actions.
 */
(function(global) {
  const iconDefinitions = {
    // Communication & Direct Contact
    phone: `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>`,
    mail: `<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>`,
    whatsapp: `<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>`,
    message: `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`,
    telegram: `<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>`,

    // Professional & Social Networks
    linkedin: `<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>`,
    twitter: `<path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/>`,
    instagram: `<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>`,
    github: `<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>`,
    youtube: `<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>`,
    tiktok: `<path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>`,
    discord: `<path d="M18 6h0a14.5 14.5 0 0 0-4-1.3 9.4 9.4 0 0 0-.4 1.3 12.6 12.6 0 0 0-3.2 0 9.4 9.4 0 0 0-.4-1.3A14.5 14.5 0 0 0 6 6 15.6 15.6 0 0 0 3 17.5a14.3 14.3 0 0 0 4.5 2.3 11 11 0 0 0 1-1.7 9.8 9.8 0 0 1-1.5-.7c.1-.1.3-.2.4-.3a10.9 10.9 0 0 0 9.2 0c.1.1.3.2.4.3a9.8 9.8 0 0 1-1.5.7 11 11 0 0 0 1 1.7 14.3 14.3 0 0 0 4.5-2.3A15.6 15.6 0 0 0 18 6ZM8.5 15.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm7 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z"/>`,
    website: `<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>`,
    globe: `<circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>`,
    mapPin: `<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>`,
    calendar: `<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>`,
    dribbble: `<circle cx="12" cy="12" r="10"/><path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94"/><path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32"/><path d="M8.56 2.75c4.37 6 6 9.42 8 17.72"/>`,
    behance: `<path d="M3 8h5a2.5 2.5 0 0 1 0 5H3V8Z"/><path d="M3 13h5.5a2.5 2.5 0 0 1 0 5H3v-5Z"/><path d="M14 13h7a3.5 3.5 0 1 1-7 0Z"/><path d="M14 9h6"/>`,
    spotify: `<circle cx="12" cy="12" r="10"/><path d="M8 15a7 7 0 0 1 8 0"/><path d="M7 12a10 10 0 0 1 10 0"/><path d="M6 9a13 13 0 0 1 12 0"/>`,
    paypal: `<path d="M17.5 7h-5.2l-2.4 12h3.5l1-5h2.6c3.2 0 5.5-1.8 5.5-4.8 0-1.8-1.4-2.2-5-2.2z"/>`,
    link: `<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>`,
    briefcase: `<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>`,

    // UI & Action Icons
    nfc: `<path d="M6 8.32a7.43 7.43 0 0 1 0 7.36"/><path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58"/><path d="M12.91 4.1a15.91 15.91 0 0 1 0 15.8"/><path d="M16.37 2a20.16 20.16 0 0 1 0 20"/>`,
    vcard: `<path d="M16 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="8" r="2"/><path d="M9 14h6"/><path d="M9 17h6"/>`,
    download: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>`,
    share: `<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>`,
    userPlus: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>`,
    qrCode: `<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>`,
    sparkles: `<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>`,
    check: `<polyline points="20 6 9 17 4 12"/>`,
    copy: `<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>`,
    edit: `<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>`,
    trash: `<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>`,
    plus: `<line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/>`,
    arrowRight: `<line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/>`,
    arrowUpRight: `<line x1="7" x2="17" y1="17" y2="7"/><polyline points="7 7 17 7 17 17"/>`,
    sliders: `<line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="1" x2="7" y1="14" y2="14"/><line x1="9" x2="15" y1="8" y2="8"/><line x1="17" x2="23" y1="16" y2="16"/>`,
    barChart: `<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>`,
    shieldCheck: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>`,
    eye: `<path d="2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>`,
    refreshCw: `<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/>`,
    lock: `<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`,
    unlock: `<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>`,
    zap: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
    star: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
    close: `<line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/>`,
    checkCircle: `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`,
    chevronDown: `<polyline points="6 9 12 15 18 9"/>`,
    chevronUp: `<polyline points="18 15 12 9 6 15"/>`,
    gripVertical: `<circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>`
  };

  const platforms = [
    { id: 'phone', name: 'Phone Call', color: '#10b981', placeholder: '+1 (555) 000-0000', prefix: 'tel:' },
    { id: 'mail', name: 'Email Address', color: '#3b82f6', placeholder: 'hello@example.com', prefix: 'mailto:' },
    { id: 'whatsapp', name: 'WhatsApp', color: '#25d366', placeholder: 'https://wa.me/15550000000', prefix: 'https://wa.me/' },
    { id: 'telegram', name: 'Telegram', color: '#229ed9', placeholder: 'https://t.me/username', prefix: 'https://t.me/' },
    { id: 'linkedin', name: 'LinkedIn', color: '#0a66c2', placeholder: 'https://linkedin.com/in/username', prefix: 'https://linkedin.com/in/' },
    { id: 'twitter', name: 'X / Twitter', color: '#1da1f2', placeholder: 'https://x.com/username', prefix: 'https://x.com/' },
    { id: 'instagram', name: 'Instagram', color: '#e1306c', placeholder: 'https://instagram.com/username', prefix: 'https://instagram.com/' },
    { id: 'github', name: 'GitHub', color: '#24292e', placeholder: 'https://github.com/username', prefix: 'https://github.com/' },
    { id: 'youtube', name: 'YouTube', color: '#ff0000', placeholder: 'https://youtube.com/@channel', prefix: 'https://youtube.com/@' },
    { id: 'tiktok', name: 'TikTok', color: '#00f2fe', placeholder: 'https://tiktok.com/@username', prefix: 'https://tiktok.com/@' },
    { id: 'discord', name: 'Discord', color: '#5865f2', placeholder: 'https://discord.gg/invite', prefix: 'https://discord.gg/' },
    { id: 'website', name: 'Portfolio / Website', color: '#8b5cf6', placeholder: 'https://yoursite.com', prefix: 'https://' },
    { id: 'calendar', name: 'Book Meeting / Calendly', color: '#006bff', placeholder: 'https://calendly.com/user', prefix: 'https://calendly.com/' },
    { id: 'dribbble', name: 'Dribbble', color: '#ea4c89', placeholder: 'https://dribbble.com/user', prefix: 'https://dribbble.com/' },
    { id: 'behance', name: 'Behance', color: '#0057ff', placeholder: 'https://behance.net/user', prefix: 'https://behance.net/' },
    { id: 'spotify', name: 'Spotify', color: '#1db954', placeholder: 'https://open.spotify.com/artist/...', prefix: 'https://open.spotify.com/' },
    { id: 'paypal', name: 'PayPal / Payment', color: '#003087', placeholder: 'https://paypal.me/username', prefix: 'https://paypal.me/' },
    { id: 'mapPin', name: 'Office / Location', color: '#ef4444', placeholder: 'https://maps.google.com/?q=...', prefix: 'https://maps.google.com/?q=' },
    { id: 'link', name: 'Custom Link', color: '#6366f1', placeholder: 'https://anyurl.com', prefix: 'https://' }
  ];

  const Icons = {
    get: function(name, className, size) {
      const iconPath = iconDefinitions[name] || iconDefinitions.link;
      const s = size || 20;
      const cls = className || '';
      return `<svg class="icon-svg ${cls}" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconPath}</svg>`;
    },
    getPlatform: function(id) {
      return platforms.find(p => p.id === id) || platforms.find(p => p.id === 'link');
    },
    getAllPlatforms: function() {
      return platforms;
    }
  };

  global.Icons = Icons;
})(typeof window !== "undefined" ? window : this);
