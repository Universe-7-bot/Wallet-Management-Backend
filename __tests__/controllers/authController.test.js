const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const Wallet = require("../../models/Wallet");
const generateToken = require("../../utils/generateToken");
const {
  register,
  login,
  logout,
  update,
  getUsers,
} = require("../../controllers/authController");

jest.mock("../../models/User");
jest.mock("../../models/Wallet");
jest.mock("bcryptjs");
jest.mock("../../utils/generateToken");
jest.mock("jsonwebtoken");

describe("Auth Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a user successfully", async () => {
      req.body = {
        name: "Test",
        email: "test@example.com",
        password: "pass123",
        phone: "1234567890",
        address: "Street 1",
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedpass");

      const createdUser = { _id: "1", ...req.body, password: "hashedpass" };
      User.create.mockResolvedValue(createdUser);

      Wallet.create.mockResolvedValue({ _id: "wallet1", user: "1" });
      generateToken.mockReturnValue("fake-jwt");

      await register(req, res);

      console.log(res.json.mock.calls[0][0]);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Test",
          email: "test@example.com",
          token: "fake-jwt",
        })
      );
    });

    it("should return error if user exists", async () => {
      User.findOne.mockResolvedValue(true);
      req.body = { email: "exists@example.com" };

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "User already exists" });
    });
  });

  describe("login", () => {
    it("should login successfully", async () => {
      req.body = { email: "test@example.com", password: "pass123" };
      const fakeUser = {
        _id: "1",
        email: "test@example.com",
        password: "hashed",
        name: "Test",
        isAdmin: false,
      };
      User.findOne.mockResolvedValue(fakeUser);
      bcrypt.compare.mockResolvedValue(true);
      Wallet.findOne.mockResolvedValue({ _id: "wallet1" });
      generateToken.mockReturnValue("jwt");

      await login(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com",
          token: "jwt",
        })
      );
    });

    it("should fail on wrong credentials", async () => {
      req.body = { email: "test@example.com", password: "wrongpass" };
      User.findOne.mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
    });
  });

  describe("logout", () => {
    it("should return logout message", () => {
      logout(req, res);
      expect(res.json).toHaveBeenCalledWith({
        message: "User logged out successfully",
      });
    });
  });

  describe("update", () => {
    it("should update user successfully", async () => {
      req.user = { _id: "1" };
      req.body = { name: "Updated", email: "new@example.com" };
      User.findByIdAndUpdate.mockResolvedValue({ _id: "1", ...req.body });

      await update(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: expect.objectContaining({ name: "Updated" }),
      });
    });
  });

  describe("getUsers", () => {
    it("should return users except current user", async () => {
      req.user = { _id: "1" };

      const mockWallets = [
        { user: "1", _id: "wallet1" },
        { user: "2", _id: "wallet2" },
      ];

      User.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: "2", name: "User 2" }]),
      });

      Wallet.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockWallets),
      });

      await getUsers(req, res);

      //   console.log(res.json.mock.calls[0][0]);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({
          name: "User 2",
          walletId: "wallet2",
        }),
      ]);
    });
  });
});
