const { getWallet, addMoney } = require("../../controllers/walletController");
const Wallet = require("../../models/Wallet");
const User = require("../../models/User");

jest.mock("../../models/Wallet");
jest.mock("../../models/User");

describe("Wallet Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { _id: "user123", balance: 100, save: jest.fn() },
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("getWallet", () => {
    it("should return wallet if found", async () => {
      const mockWallet = { _id: "wallet123", balance: 200 };
      Wallet.findOne.mockResolvedValue(mockWallet);

      await getWallet(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ wallet: mockWallet });
    });

    it("should return 404 if wallet not found", async () => {
      Wallet.findOne.mockResolvedValue(null);

      await getWallet(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Wallet not found" });
    });

    it("should return 400 if error occurs", async () => {
      Wallet.findOne.mockRejectedValue(new Error("Database error"));

      await getWallet(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    });
  });

  describe("addMoney", () => {
    it("should add money successfully", async () => {
      req.body.amount = 50;

      const wallet = { _id: "wallet123", balance: 100, save: jest.fn() };
      Wallet.findOne.mockResolvedValue(wallet);

      await addMoney(req, res);

      expect(wallet.balance).toBe(150);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "50 added to your account",
        data: wallet,
      });
    });

    it("should return 400 if amount is invalid", async () => {
      req.body.amount = 0;

      await addMoney(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Please add a valid amount",
      });
    });

    it("should return 404 if wallet not found", async () => {
      req.body.amount = 50;
      Wallet.findOne.mockResolvedValue(null);

      await addMoney(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Wallet not found" });
    });

    it("should return 400 if error occurs", async () => {
      req.body.amount = 50;
      Wallet.findOne.mockRejectedValue(new Error("DB error"));

      await addMoney(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "DB error" });
    });
  });
});
