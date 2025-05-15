require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const walletRoutes = require("./routes/walletRoutes");
const transactionRoutes = require("./routes/transactionRoute");
const requestRoutes = require("./routes/requestRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
connectDB();

app.use(cors());

// FOR DEPLOYMENT
// const allowedOrigins = ["https://cypherwallet.netlify.app"];

// app.use(
//   cors({
//     origin: "https://cypherwallet.netlify.app",
//     credentials: true,
//   })
// );

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/user", userRoutes);

// COMMENTING THIS BLOCK WHEN DEPLOYING TO VERCEL
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});

// module.exports = app;
