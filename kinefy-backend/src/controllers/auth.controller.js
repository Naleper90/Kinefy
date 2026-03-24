const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ msg: 'Por favor incluye todos los campos obligatorios' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ msg: 'Este correo ya está registrado' });
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
        res.status(500).json({ msg: 'Error de servidor' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: 'Falta email o contraseña' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
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
        res.status(500).json({ msg: 'Error de servidor' });
    }
};

module.exports = {
    register,
    login
};
