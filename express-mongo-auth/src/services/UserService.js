import userRepository from '../repositories/UserRepository.js';

// Campos que el usuario puede editar desde su perfil
const EDITABLE_FIELDS = ['name', 'lastName', 'phoneNumber', 'birthdate', 'url_profile', 'address'];

function notFound() {
    const err = new Error('Usuario no encontrado');
    err.status = 404;
    return err;
}

// Nunca se devuelve el password
function toDTO(user) {
    return {
        id: user._id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        birthdate: user.birthdate,
        age: user.age,
        url_profile: user.url_profile,
        address: user.address,
        roles: user.roles.map(r => r.name),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
}

class UserService {

    async getAll() {
        const users = await userRepository.getAll();
        return users.map(toDTO);
    }

    async getById(id) {
        const user = await userRepository.findById(id);
        if (!user) throw notFound();
        return toDTO(user);
    }

    async update(id, payload) {
        const data = {};
        for (const field of EDITABLE_FIELDS) {
            if (payload[field] !== undefined) data[field] = payload[field];
        }
        const user = await userRepository.update(id, data);
        if (!user) throw notFound();
        return toDTO(user);
    }
}

export default new UserService();
