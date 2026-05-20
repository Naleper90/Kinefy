const Exercise = require('../models/Exercise');

// Obtener todos los ejercicios del fisio logueado
const getExercises = async (req, res) => {
    try {
        const exercises = await Exercise.find({ fisioterapeuta: req.user.id });
        res.json(exercises);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener la biblioteca' });
    }
};

// Crear un nuevo ejercicio en la biblioteca
const createExercise = async (req, res) => {
    try {
        const { nombre, descripcion, categoria, mediaUrl, seriesDefecto } = req.body;
        
        const newExercise = new Exercise({
            nombre,
            descripcion,
            categoria,
            mediaUrl,
            seriesDefecto,
            fisioterapeuta: req.user.id
        });

        await newExercise.save();
        res.status(201).json(newExercise);
    } catch (err) {
        res.status(400).json({ error: 'Error al crear el ejercicio' });
    }
};

// Actualizar un ejercicio
const updateExercise = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Exercise.findOneAndUpdate(
            { _id: id, fisioterapeuta: req.user.id },
            req.body,
            { new: true }
        );
        
        if (!updated) return res.status(404).json({ error: 'Ejercicio no encontrado' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: 'Error al actualizar el ejercicio' });
    }
};

// Eliminar un ejercicio
const deleteExercise = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Exercise.findOneAndDelete({ _id: id, fisioterapeuta: req.user.id });
        
        if (!deleted) return res.status(404).json({ error: 'Ejercicio no encontrado' });
        res.json({ message: 'Ejercicio eliminado de la biblioteca' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el ejercicio' });
    }
};

module.exports = {
    getExercises,
    createExercise,
    updateExercise,
    deleteExercise
};
