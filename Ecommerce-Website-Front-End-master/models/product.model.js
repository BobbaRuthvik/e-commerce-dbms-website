const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  // description: {
  //   type: String,
  //   required: true
  // },
  // location: {
  //   type: String,
  //   required: true
  // },
  // image: {
  //   type: String,
  //   default: 'https://www.salonlfc.com/wp-content/uploads/2018/01/image-not-found-scaled-1150x647.png'
  // }
})

module.exports = mongoose.model('Product', ProductSchema);
