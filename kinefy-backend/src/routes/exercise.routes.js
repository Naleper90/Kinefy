const express = require('express');
const router = express.Router();
const { getExercises, createExercise, updateExercise, deleteExercise } = require('../controllers/exercise.controller');
const auth = require('../middleware/auth.middleware');

// Todas las rutas de la biblioteca requieren estar logueado
router.use(auth);

router.get('/', getExercises);
router.post('/', createExercise);
router.put('/:id', updateExercise);
router.delete('/:id', deleteExercise);

module.exports = router;
