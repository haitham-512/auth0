import path from "node:path";
import express, { type Request, type Response } from "express";
import passport from "passport";
import RedisStore from "connect-redis";
import { createClient } from "redis";
import session from "express-session";
import pug from "pug";
import crypto from "crypto";
import { Strategy as GithubStrategy } from "passport-github2";
// import {
//   Strategy as OAuth2Strategy,
//   type VerifyCallback,
// } from "passport-oauth2";
// import {
//   Strategy as GoogleStrategy,
//   type VerifyCallback as GoogleVerifyCallback,
// } from "passport-google-oauth20";

const app = express();
app.set("views", path.join(import.meta.dirname, "..", "views"));
app.set("view engine", "pug");
app.engine("pug", pug.renderFile);
app.use(express.static(path.join(import.meta.dirname, "..", "public")));

const redisClient = createClient({
  url: "rediss://default:tyrnCpkD2178gzSYDMwlrGJq@oauthdb-icy-forge.sage.cloud.layerbase.dev:6379",
  socket: {
    tls: true,
    servername: "oauthdb-icy-forge.sage.cloud.layerbase.dev", // <-- Add this line
  },
});
await redisClient.connect();
const store = new RedisStore({
  client: redisClient,
  prefix: "oauthapp:",
});
app.use(
  session({
    store,
    secret: "23efcbad857fbfebc777e22dafb8842ed5f75ca17d21719d2b461562e03fe56f",
    name: "session1",
    cookie: {
      httpOnly: true,
      maxAge: Date.now() + 3600_000,
      sameSite: "lax",
      secure: true,
    },
    saveUninitialized: false,
    resave: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());
// passport.use(
//   new OAuth2Strategy(
//     {
//       authorizationURL: "https://idp.sso.tools/oauth2666/oauth2/authorize",
//       tokenURL: "https://idp.sso.tools/oauth2666/oauth2/token",
//       clientID: "d77cc134-17cb-47a2-9522-bceb75500b00",
//       clientSecret: "7WEARIQIIARUF8TGGDGNA743U4X9IY5Q",
//       scope: ["profile", "email", "openid"],
//       callbackURL: "https://auth0-pp-iota.vercel.app/login/sso/cb",
//     },
//     (
//       accessToken: string,
//       refreshToken: string,
//       profile: any,
//       verified: VerifyCallback,
//     ) => {
//       return verified(null, accessToken);
//     },
//   ),
// );
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GoogleClientID!,
//       clientSecret: process.env.GoogleClientSecret!,
//       callbackURL: "https://auth0-pp-iota.vercel.app/login/sso/cb",
//     },
//     (
//       accessToken: string,
//       refreshToken: string,
//       profile: any,
//       verified: GoogleVerifyCallback,
//     ) => {
//       return verified(null, profile);
//     },
//   ),
// );
passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GithubClientID,
      clientSecret: process.env.GithubSecret,
      callbackURL: "https://auth0-pp-iota.vercel.app/login/sso/cb",
    },
    (
      accessToken: string,
      refreshToken: string,
      profile: any,
      verified: any,
    ) => {
      return verified(null, profile);
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

app.get(
  "/login/sso",
  passport.authenticate("google", { scope: ["email", "profile"] }),
);
app.get(
  "/login/sso/cb",
  passport.authenticate("google", {
    failureRedirect: "/login/sso",
    failureFlash: true,
  }),
  async (req: Request, res: Response) => {
    // const accessToken = req.user as string;
    // const response = await fetch(
    //   "https://idp.sso.tools/oauth2666/api/users/me",
    //   {
    //     method: "GET",
    //     headers: {
    //       Authorization: `Bearer ${accessToken}`,
    //       Accept: "application/json",
    //     },
    //   },
    // );

    // const user = await response.json();
    res.status(200).render("home/index", req.user);
  },
);

app.listen(3000, (err) => {
  if (!err) {
    console.log("Server on port 3000");
  }
});

export default app;
