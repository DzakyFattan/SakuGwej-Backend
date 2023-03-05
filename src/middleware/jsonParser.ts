import { Request, Response } from "express";
import bodyParser from "body-parser";

function jsonParser(req: Request, res: Response, next: Function) {
  bodyParser.json()(req, res, (err) => {
    if (err) {
      res.status(400).send({
        message: "Bad Payload",
      });
      return;
    }
    next();
  });
}

export { jsonParser };
