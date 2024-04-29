// app.js
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const authRoutes = require("./routes/auth");

const app = express();

// Middleware for logging requests
function logRequest(req, res, next) {
  console.log(`${new Date().toISOString()}: ${req.method} ${req.url}`);
  next();
}

// Middleware for checking authentication
function authenticate(req, res, next) {
  if (req.session && req.session.userId) {
    // User is authenticated
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
}

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://<name>:<password>@cluster0.4jyqbky.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useCreateIndex: true
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);
app.use(logRequest); // Logging middleware

// Routes
app.use("/auth", authRoutes);

// Protected route
app.get("/protected", authenticate, (req, res) => {
  res.send("This is a protected route");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
