const mongoose = require('mongoose');

mongoose
  .connect('mongodb://127.0.0.1:27017/biblioteca')
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Error MongoDB:', err));
