import path from "node:path";
import express, { type Request, type Response } from "express";
import passport from "passport";
import {
  Strategy as OAuth2Strategy,
  type VerifyCallback,
} from "passport-oauth2";
import session from "express-session";
import pug from "pug";
import crypto from "crypto";

const app = express();
app.set("views", path.join(import.meta.dirname, "..", "views"));
app.set("view engine", "pug");
app.engine("pug", pug.renderFile);
app.use(express.static(path.join(import.meta.dirname, "..", "public")));
app.use(
  session({
    secret: "23efcbad857fbfebc777e22dafb8842ed5f75ca17d21719d2b461562e03fe56f",
    name: "session1",
    cookie: {
      httpOnly: true,
      maxAge: Date.now() + 3600_000,
      sameSite: "lax",
      secure: true,
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new OAuth2Strategy(
    {
      authorizationURL: "https://idp.sso.tools/528-auth0/oauth2/authorize",
      tokenURL: "https://idp.sso.tools/528-auth0/oauth2/token",
      clientID: "c275bc33-4c4a-46db-9765-c70b83c2ed12",
      clientSecret: "JJ8BYO1OMCE7OHG9FW1ARUIPT0XNMU9M",
      scope: ["profile", "email", "openid"],
      callbackURL: "https://auth0-pp-iota.vercel.app/login/sso/cb",
    },
    (
      accessToken: string,
      refreshToken: string,
      profile: any,
      verified: VerifyCallback,
    ) => {
      return verified(null, accessToken);
    },
  ),
);
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user: any, done) {
  done(null, user);
});

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("<h1>It's work!</h1>");
});

app.get("/login", (req: Request, res: Response) => {
  res.status(200).render("login/index");
});

app.get("/login/sso", passport.authenticate("oauth2"));
app.get(
  "/login/sso/cb",
  passport.authenticate("oauth2", {
    failureRedirect: "/login/sso",
    failureFlash: true,
  }),
  async (req: Request, res: Response) => {
    const accessToken = req.user as string;
    const response = await fetch(
      "https://idp.sso.tools/528-auth0/api/users/me",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      },
    );

    const user = await response.json();
    res.status(200).json(user);
  },
);

app.listen(3000, (err) => {
  if (!err) {
    console.log("Server on port 3000");
  }
});

export default app;
