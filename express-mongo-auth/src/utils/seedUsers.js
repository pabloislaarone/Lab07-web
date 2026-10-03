import userRepository from '../repositories/UserRepository.js';
import authService from '../services/AuthService.js';

// Registra el usuario administrador si todavía no existe
export default async function seedUsers() {

    const email = process.env.ADMIN_EMAIL || 'pablo.isla@authportal.com';
    const existing = await userRepository.findByEmail(email);
    if (!existing) {
        await authService.signUp({
            email,
            password: process.env.ADMIN_PASSWORD || 'Pablo#2026',
            name: 'Pablo',
            lastName: 'Isla',
            phoneNumber: '987654321',
            birthdate: '2004-03-18',
            address: 'Lima, Perú',
            roles: ['admin']
        });
        console.log(`Seeded admin user: ${email}`);
    }
}
