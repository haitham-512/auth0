import express, { type Request, type Response } from "express";
import passport from "passport";
import { Strategy } from "passport-oauth2";

const app = express();
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("<h1>It's work!</h1>");
});

app.listen(3000, (err) => {
  if (!err) {
    console.log("Server on port 3000");
  }
});
