const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    cropName: {
      type: String,
      required: [true, 'Please add a crop name'],
    },
    quantity: {
      type: String,
      required: [true, 'Please add quantity'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
