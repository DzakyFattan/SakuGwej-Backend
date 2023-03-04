import { Express, Request, Response, Router } from "express";
import {
  register,
  login,
  changeProfile,
  getProfile,
} from "../controller/userController";
import { test } from "../controller/mainController";
import { jsonParser } from "../middleware/jsonParser";
import { verifyToken } from "../middleware/verifyToken";
import cors from "cors";

const router = Router();
router.use(cors());

router.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Unexpected route",
  });
});

router.get("/test", test);
router.post("/register", jsonParser, register);

router.post("/login", jsonParser, login);
router.post("/user/change-profile", jsonParser, verifyToken, changeProfile);
router.get("/user/profile", verifyToken, getProfile);

export { router };
