import { Request, Response } from "express";
import db from "../utils/db";
import crypto from "crypto-js";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";
import { jwt } from "../utils/jwt";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
import { getUpdatedvalues } from "../services/profile/updatedValues";

dotenv.config();

const register = async (req: Request, res: Response) => {
  if (!req.body) {
    res.status(400).send("Please provide a username and password");
    return;
  }
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).send("Please provide a username and password");
    return;
  }
  const collection = (await db).db("sakugwej").collection("users");
  let query = { username: username };
  let result = await collection.findOne(query);
  if (result) {
    res.status(400).send("User already exists");
    return;
  }
  try {
    const encryptedPass = crypto.AES.encrypt(
      password,
      process.env.PASS_SECRET!
    ).toString();
    const insert = await collection.insertOne({
      username,
      password: encryptedPass,
    });
    res.send(insert).status(204);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

const login = async (req: Request, res: Response) => {
  // res.send("Hello, you are in the login route");
  if (!req.body) {
    res.status(400).send("Bad Response");
    return;
  }
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).send("Please provide a username and password");
    return;
  }
  // search for username and pass
  const collection = (await db).db("sakugwej").collection("users");
  let query = { username: username };
  let result = await collection.findOne(query);
  if (!result) {
    res.status(404).send("User not found");
    return;
  }
  try {
    const decryptedPass = crypto.AES.decrypt(
      result.password,
      process.env.PASS_SECRET!
    ).toString(crypto.enc.Utf8);
    if (decryptedPass != password) {
      // console.log(decryptedPass, password);
      res.status(403).send("Incorrect password");
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
