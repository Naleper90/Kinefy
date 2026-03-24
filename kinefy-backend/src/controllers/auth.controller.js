const User = require('../models/User');

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
    // TODO: implementar login con jsonwebtoken
    res.json({ msg: 'Login en proceso' });
};

module.exports = {
    register,
    login
};
