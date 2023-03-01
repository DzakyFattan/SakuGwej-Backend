import { Request, Response } from "express";
import db from "./db";

const test = async (req: Request, res: Response) => {
  res.send({
    message: "Hello, you are in the test route",
  });
};

export { test };
