const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const CartSchema = new Schema({
  buyer_id: {
    type: String,
    required: true
  },
  seller_id: {
    type: String,
    required: true
  },
  product_name: {
    type: String,
    required: true
  },
  product_description: {
    type: String,
    required: true
  },
  product_price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Cart', CartSchema);

// seller_id: String,
// product_name: String,
// product_description: String,
// product_price: Number,  // check if it's number or int or anything else
// image: String
