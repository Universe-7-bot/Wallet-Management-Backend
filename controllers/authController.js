const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const Wallet = require("../models/Wallet");

// Register User
const register = async (req, res) => {
  const { name, email, phone, password, address } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      address,
    });

    const newWallet = await Wallet.create({
      user: newUser._id,
    });

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      balance: newUser.balance,
      phone: newUser.phone,
      address: newUser.address,
      moneySend: newUser.moneySend,
      moneyReceived: newUser.moneyReceived,
      requestReceived: newUser.requestReceived,
      isAdmin: newUser.isAdmin,
      walletId: newWallet._id,
      token: generateToken(newUser._id),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Login User
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const wallet = await Wallet.findOne({ user: user._id });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      balance: user.balance,
      phone: user.phone,
      address: user.address,
      moneySend: user.moneySend,
      moneyReceived: user.moneyReceived,
      requestReceived: user.requestReceived,
      isAdmin: user.isAdmin,
      walletId: wallet._id,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Logout User
const logout = (req, res) => {
  res.json({ message: "User logged out successfully" });
};

const update = async (req, res, next) => {
  const { name, email, phone, address } = req.body;
  try {
    const fieldsToUpdate = {
      name,
      email,
      phone,
      address,
    };
    const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    if (!user)
      return res.status(400).json({ message: "Failed to update user data" });

    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    res.status(200).json({
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        phone: user.phone,
        address: user.address,
        moneySend: user.moneySend,
        moneyReceived: user.moneyReceived,
        requestReceived: user.requestReceived,
        isAdmin: user.isAdmin,
        walletId: wallet._id,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user details" });
  }
};

const getUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id.toString();

    const users = await User.find({ _id: { $ne: currentUserId } }).lean();
    const wallets = await Wallet.find().lean();

    const walletMap = wallets.reduce((map, wallet) => {
      map[wallet.user.toString()] = wallet._id.toString();
      return map;
    }, {});

    const usersWithWallets = users.map((user) => ({
      ...user,
      walletId: walletMap[user._id.toString()] || "N/A",
    }));

    res.status(201).json(usersWithWallets);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { register, login, logout, update, getUsers };
