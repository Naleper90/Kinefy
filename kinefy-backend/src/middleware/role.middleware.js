/**
 * Middleware para validar el rol del usuario autenticado
 * @param {...string} allowedRoles Roles permitidos
 */
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Acceso denegado: No tienes permisos suficientes para realizar esta acción',
                code: 'AUTH_FORBIDDEN'
            });
        }
        next();
    };
};

module.exports = checkRole;
