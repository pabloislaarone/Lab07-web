const EDITABLE = ['name', 'lastName', 'phoneNumber', 'birthdate', 'address', 'url_profile'];

function render(user) {
    UI.text('full-name', UI.fullName(user));
    UI.text('hero-email', user.email);
    UI.roles('roles', user.roles);
    UI.avatar(user);
    UI.text('age', user.age !== null && user.age !== undefined ? `${user.age} años` : '');
    UI.text('createdAt', UI.dateTime(user.createdAt));
    UI.text('updatedAt', UI.dateTime(user.updatedAt));

    document.getElementById('email').value = user.email;
    for (const field of EDITABLE) {
        const value = user[field] || '';
        document.getElementById(field).value = field === 'birthdate' ? value.slice(0, 10) : value;
    }
    // Recoloca las etiquetas de Materialize sobre los campos ya rellenados
    M.updateTextFields();
}

// Cualquier usuario autenticado
if (Auth.guard([])) {
    Auth.api('/api/users/me')
        .then(render)
        .catch(err => M.toast({ html: err.message }));

    document.getElementById('profile-form').addEventListener('submit', async e => {
        e.preventDefault();
        UI.error('');

        const payload = {};
        for (const field of EDITABLE) payload[field] = document.getElementById(field).value.trim();

        if (!payload.lastName || !payload.phoneNumber || !payload.birthdate)
            return UI.error('El apellido, teléfono y fecha de nacimiento son requeridos');

        try {
            const user = await Auth.api('/api/users/me', { method: 'PUT', body: JSON.stringify(payload) });
            render(user);
            M.toast({ html: 'Datos actualizados' });
        } catch (err) {
            UI.error(err.message);
        }
    });
}
