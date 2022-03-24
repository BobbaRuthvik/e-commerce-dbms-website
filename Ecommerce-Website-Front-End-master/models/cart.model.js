const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const CartSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Cart', CartSchema);
