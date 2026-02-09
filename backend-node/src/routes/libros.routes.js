const express = require('express');
const router = express.Router();
const Libro = require('../models/Libro');
const auth = require('../middlewares/auth.middleware');

// ============================
// CREATE - Crear libro
// ============================

router.post('/', auth, async (req, res) => {
  try {
    const { titulo, autor, cantidad } = req.body;

    if (!titulo || !autor || cantidad == null) {
      return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
    }

    if (cantidad < 0) {
      return res.status(400).json({ msg: 'La cantidad no puede ser negativa' });
    }

    // SIMULACIÓN sin MongoDB
    const libroCreado = { 
      _id: Date.now().toString(), 
      titulo, 
      autor, 
      cantidad: Number(cantidad) 
    };

    res.status(201).json(libroCreado);
  } catch (error) {
    res.status(500).json({ msg: 'Error al crear libro' });
  }
});


// ============================
// READ - Listar libros
// ============================
router.get('/', auth, async (req, res) => {
  try {
    // DATOS SIMULADOS (sin MongoDB)
    const libros = [
      { _id: '1', titulo: 'El Quijote de la Mancha', autor: 'Miguel de Cervantes', cantidad: 5 },
      { _id: '2', titulo: '1984', autor: 'George Orwell', cantidad: 3 },
      { _id: '3', titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', cantidad: 8 }
    ];
    res.json(libros);
  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener libros' });
  }
});

// ============================
// READ - Obtener libro por ID
// ============================
router.get('/:id', auth, async (req, res) => {
  try {
    const libro = await Libro.findById(req.params.id);

    if (!libro) {
      return res.status(404).json({ msg: 'Libro no encontrado' });
    }

    res.json(libro);
  } catch (error) {
    res.status(400).json({ msg: 'ID inválido' });
  }
});

// ============================
// UPDATE - Actualizar libro
// ============================
router.put('/:id', auth, async (req, res) => {
  try {
    const { titulo, autor } = req.body;

    if (!titulo || !autor) {
      return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
    }

    const libro = await Libro.findByIdAndUpdate(
      req.params.id,
      { titulo, autor },
      { new: true }
    );

    if (!libro) {
      return res.status(404).json({ msg: 'Libro no encontrado' });
    }

    res.json(libro);
  } catch (error) {
    res.status(400).json({ msg: 'Error al actualizar libro' });
  }
});

// ============================
// DELETE - Eliminar libro
// ============================
router.delete('/:id', auth, async (req, res) => {
  try {
    const libro = await Libro.findByIdAndDelete(req.params.id);

    if (!libro) {
      return res.status(404).json({ msg: 'Libro no encontrado' });
    }

    res.json({ msg: 'Libro eliminado correctamente' });
  } catch (error) {
    res.status(400).json({ msg: 'Error al eliminar libro' });
  }
});


module.exports = router;
