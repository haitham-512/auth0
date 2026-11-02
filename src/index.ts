import path from "node:path";
import express, { type Request, type Response } from "express";
import passport from "passport";
import { Strategy } from "passport-oauth2";
import pug from "pug";

const app = express();
app.set("views", path.join(import.meta.dirname, "..", "views"));
app.set("view engine", "pug");
app.engine("pug", pug.renderFile);
app.use(express.static(path.join(import.meta.dirname, "..", "public")));
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("<h1>It's work!</h1>");
});

app.get("/login", (req: Request, res: Response) => {
  res.status(200).render("login/index");
});

app.listen(3000, (err) => {
  if (!err) {
    console.log("Server on port 3000");
  }
});

export default app;
