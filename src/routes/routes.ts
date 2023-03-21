import { Express, Request, Response, Router } from "express";
import {
  register,
  login,
  changeProfile,
  getProfile,
} from "../controller/userController";
import {
  getAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
} from "../controller/accountController";
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controller/transactionController";
import {
  getDebts,
  addDebt,
  updateDebt,
  deleteDebt,
} from "../controller/debtController";
import { test } from "../controller/mainController";
import { jsonParser } from "../middleware/jsonParser";
import { verifyToken } from "../middleware/verifyToken";
import cors from "cors";

const router = Router();
router.use(cors());

router.get("/", (_req: Request, res: Response) => {
  res.send({
    message: "Unexpected route",
  });
});

router.get("/test", test);
router.post("/user/register", jsonParser, register);
router.post("/user/login", jsonParser, login);
router.post("/user/change-profile", jsonParser, verifyToken, changeProfile);
router.get("/user/profile", verifyToken, getProfile);

router.get("/accounts", verifyToken, getAccounts);
router.post("/accounts", jsonParser, verifyToken, addAccount);
router.patch("/accounts", jsonParser, verifyToken, updateAccount);
router.delete("/accounts", jsonParser, verifyToken, deleteAccount);

router.get("/transactions", verifyToken, getTransactions);
router.post("/transactions", jsonParser, verifyToken, addTransaction);
router.patch("/transactions", jsonParser, verifyToken, updateTransaction);
router.delete("/transactions", jsonParser, verifyToken, deleteTransaction);

router.get("/debts", verifyToken, getDebts);
router.post("/debts", jsonParser, verifyToken, addDebt);
router.patch("/debts", jsonParser, verifyToken, updateDebt);
router.delete("/debts", jsonParser, verifyToken, deleteDebt);

export { router };
