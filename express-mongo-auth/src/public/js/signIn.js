// Si ya hay una sesión válida, ir directo al dashboard del rol
if (Auth.isValid()) {
    window.location.replace(Auth.home());
} else {
    Auth.renderNav();
}

document.getElementById('signin-form').addEventListener('submit', async e => {
    e.preventDefault();
    UI.error('');

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) return UI.error('El email y password son requeridos');

    try {
        const res = await fetch('/api/auth/signIn', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) return UI.error(data.message || 'No se pudo iniciar sesión');

        Auth.setToken(data.token);
        window.location.replace(Auth.home());
    } catch (err) {
        UI.error('No se pudo conectar con el servidor');
    }
});
