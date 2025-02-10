const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // To hash passwords

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^[a-zA]+@students\.iiit\.ac\.in$/,
      "Please enter a valid IIIT email address",
    ], // Only IIIT emails allowed
  },
  age: {
    type: Number,
    required: true,
    min: 18, // Age must be 18 or older
  },
  contactNumber: {
    type: String,
    required: true,
    match: [/^\d{10}$/, "Please enter a valid 10-digit contact number"], // Contact number validation
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Minimum password length
  },
  reviews: [
    {
      rating: {
        type: Number,
        //required: true,
        min: 1,
        max: 5, // Ratings should be between 1 and 5
      },
      username: {
        type: String,
        //required: true,
      },
      comment: {
        type: String,
        //required: true,
        trim: true,
      },
    },
  ],
});

// Hash password before saving it to the database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // If password is not modified, skip hashing

  try {
    const salt = await bcrypt.genSalt(10); // Generate salt
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next();
  } catch (error) {
    next(error); // Pass any error to the next middleware
  }
});

// Method to compare entered password with the hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
