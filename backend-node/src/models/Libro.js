const mongoose = require('mongoose');

const LibroSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  autor: { type: String, required: true },
  cantidad: { type: Number, required: true, default: 1 }
});

module.exports = mongoose.model('Libro', LibroSchema);
