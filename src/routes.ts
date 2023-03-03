import express, { Express, Request, Response, Router } from "express";
import { register, login, changeProfile } from "./userController";
import { test } from "./mainController";
import bodyParser, { urlencoded } from "body-parser";
import cors from "cors";

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: true });

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
router.post("/user/change-profile", urlencodedParser, changeProfile);

export { router };
