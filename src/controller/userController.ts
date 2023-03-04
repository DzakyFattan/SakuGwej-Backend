import { Request, Response } from "express";
import db from "../utils/db";
import crypto from "crypto-js";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";
import { jwt } from "../utils/jwt";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
import { getUpdatedvalues } from "../services/profile/updatedValues";
import { HttpStatusCode } from "../types/HttpStatusCode";
import {
  emailExisted,
  usernameExisted,
} from "../services/auth/checkDuplicates";

dotenv.config();

const register = async (req: Request, res: Response) => {
  if (!req.body) {
    res.status(400).send({
      message: "Bad Payload",
    });
    return;
  }
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400).send({
      message: "Please provide a username, email and password",
    });
    return;
  }
  if (await emailExisted(email)) {
    res.status(400).send({
      message: "Email already exists",
    });
    return;
  }
  if (await usernameExisted(username)) {
    res.status(400).send({
      message: "Username already exists",
    });
    return;
  }

  const collection = (await db).db("sakugwej").collection("users");
  try {
    const salt = crypto.lib.WordArray.random(64).toString();
    const hashedPass = crypto
      .SHA256(salt + password + process.env.PASS_SECRET!)
      .toString();
    collection.insertOne({
      username: username,
      email: email,
      password: hashedPass,
      salt: salt,
    });
    res.status(HttpStatusCode.CREATED).send();
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const login = async (req: Request, res: Response) => {
  // res.send("Hello, you are in the login route");
  if (!req.body) {
    res.status(400).send({
      message: "Bad Payload",
    });
    return;
  }
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send({
      message: "Please provide an email and password",
    });
    return;
  }
  // search for username and pass
  const collection = (await db).db("sakugwej").collection("users");
  let query = { email: email };
  let result = await collection.findOne(query);
  if (!result) {
    res.status(404).send({
      message: "User not found",
    });
    return;
  }
  try {
    const hashedPass = crypto
      .SHA256(result.salt + password + process.env.PASS_SECRET!)
      .toString();
    if (hashedPass != result.password) {
      res.status(403).send({
        message: "Incorrect password",
      });
      return;
    }
    let token = jwt.sign(
      {
        username: result.username,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );
    res.send({
      message: "Login successful",
      token: token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

const changeProfile = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.body) {
    res.status(400).send({
      message: "Bad Response",
    });
    return;
  }

  // check if user exists
  const collection = (await db).db("sakugwej").collection("users");
  let oldUsername = req.token_data?.username;
  let query = { username: oldUsername };
  let result = await collection.findOne(query);
  if (!result) {
    res.status(400).send({
      message: "User not found",
    });
    return;
  }

  // prepare the user filter query and the update query
  let filter = { _id: new ObjectId(result._id) };
  let updates = await getUpdatedvalues(req, res);

  if (!updates.success) {
    return;
  }

  try {
    let updateDocument = {
      $set: updates.data,
    };
    const upd_result = await collection.updateOne(filter, updateDocument);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal server error",
    });
    return;
  }

  res.status(200).send({
    message: "Profile updated",
  });
  return;
};

const getProfile = async (
  req: Request & { token?: string; token_data?: Record<any, any> },
  res: Response
) => {
  const collection = (await db).db("sakugwej").collection("users");
  let query = { username: req.token_data?.username };
  let result = await collection.findOne(query);
  if (!result) {
    res.status(400).send({
      message: "User not found",
    });
  }
  res.status(200).send({
    message: "success",
    data: { ...result, _id: undefined, password: undefined },
  });
  return;
};

export { register, login, changeProfile, getProfile };
