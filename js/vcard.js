/**
 * vCard 3.0 Standard Generator & Exporter
 * Generates universally compatible .vcf files for iOS, Android, and desktop contacts.
 */
(function(global) {
  const VCard = {
    generate: function(profile, contact, links) {
      const p = profile || {};
      const c = contact || {};
      const l = links || [];

      // Split name into first and last name
      const nameParts = (p.name || 'Contact').trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      let lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${lastName};${firstName};;;`,
        `FN:${p.name || 'Alexander Vance'}`
      ];

      if (p.company) {
        lines.push(`ORG:${p.company}`);
      }
      if (p.title) {
        lines.push(`TITLE:${p.title}`);
      }
      if (c.phone) {
        lines.push(`TEL;TYPE=CELL,VOICE:${c.phone}`);
      }
      if (c.workPhone) {
        lines.push(`TEL;TYPE=WORK,VOICE:${c.workPhone}`);
      }
      if (c.email) {
        lines.push(`EMAIL;TYPE=PREF,INTERNET:${c.email}`);
      }
      if (c.website) {
        lines.push(`URL:${c.website}`);
      }
      if (c.address) {
        lines.push(`ADR;TYPE=WORK:;;${c.address.replace(/,/g, ';')};;;;`);
      }

      // Add social links as notes or custom X-fields
      const socialNotes = [];
      l.forEach(item => {
        if (item.active && item.url) {
          lines.push(`X-SOCIALPROFILE;type=${item.icon || 'custom'}:${item.url}`);
          socialNotes.push(`${item.title}: ${item.url}`);
        }
      });

      let fullBio = p.bio || '';
      if (socialNotes.length > 0) {
        fullBio += (fullBio ? '\\n\\n' : '') + 'Connect: ' + socialNotes.join(' | ');
      }
      if (fullBio) {
        // Escape newlines for vCard format
        const cleanBio = fullBio.replace(/\n/g, '\\n');
        lines.push(`NOTE:${cleanBio}`);
      }

      // Add avatar photo URL if available
      if (p.avatar && (p.avatar.startsWith('http://') || p.avatar.startsWith('https://'))) {
        lines.push(`PHOTO;VALUE=URI:${p.avatar}`);
      }

      lines.push('REV:' + new Date().toISOString());
      lines.push('END:VCARD');

      return lines.join('\r\n');
    },

    download: function(profile, contact, links) {
      const vcardString = this.generate(profile, contact, links);
      const blob = new Blob([vcardString], { type: 'text/vcard;charset=utf-8' });
      const filename = `${(profile.name || 'contact').toLowerCase().replace(/\s+/g, '_')}.vcf`;

      // Check if navigator.canShare with files is supported (mobile native contact add)
      const file = new File([blob], filename, { type: 'text/vcard' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: profile.name || 'Contact',
          text: `Save contact info for ${profile.name || 'Contact'}`
        }).catch(err => {
          if (err.name !== 'AbortError') {
            this.fallbackDownload(blob, filename);
          }
        });
        return;
      }

      this.fallbackDownload(blob, filename);
    },

    fallbackDownload: function(blob, filename) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }
  };

  global.VCard = VCard;
})(typeof window !== "undefined" ? window : this);
