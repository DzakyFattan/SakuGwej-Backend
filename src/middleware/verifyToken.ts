import { Request, Response } from "express";
import { jwt } from "../utils/jwt";

function verifyToken(
  req: Request & { token?: string; token_data?: Record<any, any> },
  res: Response,
  next: Function
) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
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

export { verifyToken };
