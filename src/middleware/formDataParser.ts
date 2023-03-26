import { Request, Response } from "express";
var multer = require('multer');
var upload = multer();

function formDataParser(req: Request, res: Response, next: Function) {
  upload.any()(req, res, (err: any) => {
    if (err) {
      res.status(400).send({
        message: "Bad Payload",
      });
      return;
    }
    next();
  });
}

export { formDataParser };
