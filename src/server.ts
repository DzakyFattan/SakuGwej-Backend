import express, { Express, Request, Response } from "express";
import { router } from "./routes";

const app: Express = express();
const port = 3001;

app.use("/", router);

app.listen(port, () => {
  console.log(`[Server]: I am running at https://localhost:${port}`);
});
