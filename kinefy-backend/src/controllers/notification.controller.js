const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ usuario: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener notificaciones' });
    }
};

const markAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { usuario: req.user.id, leida: false },
            { leida: true }
        );
        res.json({ message: 'Notificaciones marcadas como leídas' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar notificaciones' });
    }
};

const createNotification = async (usuario, titulo, mensaje, tipo, metadata = {}) => {
    try {
        const notification = new Notification({
            usuario,
            titulo,
            mensaje,
            tipo,
            metadata
        });
        await notification.save();
        return notification;
    } catch (err) {
        console.error('Error creating notification:', err);
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    createNotification
};
