/**
 * TapCard Pro - Authentication, Roles & Security Manager
 * Handles User / Admin signups, logins, Gmail OTP verification codes,
 * route guards, and User/Admin profiles.
 */
(function(global) {
  const USERS_KEY = 'nfc_app_users_v2';
  const SESSION_KEY = 'nfc_active_user_session';
  const OTP_KEY = 'nfc_pending_gmail_otp';

  // Seed default admin and sample user accounts
  const defaultUsers = [
    {
      id: 'usr-admin-1',
      username: 'admin',
      email: 'admin@tapcard.pro',
      password: 'admin123',
      name: 'Alexander Vance',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      title: 'Founder & System Administrator',
      company: 'Apex Design & Tech Labs',
      phone: '+1 (415) 890-2341',
      bio: 'Pioneering AI interfaces and physical NFC smart card systems.',
      createdAt: '2026-01-01'
    },
    {
      id: 'usr-user-1',
      username: 'alex',
      email: 'alex.user@gmail.com',
      password: 'user123',
      name: 'Alex Johnson',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      title: 'Product Designer',
      company: 'NextGen Creative Studio',
      phone: '+1 (555) 234-5678',
      bio: 'Digital nomad & creative technologist exploring interactive identity cards.',
      createdAt: '2026-02-15'
    }
  ];

  const AuthStore = {
    _users: null,
    _currentUser: undefined, // undefined so getCurrentUser initializes
    _listeners: [],

    init: function() {
      // 1. Load users list from storage or seed defaults
      try {
        const storedUsers = localStorage.getItem(USERS_KEY);
        if (storedUsers) {
          this._users = JSON.parse(storedUsers);
        } else {
          this._users = JSON.parse(JSON.stringify(defaultUsers));
          this.saveUsers();
        }
      } catch (e) {
        this._users = JSON.parse(JSON.stringify(defaultUsers));
      }

      // Ensure admin account exists with role: 'admin'
      const adminExists = this._users.find(u => u.username === 'admin' || u.role === 'admin');
      if (!adminExists) {
        this._users.unshift(defaultUsers[0]);
        this.saveUsers();
      }

      // 2. Load active session
      try {
        const session = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
        if (session) {
          const parsed = JSON.parse(session);
          // Refresh user data from users list
          const fresh = this._users.find(u => u.id === parsed.id);
          this._currentUser = fresh || parsed;
        } else {
          this._currentUser = null;
        }
      } catch (e) {
        this._currentUser = null;
      }

      // 3. Listen for cross-tab auth state changes
      if (!this._storageListenerAttached && typeof window !== 'undefined') {
        this._storageListenerAttached = true;
        window.addEventListener('storage', (e) => {
          if (e.key === SESSION_KEY || e.key === USERS_KEY) {
            this.init();
            this.notify();
          }
        });
      }
    },

    saveUsers: function() {
      try {
        localStorage.setItem(USERS_KEY, JSON.stringify(this._users));
      } catch (e) {}
    },

    getUsers: function() {
      if (!this._users) this.init();
      return this._users;
    },

    getCurrentUser: function() {
      if (this._currentUser === undefined || !this._users) this.init();
      return this._currentUser;
    },

    isLoggedIn: function() {
      return !!this.getCurrentUser();
    },

    isAdmin: function() {
      const u = this.getCurrentUser();
      return !!(u && u.role === 'admin');
    },

    // Subscribe to auth state updates
    subscribe: function(callback) {
      if (typeof callback === 'function') {
        this._listeners.push(callback);
      }
    },

    notify: function() {
      this._listeners.forEach(cb => {
        try { cb(this._currentUser); } catch (e) {}
      });
      this.renderNavAuth();
    },

    // Standard Login with Username or Email + Password
    login: function(identifier, password, remember = true) {
      if (!this._users) this.init();
      const idClean = String(identifier || '').trim().toLowerCase();
      const passClean = String(password || '');

      const user = this._users.find(u =>
        (u.username.toLowerCase() === idClean || u.email.toLowerCase() === idClean) &&
        u.password === passClean
      );

      if (!user) {
        return { success: false, error: 'Invalid username/email or password.' };
      }

      this._currentUser = user;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      if (remember) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      }
      this.notify();
      return { success: true, user: user };
    },

    // Quick Login by User Object (used after Gmail OTP verification)
    loginUserObject: function(user, remember = true) {
      this._currentUser = user;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      if (remember) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      }
      this.notify();
      return { success: true, user: user };
    },

    // Sign Up new account
    signup: function(data) {
      if (!this._users) this.init();
      const name = String(data.name || '').trim();
      const username = String(data.username || '').trim().toLowerCase();
      const email = String(data.email || '').trim().toLowerCase();
      const password = String(data.password || '');
      const role = data.role === 'admin' ? 'admin' : 'user';

      if (!name) return { success: false, error: 'Please enter your full name.' };
      if (!username || username.length < 3) return { success: false, error: 'Username must be at least 3 characters.' };
      if (!email || !email.includes('@')) return { success: false, error: 'Please enter a valid email address.' };
      if (!password || password.length < 5) return { success: false, error: 'Password must be at least 5 characters.' };

      // Check if username or email already taken
      if (this._users.some(u => u.username.toLowerCase() === username)) {
        return { success: false, error: 'Username is already taken. Please choose another.' };
      }
      if (this._users.some(u => u.email.toLowerCase() === email)) {
        return { success: false, error: 'Email is already registered. Please sign in instead.' };
      }

      // If signing up as admin, verify admin passcode
      if (role === 'admin') {
        const requiredPasscode = (typeof CardStore !== 'undefined' && CardStore.getData().settings.adminPasscode) || 'admin123';
        if (data.adminPasscode !== requiredPasscode) {
          return { success: false, error: 'Invalid Admin Security Passcode. Only authorized personnel can create admin accounts.' };
        }
      }

      const newUser = {
        id: 'usr-' + Date.now(),
        name: name,
        username: username,
        email: email,
        password: password,
        role: role,
        avatar: data.avatar || (role === 'admin'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'),
        title: data.title || (role === 'admin' ? 'Administrator' : 'Digital Creator'),
        company: data.company || 'TapCard Member',
        phone: data.phone || '',
        bio: data.bio || 'New TapCard Pro member.',
        createdAt: new Date().toISOString().split('T')[0]
      };

      this._users.push(newUser);
      this.saveUsers();
      this.loginUserObject(newUser);
      return { success: true, user: newUser };
    },

    // Log Out
    logout: function() {
      this._currentUser = null;
      try {
        sessionStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(SESSION_KEY);
      } catch (e) {}
      this.notify();
      if (typeof window !== 'undefined' && window.location.pathname.includes('admin.html')) {
        window.location.reload();
      }
    },

    // Update Profile
    updateUserProfile: function(userId, fields) {
      if (!this._users) this.init();
      const idx = this._users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        this._users[idx] = Object.assign({}, this._users[idx], fields);
        this.saveUsers();

        if (this._currentUser && this._currentUser.id === userId) {
          this._currentUser = this._users[idx];
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(this._currentUser));
          localStorage.setItem(SESSION_KEY, JSON.stringify(this._currentUser));
        }
        this.notify();
        return { success: true, user: this._users[idx] };
      }
      return { success: false, error: 'User not found' };
    },

    // ─── GMAIL OTP AUTHENTICATION ───
    sendGmailOtp: function(email, purpose = 'Verification') {
      const cleanEmail = String(email || '').trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return { success: false, error: 'Please enter a valid Gmail address.' };
      }

      // Generate secure 6-digit random code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const otpData = {
        email: cleanEmail,
        code: code,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes validity
        purpose: purpose
      };

      try {
        sessionStorage.setItem(OTP_KEY, JSON.stringify(otpData));
      } catch (e) {}

      // Display simulated incoming Gmail notification banner
      this.showGmailPushNotification(cleanEmail, code, purpose);

      return { success: true, code: code, email: cleanEmail };
    },

    verifyGmailOtp: function(email, inputCode) {
      const cleanEmail = String(email || '').trim().toLowerCase();
      const cleanCode = String(inputCode || '').trim();

      try {
        const stored = sessionStorage.getItem(OTP_KEY);
        if (!stored) {
          return { success: false, error: 'No verification code found. Please request a new code.' };
        }
        const parsed = JSON.parse(stored);
        if (Date.now() > parsed.expiresAt) {
          sessionStorage.removeItem(OTP_KEY);
          return { success: false, error: 'Verification code has expired. Please request a new one.' };
        }
        if (parsed.email !== cleanEmail) {
          return { success: false, error: 'Email does not match verification request.' };
        }
        if (parsed.code !== cleanCode) {
          return { success: false, error: 'Incorrect verification code. Please check your Gmail.' };
        }

        // Successfully verified
        sessionStorage.removeItem(OTP_KEY);
        return { success: true };
      } catch (e) {
        return { success: false, error: 'Verification failed. Please try again.' };
      }
    },

    // Show simulated Gmail push notification at top-right of window
    showGmailPushNotification: function(email, code, purpose) {
      let notifEl = document.getElementById('gmailPushNotification');
      if (!notifEl) {
        notifEl = document.createElement('div');
        notifEl.id = 'gmailPushNotification';
        notifEl.className = 'gmail-push-notification';
        document.body.appendChild(notifEl);
      }

      notifEl.innerHTML = `
        <div class="gmail-push-header">
          <div class="gmail-push-app">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <span>Gmail • TapCard Security</span>
          </div>
          <span class="gmail-push-time">Just now</span>
        </div>
        <div class="gmail-push-sender">TapCard Auth &lt;security@tapcard.pro&gt;</div>
        <div class="gmail-push-snippet">
          Your Gmail verification code is <span class="gmail-push-code-chip">${code}</span>. Valid for 5 minutes.
        </div>
        <div class="gmail-push-actions">
          <button class="gmail-push-btn primary" id="btnAutoFillOtp">⚡ One-Click Auto-Fill</button>
          <button class="gmail-push-btn" id="btnCopyOtpCode">Copy Code</button>
          <button class="gmail-push-btn" id="btnDismissOtpNotif" style="margin-left:auto;">Dismiss</button>
        </div>
      `;

      // Trigger slide in animation
      requestAnimationFrame(() => {
        notifEl.classList.add('visible');
      });

      // Auto-fill button
      const btnFill = notifEl.querySelector('#btnAutoFillOtp');
      if (btnFill) {
        btnFill.addEventListener('click', (e) => {
          e.stopPropagation();
          AuthApp.fillOtpCode(code);
          notifEl.classList.remove('visible');
        });
      }

      // Copy code button
      const btnCopy = notifEl.querySelector('#btnCopyOtpCode');
      if (btnCopy) {
        btnCopy.addEventListener('click', (e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(code).then(() => {
            btnCopy.textContent = 'Copied!';
            setTimeout(() => { btnCopy.textContent = 'Copy Code'; }, 1500);
          });
        });
      }

      // Dismiss button
      const btnDismiss = notifEl.querySelector('#btnDismissOtpNotif');
      if (btnDismiss) {
        btnDismiss.addEventListener('click', (e) => {
          e.stopPropagation();
          notifEl.classList.remove('visible');
        });
      }

      // Auto-dismiss after 15 seconds
      setTimeout(() => {
        if (notifEl) notifEl.classList.remove('visible');
      }, 15000);
    },

    // ─── DYNAMIC NAVIGATION AUTH CONTROLS ───
    renderNavAuth: function() {
      const navActions = document.querySelector('.site-nav .nav-actions');
      const mobileCta = document.querySelector('.mobile-menu-drawer .mobile-menu-cta');
      const currentUser = this.getCurrentUser();
      const isAdmin = this.isAdmin();

      // Globally toggle admin-only buttons & links across the entire document
      document.querySelectorAll('.btn-admin-suite').forEach(el => {
        el.style.display = isAdmin ? '' : 'none';
      });
      document.querySelectorAll('.btn-user-get-started').forEach(el => {
        el.style.display = !isAdmin ? '' : 'none';
      });

      // Render for desktop navbar
      if (navActions) {
        let authContainer = document.getElementById('desktopNavAuth');
        if (!authContainer) {
          authContainer = document.createElement('div');
          authContainer.id = 'desktopNavAuth';
          authContainer.className = 'nav-auth-wrap';
          navActions.appendChild(authContainer);
        }

        if (!currentUser) {
          // GUEST: Show Login & Sign Up, HIDE Admin Suite completely
          navActions.querySelectorAll('.btn-admin-suite, a[href="admin.html"]').forEach(el => el.style.display = 'none');
          authContainer.innerHTML = `
            <button class="btn btn-outline btn-sm" onclick="AuthApp.openModal('login')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
              <span>Log In</span>
            </button>
            <button class="btn btn-primary btn-sm" onclick="AuthApp.openModal('signup')">
              <span>Sign Up</span>
            </button>
          `;
        } else if (isAdmin) {
          // ADMIN: Show Admin Suite button + Admin profile pill
          navActions.querySelectorAll('.btn-admin-suite, a[href="admin.html"]').forEach(el => el.style.display = 'inline-flex');
          authContainer.innerHTML = `
            <a href="admin.html" class="btn btn-primary btn-sm btn-admin-suite" style="box-shadow: 0 0 16px rgba(16,185,129,0.35);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
              <span>Admin Suite</span>
            </a>
            <div class="nav-user-pill" id="navUserPill" onclick="AuthApp.toggleUserDropdown(event)">
              <img src="${currentUser.avatar || ''}" class="nav-user-avatar" alt="${currentUser.name}" />
              <span>${escapeHtml(currentUser.name.split(' ')[0])}</span>
              <span class="nav-user-role-badge admin">ADMIN</span>
              <div class="nav-user-menu">
                <button class="nav-menu-item" onclick="AuthApp.openProfileModal()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Admin Profile</button>
                <a href="admin.html" class="nav-menu-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg> Admin Control Center</a>
                <a href="card.html?preview=true" target="_blank" class="nav-menu-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg> Live Card Preview</a>
                <div style="height:1px; background:rgba(255,255,255,0.08); margin:4px 0;"></div>
                <button class="nav-menu-item logout" onclick="AuthStore.logout()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg> Log Out</button>
              </div>
            </div>
          `;
        } else {
          // NORMAL USER: HIDE Admin Suite button! Show User Profile pill
          navActions.querySelectorAll('.btn-admin-suite, a[href="admin.html"]').forEach(el => el.style.display = 'none');
          authContainer.innerHTML = `
            <div class="nav-user-pill" id="navUserPill" onclick="AuthApp.toggleUserDropdown(event)">
              <img src="${currentUser.avatar || ''}" class="nav-user-avatar" alt="${currentUser.name}" />
              <span>${escapeHtml(currentUser.name.split(' ')[0])}</span>
              <span class="nav-user-role-badge user">USER</span>
              <div class="nav-user-menu">
                <button class="nav-menu-item" onclick="AuthApp.openProfileModal()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> My Profile</button>
                <a href="card.html" target="_blank" class="nav-menu-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg> My Digital Card</a>
                <div style="height:1px; background:rgba(255,255,255,0.08); margin:4px 0;"></div>
                <button class="nav-menu-item logout" onclick="AuthStore.logout()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg> Log Out</button>
              </div>
            </div>
          `;
        }
      }

      // Render for mobile drawer
      if (mobileCta) {
        mobileCta.querySelectorAll('.btn-admin-suite, a[href="admin.html"]').forEach(el => el.style.display = isAdmin ? 'block' : 'none');
        let mobileAuthWrap = document.getElementById('mobileNavAuthWrap');
        if (!mobileAuthWrap) {
          mobileAuthWrap = document.createElement('div');
          mobileAuthWrap.id = 'mobileNavAuthWrap';
          mobileAuthWrap.style.cssText = 'display:flex; flex-direction:column; gap:0.5rem; margin-top:0.75rem;';
          mobileCta.appendChild(mobileAuthWrap);
        }

        if (!currentUser) {
          mobileAuthWrap.innerHTML = `
            <button class="btn btn-outline" style="width:100%;" onclick="AuthApp.openModal('login')">Log In</button>
            <button class="btn btn-primary" style="width:100%;" onclick="AuthApp.openModal('signup')">Sign Up</button>
          `;
        } else {
          mobileAuthWrap.innerHTML = `
            <div style="display:flex; align-items:center; gap:0.75rem; padding:0.75rem; background:rgba(255,255,255,0.04); border-radius:12px; margin-bottom:0.4rem;">
              <img src="${currentUser.avatar || ''}" style="width:36px; height:36px; border-radius:50%; object-fit:cover;" />
              <div>
                <div style="font-weight:700; font-size:0.9rem;">${escapeHtml(currentUser.name)}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(currentUser.email)}</div>
              </div>
            </div>
            <button class="btn btn-secondary" style="width:100%;" onclick="AuthApp.openProfileModal()">My Profile</button>
            <button class="btn btn-outline" style="width:100%; color:#f87171;" onclick="AuthStore.logout()">Log Out</button>
          `;
        }
      }
    },

    // ─── ADMIN PAGE GATEKEEPER ROUTE GUARD ───
    checkAdminRouteGuard: function() {
      const isCurrentAdmin = this.isAdmin();
      const currentUser = this.getCurrentUser();
      let gatekeeper = document.getElementById('adminGatekeeper');

      if (!isCurrentAdmin) {
        // Completely hide admin layout
        const adminLayout = document.querySelector('.admin-layout');
        const adminWorkspace = document.querySelector('.admin-workspace');
        const adminAside = document.querySelector('.admin-sidebar');
        const adminHeader = document.querySelector('.admin-header');
        if (adminLayout) adminLayout.style.display = 'none';
        if (adminWorkspace) adminWorkspace.style.display = 'none';
        if (adminAside) adminAside.style.display = 'none';
        if (adminHeader) adminHeader.style.display = 'none';

        if (!gatekeeper) {
          gatekeeper = document.createElement('div');
          gatekeeper.id = 'adminGatekeeper';
          gatekeeper.className = 'admin-gatekeeper-overlay';
          document.body.appendChild(gatekeeper);
        }
        gatekeeper.style.display = 'flex';

        const accessDeniedMessage = (currentUser && !isCurrentAdmin)
          ? `<div class="admin-access-denied-badge">
              <strong>⛔ Access Denied:</strong> You are logged in as <strong>${escapeHtml(currentUser.name)} (${currentUser.role})</strong>. This suite requires administrator privileges.
            </div>`
          : '';

        gatekeeper.innerHTML = `
          <div class="admin-gatekeeper-card">
            <div class="admin-lock-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h2 style="font-size:1.45rem; font-weight:700; margin:0 0 0.4rem;">Admin Control Center</h2>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin:0 0 1.25rem;">
              Restricted area. Please sign in with your administrator credentials.
            </p>

            ${accessDeniedMessage}

            <form id="gatekeeperAdminForm" onsubmit="AuthStore.submitGatekeeper(event)" style="display:flex; flex-direction:column; gap:0.9rem; text-align:left;">
              <div class="auth-field">
                <label class="auth-label">Admin Username or Email</label>
                <div class="auth-input-wrap">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input type="text" class="auth-input" id="gateAdminUser" placeholder="admin or admin@tapcard.pro" value="admin" onkeydown="if(event.key==='Enter')AuthStore.submitGatekeeper(event)" required />
                </div>
              </div>

              <div class="auth-field">
                <label class="auth-label">Admin Password</label>
                <div class="auth-input-wrap">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input type="password" class="auth-input" id="gateAdminPass" placeholder="••••••••" value="admin123" onkeydown="if(event.key==='Enter')AuthStore.submitGatekeeper(event)" required />
                </div>
              </div>

              <div id="gatekeeperError" style="font-size:0.8rem; color:#f87171; display:none;"></div>

              <button type="button" id="gatekeeperSubmitBtn" onclick="AuthStore.submitGatekeeper(event)" class="auth-submit-btn" style="margin-top:0.4rem;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
                Authorize & Open Admin Panel
              </button>

              <button type="button" class="auth-method-toggle" onclick="AuthApp.openModal('login', 'admin')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                Authenticate with Gmail OTP Code
              </button>
            </form>

            <div style="margin-top:1.5rem; padding-top:1rem; border-top:1px solid rgba(255,255,255,0.06); display:flex; justify-content:space-between; align-items:center;">
              <a href="index.html" class="btn btn-xs btn-outline" style="text-decoration:none;">
                ← Back to Home
              </a>
              <span style="font-size:0.75rem; color:var(--text-muted);">
                Default: <code>admin</code> / <code>admin123</code>
              </span>
            </div>
          </div>
        `;

        if (!this._gatekeeperKeydownAttached && typeof window !== 'undefined') {
          this._gatekeeperKeydownAttached = true;
          window.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              const gate = document.getElementById('adminGatekeeper');
              if (gate && gate.style.display !== 'none') {
                AuthStore.submitGatekeeper(e);
              }
            }
          });
        }

        return false;
      } else {
        // Authorized Admin: show admin workspace
        if (gatekeeper) gatekeeper.style.display = 'none';
        const adminLayout = document.querySelector('.admin-layout');
        const adminWorkspace = document.querySelector('.admin-workspace');
        const adminAside = document.querySelector('.admin-sidebar');
        const adminHeader = document.querySelector('.admin-header');
        if (adminLayout) adminLayout.style.display = '';
        if (adminWorkspace) adminWorkspace.style.display = '';
        if (adminAside) adminAside.style.display = '';
        if (adminHeader) adminHeader.style.display = '';
        return true;
      }
    },

    submitGatekeeper: function(e) {
      if (e && e.preventDefault) e.preventDefault();
      const uInput = document.getElementById('gateAdminUser');
      const pInput = document.getElementById('gateAdminPass');
      const u = uInput ? uInput.value : 'admin';
      const p = pInput ? pInput.value : 'admin123';
      const errEl = document.getElementById('gatekeeperError');
      const res = this.login(u, p, true);

      if (!res.success) {
        if (errEl) {
          errEl.textContent = res.error;
          errEl.style.display = 'block';
        }
      } else if (res.user.role !== 'admin') {
        if (errEl) {
          errEl.textContent = 'User account authorized, but Administrator privileges required.';
          errEl.style.display = 'block';
        }
      } else {
        const gatekeeper = document.getElementById('adminGatekeeper');
        if (gatekeeper) {
          gatekeeper.style.display = 'none';
          gatekeeper.remove();
        }
        const adminLayout = document.querySelector('.admin-layout');
        const adminWorkspace = document.querySelector('.admin-workspace');
        const adminAside = document.querySelector('.admin-sidebar');
        const adminHeader = document.querySelector('.admin-header');
        if (adminLayout) adminLayout.style.display = '';
        if (adminWorkspace) adminWorkspace.style.display = '';
        if (adminAside) adminAside.style.display = '';
        if (adminHeader) adminHeader.style.display = '';
        if (typeof AdminApp !== 'undefined') AdminApp.init();
        const uObj = this.getCurrentUser();
        if (uObj) {
          const av = document.getElementById('adminHeaderAvatar');
          const nm = document.getElementById('adminHeaderName');
          if (av && uObj.avatar) av.src = uObj.avatar;
          if (nm && uObj.name) nm.textContent = uObj.name.split(' ')[0] + ' (Admin)';
        }
      }
    }
  };

  // ─── AUTH MODAL & PROFILE UI CONTROLLER ───
  const AuthApp = {
    _activeRole: 'user', // 'user' or 'admin'
    _activeTab: 'login',  // 'login' or 'signup'
    _loginMethod: 'password', // 'password' or 'otp'
    _pendingOtpEmail: '',

    init: function() {
      AuthStore.init();
      AuthStore.renderNavAuth();

      // Close dropdowns on background click
      document.addEventListener('click', (e) => {
        const pill = document.getElementById('navUserPill');
        if (pill && !pill.contains(e.target)) {
          pill.classList.remove('open');
        }
      });
    },

    toggleUserDropdown: function(e) {
      e.stopPropagation();
      const pill = document.getElementById('navUserPill');
      if (pill) pill.classList.toggle('open');
    },

    openModal: function(tab = 'login', role = 'user') {
      this._activeTab = tab;
      this._activeRole = role;
      this._loginMethod = 'password';

      let backdrop = document.getElementById('authModalBackdrop');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'authModalBackdrop';
        backdrop.className = 'auth-backdrop';
        document.body.appendChild(backdrop);
      }

      this.renderModalContent();
      requestAnimationFrame(() => backdrop.classList.add('active'));
    },

    closeModal: function() {
      const backdrop = document.getElementById('authModalBackdrop');
      if (backdrop) backdrop.classList.remove('active');
    },

    renderModalContent: function() {
      const backdrop = document.getElementById('authModalBackdrop');
      if (!backdrop) return;

      const isLogin = this._activeTab === 'login';
      const isAdmin = this._activeRole === 'admin';

      backdrop.innerHTML = `
        <div class="auth-card" onclick="event.stopPropagation()">
          <div class="auth-header">
            <button class="auth-close-btn" onclick="AuthApp.closeModal()">&times;</button>
            <div class="auth-brand-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 8.32a7.43 7.43 0 0 1 0 7.36"/><path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58"/><path d="M12.91 4.1a15.91 15.91 0 0 1 0 15.8"/></svg>
              <span>TapCard Authentication</span>
            </div>
            <h3 class="auth-title">${isAdmin ? '🛡️ Administrator Access' : '👋 Welcome to TapCard'}</h3>
            <p class="auth-subtitle">${isLogin ? 'Sign in to access your digital card & profile' : 'Create your digital identity account'}</p>
          </div>

          <!-- Role Selector -->
          <div class="auth-role-tabs">
            <button class="auth-role-btn ${!isAdmin ? 'active' : ''}" onclick="AuthApp.setRole('user')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>User Account</span>
            </button>
            <button class="auth-role-btn admin ${isAdmin ? 'active' : ''}" onclick="AuthApp.setRole('admin')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Admin Account</span>
            </button>
          </div>

          <!-- Action Mode Tabs -->
          <div class="auth-action-tabs">
            <button class="auth-action-tab ${isLogin ? 'active' : ''}" onclick="AuthApp.setTab('login')">Log In</button>
            <button class="auth-action-tab ${!isLogin ? 'active' : ''}" onclick="AuthApp.setTab('signup')">Sign Up</button>
          </div>

          <div class="auth-body" id="authModalBody">
            ${this.renderFormHTML()}
          </div>
        </div>
      `;

      backdrop.onclick = () => AuthApp.closeModal();
      this.bindFormEvents();
    },

    setRole: function(role) {
      this._activeRole = role;
      this.renderModalContent();
    },

    setTab: function(tab) {
      this._activeTab = tab;
      this.renderModalContent();
    },

    renderFormHTML: function() {
      const isLogin = this._activeTab === 'login';
      const isAdmin = this._activeRole === 'admin';

      if (isLogin) {
        if (this._loginMethod === 'otp') {
          return `
            <form id="formGmailOtpLogin" class="auth-form">
              <div class="auth-field">
                <label class="auth-label">Your Registered Email Address</label>
                <div class="auth-input-wrap">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <input type="email" class="auth-input" id="authOtpEmail" placeholder="${isAdmin ? 'admin@tapcard.pro' : 'user@gmail.com'}" required />
                </div>
              </div>
              <div id="authFormError" style="font-size:0.8rem; color:#f87171; display:none;"></div>
              <button type="submit" class="auth-submit-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Send Gmail Security Code
              </button>
              <button type="button" class="auth-method-toggle" onclick="AuthApp.toggleLoginMethod('password')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Sign in with Password instead
              </button>
            </form>
          `;
        }

        // Standard Password Login
        return `
          <form id="formPasswordLogin" class="auth-form">
            <div class="auth-field">
              <label class="auth-label">${isAdmin ? 'Admin Username or Email' : 'Username or Email'}</label>
              <div class="auth-input-wrap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input type="text" class="auth-input" id="authLoginId" placeholder="${isAdmin ? 'admin' : 'alex or alex.user@gmail.com'}" value="${isAdmin ? 'admin' : ''}" required />
              </div>
            </div>

            <div class="auth-field">
              <label class="auth-label">Password</label>
              <div class="auth-input-wrap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input type="password" class="auth-input" id="authLoginPass" placeholder="••••••••" value="${isAdmin ? 'admin123' : ''}" required />
              </div>
            </div>

            <div id="authFormError" style="font-size:0.8rem; color:#f87171; display:none;"></div>

            <button type="submit" class="auth-submit-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
              Sign In to ${isAdmin ? 'Admin Panel' : 'Account'}
            </button>

            <button type="button" class="auth-method-toggle" onclick="AuthApp.toggleLoginMethod('otp')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              Sign in with Gmail Verification Code (OTP)
            </button>

            <div class="auth-quick-login">
              <button type="button" class="auth-quick-btn" onclick="AuthApp.fillDemo('admin')">
                🛡️ Demo Admin
              </button>
              <button type="button" class="auth-quick-btn" onclick="AuthApp.fillDemo('user')">
                👤 Demo User
              </button>
            </div>
          </form>
        `;
      }

      // Sign Up Form (Triggers Gmail OTP code verification)
      return `
        <form id="formSignUp" class="auth-form">
          <div class="auth-field">
            <label class="auth-label">Full Name</label>
            <div class="auth-input-wrap">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input type="text" class="auth-input" id="authRegName" placeholder="e.g. Sarah Connor" required />
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.6rem;">
            <div class="auth-field">
              <label class="auth-label">Username</label>
              <div class="auth-input-wrap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/></svg>
                <input type="text" class="auth-input" id="authRegUser" placeholder="sarah" required />
              </div>
            </div>
            <div class="auth-field">
              <label class="auth-label">Password</label>
              <div class="auth-input-wrap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input type="password" class="auth-input" id="authRegPass" placeholder="••••••••" required />
              </div>
            </div>
          </div>

          <div class="auth-field">
            <label class="auth-label">Gmail / Email Address</label>
            <div class="auth-input-wrap">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <input type="email" class="auth-input" id="authRegEmail" placeholder="your.name@gmail.com" required />
            </div>
          </div>

          ${isAdmin ? `
            <div class="auth-field">
              <label class="auth-label" style="color:var(--accent-primary);">Admin Passcode (Security Check)</label>
              <div class="auth-input-wrap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <input type="password" class="auth-input" id="authRegAdminPasscode" placeholder="Enter admin passcode (default: admin123)" required />
              </div>
            </div>
          ` : ''}

          <div id="authFormError" style="font-size:0.8rem; color:#f87171; display:none;"></div>

          <button type="submit" class="auth-submit-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            Send Gmail Verification Code
          </button>
        </form>
      `;
    },

    toggleLoginMethod: function(method) {
      this._loginMethod = method;
      const body = document.getElementById('authModalBody');
      if (body) {
        body.innerHTML = this.renderFormHTML();
        this.bindFormEvents();
      }
    },

    fillDemo: function(type) {
      const idEl = document.getElementById('authLoginId');
      const passEl = document.getElementById('authLoginPass');
      if (type === 'admin') {
        this._activeRole = 'admin';
        this.renderModalContent();
        document.getElementById('authLoginId').value = 'admin';
        document.getElementById('authLoginPass').value = 'admin123';
      } else {
        this._activeRole = 'user';
        this.renderModalContent();
        document.getElementById('authLoginId').value = 'alex';
        document.getElementById('authLoginPass').value = 'user123';
      }
    },

    bindFormEvents: function() {
      // 1. Password Login Form
      const formPass = document.getElementById('formPasswordLogin');
      if (formPass) {
        formPass.addEventListener('submit', (e) => {
          e.preventDefault();
          const errEl = document.getElementById('authFormError');
          const id = document.getElementById('authLoginId').value;
          const pass = document.getElementById('authLoginPass').value;

          const res = AuthStore.login(id, pass, true);
          if (!res.success) {
            errEl.textContent = res.error;
            errEl.style.display = 'block';
          } else {
            this.closeModal();
            if (res.user.role === 'admin' && window.location.pathname.includes('admin.html')) {
              window.location.reload();
            } else if (res.user.role === 'admin' && this._activeRole === 'admin') {
              window.location.href = 'admin.html';
            } else {
              if (window.CardApp && window.CardApp.showToast) {
                CardApp.showToast(`👋 Welcome back, ${res.user.name}!`);
              }
            }
          }
        });
      }

      // 2. Gmail OTP Login Request
      const formOtpLogin = document.getElementById('formGmailOtpLogin');
      if (formOtpLogin) {
        formOtpLogin.addEventListener('submit', (e) => {
          e.preventDefault();
          const email = document.getElementById('authOtpEmail').value;
          const errEl = document.getElementById('authFormError');

          // Verify email exists in system
          const user = AuthStore.getUsers().find(u => u.email.toLowerCase() === email.trim().toLowerCase());
          if (!user) {
            errEl.textContent = 'No account found with this email. Please sign up first.';
            errEl.style.display = 'block';
            return;
          }

          this._pendingOtpEmail = email.trim();
          this._pendingUserData = user;
          this._pendingFlow = 'login';
          const otpRes = AuthStore.sendGmailOtp(this._pendingOtpEmail, 'Login');
          this._lastGeneratedCode = otpRes.code;
          this.renderOtpScreen();
        });
      }

      // 3. Sign Up Form
      const formSignUp = document.getElementById('formSignUp');
      if (formSignUp) {
        formSignUp.addEventListener('submit', (e) => {
          e.preventDefault();
          const errEl = document.getElementById('authFormError');
          const name = document.getElementById('authRegName').value;
          const username = document.getElementById('authRegUser').value;
          const email = document.getElementById('authRegEmail').value;
          const password = document.getElementById('authRegPass').value;
          const adminPasscode = document.getElementById('authRegAdminPasscode') ? document.getElementById('authRegAdminPasscode').value : '';

          // Pre-validate
          if (username.length < 3) {
            errEl.textContent = 'Username must be at least 3 characters.';
            errEl.style.display = 'block';
            return;
          }
          if (AuthStore.getUsers().some(u => u.username.toLowerCase() === username.toLowerCase())) {
            errEl.textContent = 'Username is already taken.';
            errEl.style.display = 'block';
            return;
          }

          this._pendingUserData = {
            name, username, email, password,
            role: this._activeRole,
            adminPasscode
          };
          this._pendingOtpEmail = email.trim();
          this._pendingFlow = 'signup';

          const otpRes = AuthStore.sendGmailOtp(this._pendingOtpEmail, 'Account Verification');
          this._lastGeneratedCode = otpRes.code;
          this.renderOtpScreen();
        });
      }
    },

    // ─── RENDER 6-DIGIT OTP VERIFICATION SCREEN ───
    renderOtpScreen: function() {
      const body = document.getElementById('authModalBody');
      if (!body) return;

      body.innerHTML = `
        <div class="otp-screen">
          <div class="otp-icon-wrap">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </div>
          <h4 style="margin:0 0 0.35rem; font-size:1.15rem; font-weight:700;">Check Your Gmail Inbox</h4>
          <p style="font-size:0.83rem; color:var(--text-secondary); margin:0;">
            We sent a 6-digit authentication code to:
          </p>
          <div class="otp-email-badge">${escapeHtml(this._pendingOtpEmail)}</div>

          ${this._lastGeneratedCode ? `
            <div style="background:rgba(234,67,53,0.08); border:1px dashed rgba(234,67,53,0.3); border-radius:10px; padding:0.6rem 0.85rem; margin-bottom:1.25rem; font-size:0.8rem; color:#fff; display:flex; align-items:center; justify-content:space-between;">
              <span>📬 Gmail Code: <strong style="font-family:var(--font-mono); color:#ff6b6b; font-size:1.1rem; letter-spacing:2px;">${this._lastGeneratedCode}</strong></span>
              <button type="button" class="btn btn-xs btn-primary" onclick="AuthApp.fillOtpCode('${this._lastGeneratedCode}')" style="background:#ea4335; border-color:#ea4335; color:#fff; padding:3px 10px;">One-Tap Auto Fill</button>
            </div>
          ` : ''}

          <form id="formOtpVerify">
            <div class="otp-inputs" id="otpInputsContainer">
              <input type="text" maxlength="1" class="otp-digit" data-idx="0" inputmode="numeric" autofocus />
              <input type="text" maxlength="1" class="otp-digit" data-idx="1" inputmode="numeric" />
              <input type="text" maxlength="1" class="otp-digit" data-idx="2" inputmode="numeric" />
              <input type="text" maxlength="1" class="otp-digit" data-idx="3" inputmode="numeric" />
              <input type="text" maxlength="1" class="otp-digit" data-idx="4" inputmode="numeric" />
              <input type="text" maxlength="1" class="otp-digit" data-idx="5" inputmode="numeric" />
            </div>

            <div id="otpError" style="font-size:0.8rem; color:#f87171; margin-bottom:1rem; display:none;"></div>

            <button type="submit" class="auth-submit-btn" id="btnVerifyOtpSubmit">
              Verify Code & Continue
            </button>
          </form>

          <div class="otp-timer" style="margin-top:1.25rem;">
            Didn't receive the code? <a id="btnResendOtp">Resend Code</a>
          </div>

          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.5rem;">
            💡 Look at the top right of the screen for the simulated incoming Gmail notification!
          </div>
        </div>
      `;

      this.bindOtpInputs();
    },

    bindOtpInputs: function() {
      const inputs = document.querySelectorAll('.otp-digit');
      inputs.forEach((input, idx) => {
        input.addEventListener('input', (e) => {
          const val = e.target.value;
          if (val && idx < inputs.length - 1) {
            inputs[idx + 1].focus();
          }
        });
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && !input.value && idx > 0) {
            inputs[idx - 1].focus();
          }
        });
        input.addEventListener('paste', (e) => {
          e.preventDefault();
          const paste = (e.clipboardData || window.clipboardData).getData('text').trim();
          if (/^\d{6}$/.test(paste)) {
            AuthApp.fillOtpCode(paste);
          }
        });
      });

      // Focus first input
      if (inputs[0]) inputs[0].focus();

      // Resend OTP
      const btnResend = document.getElementById('btnResendOtp');
      if (btnResend) {
        btnResend.addEventListener('click', () => {
          AuthStore.sendGmailOtp(this._pendingOtpEmail, 'Resend Code');
          btnResend.textContent = 'Sent! (Check Gmail)';
          setTimeout(() => { btnResend.textContent = 'Resend Code'; }, 3000);
        });
      }

      // OTP Verify Submit
      const formOtp = document.getElementById('formOtpVerify');
      if (formOtp) {
        formOtp.addEventListener('submit', (e) => {
          e.preventDefault();
          let entered = '';
          inputs.forEach(i => entered += i.value);
          const errEl = document.getElementById('otpError');

          const verifyRes = AuthStore.verifyGmailOtp(this._pendingOtpEmail, entered);
          if (!verifyRes.success) {
            errEl.textContent = verifyRes.error;
            errEl.style.display = 'block';
            return;
          }

          // Verification succeeded! Complete login or signup
          if (this._pendingFlow === 'signup') {
            const signupRes = AuthStore.signup(this._pendingUserData);
            if (!signupRes.success) {
              errEl.textContent = signupRes.error;
              errEl.style.display = 'block';
              return;
            }
            this.closeModal();
            if (this._pendingUserData.role === 'admin') {
              window.location.href = 'admin.html';
            } else {
              if (window.CardApp && window.CardApp.showToast) {
                CardApp.showToast(`🎉 Account created! Welcome, ${signupRes.user.name}`);
              }
            }
          } else {
            // Login with verified user
            AuthStore.loginUserObject(this._pendingUserData, true);
            this.closeModal();
            if (this._pendingUserData.role === 'admin' && window.location.pathname.includes('admin.html')) {
              window.location.reload();
            } else if (this._pendingUserData.role === 'admin') {
              window.location.href = 'admin.html';
            } else {
              if (window.CardApp && window.CardApp.showToast) {
                CardApp.showToast(`👋 Welcome back, ${this._pendingUserData.name}!`);
              }
            }
          }
        });
      }
    },

    fillOtpCode: function(code) {
      const inputs = document.querySelectorAll('.otp-digit');
      if (inputs && inputs.length === 6 && code.length === 6) {
        code.split('').forEach((ch, i) => {
          inputs[i].value = ch;
        });
        const form = document.getElementById('formOtpVerify');
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true }));
        }
      }
    },

    // ─── USER & ADMIN PROFILES MODAL ───
    openProfileModal: function() {
      const user = AuthStore.getCurrentUser();
      if (!user) {
        this.openModal('login');
        return;
      }

      let backdrop = document.getElementById('profileModalBackdrop');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'profileModalBackdrop';
        backdrop.className = 'auth-backdrop';
        document.body.appendChild(backdrop);
      }

      const isAdmin = user.role === 'admin';

      backdrop.innerHTML = `
        <div class="profile-modal-card" onclick="event.stopPropagation()">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid rgba(255,255,255,0.08);">
            <div>
              <h3 style="margin:0 0 0.25rem; font-size:1.35rem; font-weight:700;">
                ${isAdmin ? '🛡️ Administrator Profile' : '👤 User Profile'}
              </h3>
              <span class="badge ${isAdmin ? 'badge-accent' : 'badge-primary'}" style="font-size:0.68rem;">
                ● ROLE: ${user.role.toUpperCase()}
              </span>
            </div>
            <button class="auth-close-btn" onclick="document.getElementById('profileModalBackdrop').classList.remove('active')">&times;</button>
          </div>

          <div class="profile-avatar-row">
            <img src="${user.avatar || ''}" id="userProfileAvatarPreview" class="profile-avatar-preview" alt="Avatar" />
            <div style="flex:1;">
              <label class="form-label">Profile Avatar URL</label>
              <input type="text" class="form-input" id="userProfAvatarInput" value="${escapeHtml(user.avatar || '')}" placeholder="https://..." />
            </div>
          </div>

          <form id="userProfileForm" style="display:flex; flex-direction:column; gap:1rem;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
              <div class="form-group" style="margin:0;">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-input" id="userProfName" value="${escapeHtml(user.name || '')}" required />
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label">Username</label>
                <input type="text" class="form-input" value="@${escapeHtml(user.username || '')}" disabled style="opacity:0.6;" />
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
              <div class="form-group" style="margin:0;">
                <label class="form-label">Job Title</label>
                <input type="text" class="form-input" id="userProfTitle" value="${escapeHtml(user.title || '')}" />
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label">Company / Org</label>
                <input type="text" class="form-input" id="userProfCompany" value="${escapeHtml(user.company || '')}" />
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
              <div class="form-group" style="margin:0;">
                <label class="form-label">Gmail / Email</label>
                <input type="email" class="form-input" id="userProfEmail" value="${escapeHtml(user.email || '')}" required />
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label">Phone Number</label>
                <input type="text" class="form-input" id="userProfPhone" value="${escapeHtml(user.phone || '')}" />
              </div>
            </div>

            <div class="form-group" style="margin:0;">
              <label class="form-label">Bio / Headline</label>
              <textarea class="form-input" id="userProfBio" rows="3">${escapeHtml(user.bio || '')}</textarea>
            </div>

            <div style="display:flex; gap:0.75rem; margin-top:0.5rem;">
              <button type="submit" class="btn btn-primary" style="flex:1;">
                Save Profile Changes
              </button>
              ${isAdmin ? `
                <a href="admin.html" class="btn btn-secondary">
                  Open Admin Suite
                </a>
              ` : `
                <a href="card.html" target="_blank" class="btn btn-secondary">
                  View My Digital Card
                </a>
              `}
              <button type="button" class="btn btn-outline" style="color:#f87171;" onclick="AuthStore.logout(); document.getElementById('profileModalBackdrop').classList.remove('active');">
                Log Out
              </button>
            </div>
          </form>
        </div>
      `;

      backdrop.onclick = () => backdrop.classList.remove('active');
      requestAnimationFrame(() => backdrop.classList.add('active'));

      // Avatar real-time preview
      const avInput = document.getElementById('userProfAvatarInput');
      const avPrev = document.getElementById('userProfileAvatarPreview');
      if (avInput && avPrev) {
        avInput.addEventListener('input', () => {
          if (avInput.value.trim()) avPrev.src = avInput.value.trim();
        });
      }

      // Profile Save Form
      const form = document.getElementById('userProfileForm');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const updates = {
            name: document.getElementById('userProfName').value.trim(),
            title: document.getElementById('userProfTitle').value.trim(),
            company: document.getElementById('userProfCompany').value.trim(),
            email: document.getElementById('userProfEmail').value.trim(),
            phone: document.getElementById('userProfPhone').value.trim(),
            bio: document.getElementById('userProfBio').value.trim(),
            avatar: avInput ? avInput.value.trim() : user.avatar
          };

          AuthStore.updateUserProfile(user.id, updates);

          // If this is admin, also sync to CardStore main profile
          if (isAdmin && typeof CardStore !== 'undefined' && CardStore.updateProfile) {
            CardStore.updateProfile({
              name: updates.name,
              title: updates.title,
              company: updates.company,
              bio: updates.bio,
              avatar: updates.avatar
            });
            CardStore.updateContact({
              email: updates.email,
              phone: updates.phone
            });
          }

          backdrop.classList.remove('active');
          if (window.CardApp && window.CardApp.showToast) {
            CardApp.showToast('✅ Profile updated successfully!');
          }
        });
      }
    }
  };

  // Helper escape
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Export
  global.AuthStore = AuthStore;
  global.AuthApp = AuthApp;

  // Auto initialize on DOM ready or immediately if already loaded
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        AuthApp.init();
      });
    } else {
      AuthApp.init();
    }
  }
})(typeof window !== 'undefined' ? window : this);
