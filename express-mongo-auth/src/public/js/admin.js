const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function cell(row, value) {
    const td = document.createElement('td');
    td.textContent = value === undefined || value === null || value === '' ? '—' : value;
    row.appendChild(td);
    return td;
}

function userCell(row, user) {
    const wrap = document.createElement('div');
    wrap.className = 'user-cell';

    const initials = document.createElement('span');
    initials.className = 'mini-initials';
    initials.textContent = UI.initials(user);

    const name = document.createElement('span');
    name.textContent = UI.fullName(user) || '—';

    wrap.append(initials, name);
    cell(row, '').replaceChildren(wrap);
}

function rolesCell(row, roles) {
    const td = cell(row, '');
    td.textContent = '';
    for (const role of roles) {
        const chip = document.createElement('span');
        chip.className = role === 'admin' ? 'role-chip admin' : 'role-chip';
        chip.textContent = role;
        td.appendChild(chip);
    }
}

async function showUser(id, modal) {
    try {
        const user = await Auth.api(`/api/users/${id}`);
        UI.text('m-full-name', UI.fullName(user));
        UI.roles('m-roles', user.roles);
        UI.text('m-id', user.id);
        UI.text('m-email', user.email);
        UI.text('m-phoneNumber', user.phoneNumber);
        UI.text('m-birthdate', UI.date(user.birthdate));
        UI.text('m-age', user.age !== null && user.age !== undefined ? `${user.age} años` : '');
        UI.text('m-address', user.address);
        UI.text('m-url_profile', user.url_profile);
        UI.text('m-createdAt', UI.dateTime(user.createdAt));
        UI.text('m-updatedAt', UI.dateTime(user.updatedAt));
        modal.open();
    } catch (err) {
        M.toast({ html: err.message });
    }
}

// Solo accesible con el rol admin
if (Auth.guard(['admin'])) {
    const modal = M.Modal.init(document.getElementById('user-modal'));

    Auth.api('/api/users')
        .then(users => {
            UI.text('total', users.length);
            UI.text('total-admins', users.filter(u => u.roles.includes('admin')).length);
            UI.text('total-new', users.filter(u => Date.now() - new Date(u.createdAt) < WEEK_MS).length);

            const body = document.getElementById('users-body');
            for (const user of users) {
                const row = document.createElement('tr');
                userCell(row, user);
                cell(row, user.email);
                cell(row, user.phoneNumber);
                cell(row, user.age);
                rolesCell(row, user.roles);
                cell(row, UI.dateTime(user.createdAt));

                const button = document.createElement('button');
                button.className = 'btn-small btn-brand waves-effect waves-light';
                button.textContent = 'Ver';
                button.addEventListener('click', () => showUser(user.id, modal));
                cell(row, '').replaceChildren(button);

                body.appendChild(row);
            }
        })
        .catch(err => M.toast({ html: err.message }));
}
