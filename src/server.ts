import express, { Express, Request, Response } from "express";
import { router } from "./routes/routes";

const app: Express = express();
const port = 3001;

app.use("/api/v1/", router);

app.listen(port, () => {
  console.log(`[Server]: I am running at https://localhost:${port}`);
});
