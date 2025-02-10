const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  const secretKey = process.env.JWT_SECRET; // Replace with environment variable
  const token = jwt.sign({ id: userId }, secretKey, { expiresIn: "1h" }); // Token expires in 1 hour
  return token;
};

module.exports = generateToken;
