import path from "node:path";
import express, { type Request, type Response } from "express";
import passport from "passport";
import * as connectRedis from "connect-redis";
import { createClient } from "redis";
import session from "express-session";
import pug from "pug";
import crypto from "crypto";
import { Strategy as GithubStrategy } from "passport-github2";
import * as oidc from "openid-client";
import { Strategy as SAMLStrategy } from "passport-saml";
// import {
//   Strategy as OAuth2Strategy,
//   type VerifyCallback,
// } from "passport-oauth2";
// import {
//   Strategy as GoogleStrategy,
//   type VerifyCallback as GoogleVerifyCallback,
// } from "passport-google-oauth20";

/************ Express *************/
const app = express();
app.set("views", path.join(import.meta.dirname, "..", "views"));
app.set("view engine", "pug");
app.engine("pug", pug.renderFile);
app.use(express.static(path.join(import.meta.dirname, "..", "public")));

/**************** Redis ****************/
const RedisStore =
  (connectRedis as any).RedisStore ||
  (connectRedis as any).default?.RedisStore ||
  (connectRedis as any).default ||
  connectRedis;

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

/**************** Passport ****************/
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
// passport.use(
//   new GithubStrategy(
//     {
//       clientID: process.env.GithubClientID,
//       clientSecret: process.env.GithubSecret,
//       callbackURL: "https://auth0-pp-iota.vercel.app/login/sso/cb",
//     },
//     (
//       accessToken: string,
//       refreshToken: string,
//       profile: any,
//       verified: any,
//     ) => {
//       return verified(null, profile);
//     },
//   ),
// );

const strategy = new SAMLStrategy(
  {
    entryPoint: "https://idp.sso.tools/samlpro1258/saml/login/request",
    issuer: "https://auth0-pp-iota.vercel.app/metadata",
    callbackUrl: "https://auth0-pp-iota.vercel.app/login/sso/cb",
    cert: "MIIC/DCCAeSgAwIBAgIULf+7cqxFtfuyZRTkKbEMX/28MrIwDQYJKoZIhvcNAQEL\nBQAwODELMAkGA1UEBhMCR0IxEjAQBgNVBAoMCVNTTyBUb29sczEVMBMGA1UECwwM\nU0FNTCBQcm9qZWN0MB4XDTI2MTEwMzIzMjYxNVoXDTQ2MTAyOTIzMjYxNVowODEL\nMAkGA1UEBhMCR0IxEjAQBgNVBAoMCVNTTyBUb29sczEVMBMGA1UECwwMU0FNTCBQ\ncm9qZWN0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu7ZiRt7G2m6k\n13vbCpJJXWcSRlPhtDtRGyTG4W2MSk5/OyS4bUUzJZ9SefxiaPGDHp8M4/11+3Ro\nu3dCxiOQTfBE7uh3GEigYJA5Zlj55D631pVdk21a7Y1Zp9q5KnyOJ4IJeXxHBV1d\nutNtYl8GYBr8V8TVTicIOi9jZb2q9AwnIZ0/dSB7BC3MbcngVmbRWX4AKFPJ9j7s\nHVfz1zMnMExaWgHwQR8Ucmh1T3MKp6Eooi/iqZyHUkXTeWhE+RN3KtiTL+ATAFWb\n8JPJhHWNF8b11xPpDGdSJaSxgs640od+nswMsb/O4XOBkfSjrMbAPP3l6bffAmts\npgUtbBjMjQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQAkYsw+cpcpvm8RAhPweBcR\nrtGk7OWu6XECiCYHhQdAIPFX8mKZT4YAp23sekg+IjHw+yzSXFJUtAQIqalWf1mz\nFZiKqrGzkus0GrDSYEW/LBggP7RnMvUXWg/ONjRY9EZU4mbLLCaMgHBN1/cgp7bz\nQ1EJFbKAlKZRtVU81UjmE04INGGHdP22FCF0wg/HiPUHzVDj6hils9BfkuFgnB03\ndLaAA54TZyPxKzW+wqn404/NP9XBx+1HWOq9Jh68Eo36CX2r+n+dbOEEvBx2euOV\nkDDZn8MY152JAhdry/hRmp+fzli80xoaOG7twTG9+4wVun3OAQyBdzyKcM1UFA2w",
  },
  (profile: any, verified: any) => {
    verified(null, profile);
  },
);
passport.use(strategy);

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user: any, done) {
  done(null, user);
});

/**************** App ****************/
app.get("/", (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    const userProfile = req.user;

    res.json({
      message: "Successfully retrieved SAML profile",
      profile: userProfile,
    });
  } else {
    res.status(200).send("<h1>It's work!</h1>");
  }
});

app.get("/login", (req: Request, res: Response) => {
  res.status(200).render("login/index");
});

app.get(
  "/login/sso",
  passport.authenticate("saml", { scope: ["email", "profile"] }),
);
app.post(
  "/login/sso/cb",
  passport.authenticate("saml", {
    failureRedirect: "/login",
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
    // console.log(req.user);
    // res.status(200).render("home/index", req.user);
    res.redirect("/");
  },
);

app.get("/metadata", (req, res) => {
  const metadata = strategy.generateServiceProviderMetadata(null, null);
  res.type("application/xml");
  res.status(200).send(metadata);
});

app.listen(3000, (err) => {
  if (!err) {
    console.log("Server on port 3000");
  }
});

export default app;
