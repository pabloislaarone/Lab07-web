if (Auth.isValid()) {
    window.location.replace(Auth.home());
} else {
    Auth.renderNav();
}

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[#$%&*@]).{8,}$/;
const FIELDS = ['name', 'lastName', 'phoneNumber', 'birthdate', 'email', 'password'];

document.getElementById('signup-form').addEventListener('submit', async e => {
    e.preventDefault();
    UI.error('');

    const payload = {};
    for (const field of FIELDS) {
        const value = document.getElementById(field).value;
        payload[field] = field === 'password' ? value : value.trim();
    }

    if (FIELDS.some(field => !payload[field])) return UI.error('Todos los campos son requeridos');
    if (!PASSWORD_REGEX.test(payload.password))
        return UI.error('El password debe tener mínimo 8 caracteres, 1 mayúscula, 1 dígito y 1 caracter especial (# $ % & * @)');

    try {
        const res = await fetch('/api/auth/signUp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) return UI.error(data.message || 'No se pudo completar el registro');

        M.toast({ html: 'Cuenta creada, ahora inicia sesión' });
        setTimeout(() => window.location.replace('/signIn'), 1200);
    } catch (err) {
        UI.error('No se pudo conectar con el servidor');
    }
});
