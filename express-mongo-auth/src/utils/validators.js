// min 8 caracteres, min 1 mayúscula, min 1 dígito, min 1 caracter especial ( # $ % & * @ )
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[#$%&*@]).{8,}$/;

export function isValidPassword(password) {
    return typeof password === 'string' && PASSWORD_REGEX.test(password);
}

export const PASSWORD_MESSAGE =
    'El password debe tener mínimo 8 caracteres, 1 mayúscula, 1 dígito y 1 caracter especial (# $ % & * @)';
