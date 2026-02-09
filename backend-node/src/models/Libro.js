const mongoose = require('mongoose');

const LibroSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  autor: { type: String, required: true }
});

module.exports = mongoose.model('Libro', LibroSchema);
