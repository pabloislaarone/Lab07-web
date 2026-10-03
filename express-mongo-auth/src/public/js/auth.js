// Manejo de sesión con JWT en sessionStorage, protección de rutas y llamadas a la API
const TOKEN_KEY = 'token';

const Auth = {

    getToken() {
        return sessionStorage.getItem(TOKEN_KEY);
    },

    setToken(token) {
        sessionStorage.setItem(TOKEN_KEY, token);
    },

    // Decodifica el payload del JWT (sub, roles, exp)
    payload() {
        const token = this.getToken();
        if (!token) return null;
        try {
            const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            return JSON.parse(atob(base64));
        } catch (err) {
            return null;
        }
    },

    isValid() {
        const payload = this.payload();
        return !!payload && !!payload.exp && payload.exp * 1000 > Date.now();
    },

    roles() {
        const payload = this.payload();
        return (payload && payload.roles) || [];
    },

    isAdmin() {
        return this.roles().includes('admin');
    },

    // Dashboard que le corresponde al rol
    home() {
        return this.isAdmin() ? '/admin' : '/dashboard';
    },

    logout() {
        sessionStorage.removeItem(TOKEN_KEY);
        window.location.replace('/signIn');
    },

    // Protege una página: sin token válido => /signIn, sin rol suficiente => /403
    guard(requiredRoles = []) {
        if (!this.isValid()) {
            this.logout();
            return false;
        }
        if (requiredRoles.length > 0 && !this.roles().some(r => requiredRoles.includes(r))) {
            window.location.replace('/403');
            return false;
        }

        // Cerrar sesión automáticamente cuando el token expire
        const msLeft = this.payload().exp * 1000 - Date.now();
        setTimeout(() => this.logout(), Math.min(msLeft, 2147483647));

        this.renderNav();
        return true;
    },

    // Petición a la API con el token JWT
    async api(path, options = {}) {
        const res = await fetch(path, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.getToken()}`,
                ...(options.headers || {})
            }
        });

        if (res.status === 401) {
            this.logout();
            throw new Error('Sesión expirada');
        }
        if (res.status === 403) {
            window.location.replace('/403');
            throw new Error('Acceso denegado');
        }

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Ocurrió un error');
        return data;
    },

    renderNav() {
        const nav = document.getElementById('nav-links');
        if (!nav) return;

        const links = this.isValid()
            ? [
                ['/dashboard', 'Dashboard'],
                ...(this.isAdmin() ? [['/admin', 'Administración']] : []),
                ['/profile', 'Mi cuenta'],
                ['#logout', 'Cerrar sesión']
            ]
            : [
                ['/signIn', 'Iniciar sesión'],
                ['/signUp', 'Registrarse']
            ];

        nav.innerHTML = '';
        for (const [href, text] of links) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = href;
            a.textContent = text;
            if (href === '#logout') {
                a.addEventListener('click', e => {
                    e.preventDefault();
                    this.logout();
                });
            }
            if (href === window.location.pathname) li.className = 'active';
            li.appendChild(a);
            nav.appendChild(li);
        }

        // En las páginas 403 y 404 el botón lleva al dashboard del rol
        const homeLink = document.getElementById('home-link');
        if (homeLink) homeLink.href = this.isValid() ? this.home() : '/signIn';
    }
};

// Utilidades de presentación compartidas por las páginas
const UI = {

    text(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value === undefined || value === null || value === '' ? '—' : value;
    },

    // Las fechas de nacimiento se guardan en UTC, se muestran sin desfase horario
    date(iso) {
        if (!iso) return '';
        const [y, m, d] = iso.slice(0, 10).split('-');
        return `${d}/${m}/${y}`;
    },

    dateTime(iso) {
        return iso ? new Date(iso).toLocaleString('es-PE') : '';
    },

    fullName(user) {
        return [user.name, user.lastName].filter(Boolean).join(' ');
    },

    initials(user) {
        const letters = [user.name, user.lastName].filter(Boolean).map(s => s[0]).join('');
        return (letters || user.email[0]).toUpperCase();
    },

    roles(id, roles) {
        const el = document.getElementById(id);
        el.innerHTML = '';
        for (const role of roles) {
            const chip = document.createElement('span');
            chip.className = role === 'admin' ? 'role-chip admin' : 'role-chip';
            chip.textContent = role;
            el.appendChild(chip);
        }
    },

    // Muestra la foto de perfil, o las iniciales si no hay foto o no carga
    avatar(user) {
        const img = document.getElementById('avatar');
        const initials = document.getElementById('avatar-initials');
        const showInitials = () => {
            img.hidden = true;
            initials.hidden = false;
        };

        initials.textContent = this.initials(user);
        if (/^https?:\/\//i.test(user.url_profile || '')) {
            img.onerror = showInitials;
            img.src = user.url_profile;
            img.hidden = false;
            initials.hidden = true;
        } else {
            showInitials();
        }
    },

    error(message) {
        const el = document.getElementById('form-error');
        if (el) el.textContent = message || '';
    }
};
