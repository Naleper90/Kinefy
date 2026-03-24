const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Faltan campos obligatorios', code: 'VALIDATION_ERROR' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ error: 'Este correo ya está registrado', code: 'USER_EXISTS' });
        }

        const user = new User({
            name,
            email,
            password,
            role: role || 'paciente'
        });

        await user.save();

        res.status(201).json({ msg: 'Usuario registrado correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor', code: 'SERVER_ERROR' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Faltan credenciales', code: 'VALIDATION_ERROR' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Credenciales inválidas', code: 'AUTH_INVALID_CREDENTIALS' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Credenciales inválidas', code: 'AUTH_INVALID_CREDENTIALS' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor', code: 'SERVER_ERROR' });
    }
};

const getMe = async (req, res) => {
    try {
        // req.user viene inyectado por nuestro middleware de seguridad
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado', code: 'USER_NOT_FOUND' });
        }

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor', code: 'SERVER_ERROR' });
    }
};

module.exports = {
    register,
    login,
    getMe
};
