const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const app = express();
const PORT = 5000;
// const userRoutes = require('./routes/userRoutes');
// Enhanced middleware
app.use(helmet()); // Adds security headers
app.use(morgan('combined')); // Logging middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// MongoDB connection
const uri = "mongodb+srv://shivam9878009:xcSrxSfkxXvqdsbS@cluster0.ylfcq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => {
  console.log("Connected to MongoDB successfully!");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error("MongoDB connection error:", error);
  process.exit(1);
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/sell", require("./routes/Sell"));
app.use("/api/allProducts", require("./routes/allProducts"));
app.use("/api/productDetails", require("./routes/productDetails"));
app.use("/api/profile", require("./routes/Profile"));
app.use("/api/cart", require("./routes/cartRoute"));
app.use("/api/orders", require("./routes/orderRoute"));
app.use("/api/deliveritems", require("./routes/deliverItems"));
app.use("/api/chat", require("./routes/Chatbot"));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong', 
    error: process.env.NODE_ENV === 'production' ? {} : err.message 
  });
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  
  next();
});


// Test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.options('*', cors()); // Enable preflight requests for all routes


module.exports = app;