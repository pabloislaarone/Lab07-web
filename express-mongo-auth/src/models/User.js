import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    // Se guarda el hash; las reglas del password (min 8, mayúscula, dígito,
    // caracter especial) se validan sobre el texto plano en utils/validators.js
    password: {
        type: String,
        required: true
    },
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    }],
    name: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'El apellido es requerido'],
        trim: true
    },
    phoneNumber: {
        type: String,
        required: [true, 'El teléfono es requerido'],
        trim: true
    },
    birthdate: {
        type: Date,
        required: [true, 'La fecha de nacimiento es requerida'],
        validate: {
            validator: v => v <= new Date(),
            message: 'La fecha de nacimiento no puede ser futura'
        }
    },
    url_profile: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    }
}, { timestamps: true });

// Edad calculada a partir de la fecha de nacimiento
UserSchema.virtual('age').get(function () {
    if (!this.birthdate) return null;
    const today = new Date();
    let age = today.getUTCFullYear() - this.birthdate.getUTCFullYear();
    const m = today.getUTCMonth() - this.birthdate.getUTCMonth();
    if (m < 0 || (m === 0 && today.getUTCDate() < this.birthdate.getUTCDate())) age--;
    return age;
});

export default mongoose.model('User', UserSchema);
