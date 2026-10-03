// Solo usuarios logueados con rol user (o superior)
if (Auth.guard(['user', 'admin'])) {
    Auth.api('/api/users/me')
        .then(user => {
            UI.text('welcome-name', user.name || user.email);
            UI.roles('roles', user.roles);
            UI.avatar(user);
            UI.text('email', user.email);
            UI.text('phoneNumber', user.phoneNumber);
            UI.text('birthdate', UI.date(user.birthdate));
            UI.text('age', user.age !== null && user.age !== undefined ? `${user.age} años` : '');
            UI.text('address', user.address);
            UI.text('createdAt', UI.dateTime(user.createdAt));
        })
        .catch(err => M.toast({ html: err.message }));
}
