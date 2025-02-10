const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./User');
const Product = require('./Product');

const OrderSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    //required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true
  },
  amount: {
    type: Number,
   //required: true,
    min: 0
  },
  product: {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    //   required: true
    },
    quantity: {
      type: Number,
    
    }
  },
  status: {
    type:Boolean,
    default: false
  },
  hashed_otp: {
    type :String
  },
  transactionReference: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to hash OTP
// OrderSchema.pre('save', async function(next) {
//   if (this.isModified('otp.value')) {
//     this.otp.hashedValue = await bcrypt.hash(this.otp.value, 10);
//   }
//   this.updatedAt = new Date();
//   next();
// });

// Method to verify OTP
// OrderSchema.methods.verifyOTP = async function(providedOTP) {
//   if (new Date() > this.otp.expiresAt) {
//     throw new Error('OTP has expired');
//   }
//   return bcrypt.compare(providedOTP, this.otp.hashedValue);
// };

// Virtual field for order total
OrderSchema.virtual('totalAmount').get(function() {
  return this.product.reduce((total, item) => total + (item.quantity * item.priceAtTime), 0);
});

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;
