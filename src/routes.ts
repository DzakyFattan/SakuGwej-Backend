import express, { Express, Request, Response, Router } from "express";
import { register, login } from "./userController";
import { test } from "./mainController";
import bodyParser from "body-parser";
import cors from "cors";

var jsonParser = bodyParser.json();

const router = Router();
router.use(cors());

router.get("/", (req: Request, res: Response) => {
  res.send("Hello, this is Express + TypeScript");
});

router.get("/test", test);
router.post("/register", jsonParser, register);

router.post("/login", jsonParser, login);

export { router };
