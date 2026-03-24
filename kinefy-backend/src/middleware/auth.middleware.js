const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({
            error: 'Petición rechazada, falta autorización',
            code: 'AUTH_MISSING_TOKEN'
        });
    }

    try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({
            error: 'La sesión ha expirado o el token es inválido',
            code: 'AUTH_INVALID_TOKEN'
        });
    }
};

module.exports = authMiddleware;
