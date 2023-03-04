import express, { Express, Request, Response, Router } from "express";
import { register, login, changeProfile, getProfile } from "./userController";
import { test } from "./mainController";
import bodyParser from "body-parser";
import cors from "cors";
var jwt = require('jsonwebtoken');

var jsonParser = bodyParser.json();

function verifyToken(req: Request & { token?: string, token_data?: Record<any, any> }, res: Response, next: Function){
  const bearerHeader = req.headers['authorization'];
  if(typeof bearerHeader !== 'undefined'){
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    try {
      let decoded = jwt.verify(bearerToken, process.env.JWT_SECRET!);
      req.token_data = decoded;
      req.token = bearerToken;
      next();
    } catch (err) {
      res.status(403).send({
        message: "Invalid auth token provided",
        });
      return;
    }
  } else {
    res.status(401).send({
      message: "No auth token provided",
      });
  }
}

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
