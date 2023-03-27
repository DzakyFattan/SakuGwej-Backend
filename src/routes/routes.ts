import { Express, Request, Response, Router } from "express";
import {
  register,
  login,
  changeProfile,
  getProfile,
  changeProfilePicture,
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
import { formDataParser } from "../middleware/formDataParser";
import { logRequest } from "../middleware/log";
import cors from "cors";

const router = Router();
router.use(cors());

router.get("/", (_req: Request, res: Response) => {
  res.send({
    message: "Unexpected route",
  });
});

router.get("/test", logRequest, test);
router.post("/user/register", logRequest, jsonParser, register);
router.post("/user/login", logRequest, jsonParser, login);
router.post("/user/change-profile", logRequest, jsonParser, verifyToken, changeProfile);
router.get("/user/profile", logRequest, verifyToken, getProfile);
router.post(
  "/user/change-profile-picture",
  logRequest,
  formDataParser,
  verifyToken,
  changeProfilePicture
);

router.get("/accounts", logRequest, verifyToken, getAccounts);
router.post("/accounts", logRequest, jsonParser, verifyToken, addAccount);
router.patch("/accounts", logRequest, jsonParser, verifyToken, updateAccount);
router.delete("/accounts", logRequest, jsonParser, verifyToken, deleteAccount);

router.get("/transactions", logRequest, verifyToken, getTransactions);
router.post("/transactions", logRequest, jsonParser, verifyToken, addTransaction);
router.patch("/transactions", logRequest, jsonParser, verifyToken, updateTransaction);
router.delete("/transactions", logRequest, jsonParser, verifyToken, deleteTransaction);
router.delete("/transactions/:id", logRequest, verifyToken, deleteTransaction);

router.get("/debts", logRequest, verifyToken, getDebts);
router.post("/debts", logRequest, jsonParser, verifyToken, addDebt);
router.patch("/debts", logRequest, jsonParser, verifyToken, updateDebt);
router.delete("/debts", logRequest, jsonParser, verifyToken, deleteDebt);
router.delete("/debts/:id", logRequest, verifyToken, deleteDebt);

export { router };
