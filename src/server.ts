import express, { Express, Request, Response } from "express";
import { router } from "./routes/routes";

const app: Express = express();
const port = 3001;

app.use("/api/v1/", router);
app.use((req: Request, res: Response) => {
  res.status(404).send({
    message: "Unexpected route",
  });
})

app.listen(port, () => {
  console.log(`[Server]: I am running at https://localhost:${port}`);
});
