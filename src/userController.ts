import { Request, Response } from "express";
import db from "./db";
import crypto from "crypto-js";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";
var jwt = require('jsonwebtoken');

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
        username: result.username 
      }, 
      process.env.JWT_SECRET!, 
      { expiresIn: '7d' }
    );
    res.send({
      message: "Login successful",
      token: token
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

const changeProfile = async (req: Request & { token?: string, token_data?: Record<any, any> }, res: Response) => {
  if (!req.body) {
    res.status(400).send({
      message: "Bad Response",
    });
    return;
  }

  // TODO: Change oldUsername to JWT or something along those lines to verify user
  const {
    newUsername,
    newPassword,
    newGender,
    newBirthDate,
    newEmail,
    newPhoneNumber,
  } = req.body;

  let oldUsername = req.token_data?.username;

  // check if user exists
  const collection = (await db).db("sakugwej").collection("users");
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
  let updates: Record<any, any> = {};

  // prepare to update username
  if (newUsername != undefined && newUsername != "") {
    // check if newUsername is taken
    query = { username: newUsername };
    result = await collection.findOne(query);
    if (result) {
      res.status(400).send({
        message: "Username taken",
      });
      return;
    }

    // add the newUsername to the update list
    updates.username = newUsername;
  }

  if (newPassword != undefined && newPassword != "") {
    try {
      const encryptedPass = crypto.AES.encrypt(
        newPassword,
        process.env.PASS_SECRET!
      ).toString();
      updates.password = encryptedPass;
    } catch (err) {
      console.log(err);
      res.status(500).send({
        message: "Internal server error",
      });
    }
  }

  if (newGender != undefined && newGender != "") {
    let genders = ["Perempuan", "Laki-Laki", "Lainnya", "Roti Tawar"];
    if (!genders.includes(newGender)) {
      res.status(400).send({
        message: "Invalid gender",
      });
      return;
    }

    updates.gender = newGender;
  }

  if (newBirthDate != undefined && newBirthDate != "") {
    let dateRegex = new RegExp("[\\d]{4}-[\\d]{2}-[\\d]{2}");
    if (!dateRegex.test(newBirthDate)) {
      res.status(400).send({
        message: "Invalid birth date",
      });
      return;
    }
    updates.birthDate = new Date(newBirthDate);
  }

  if (newEmail != undefined && newEmail != "") {
    let emailRegex = new RegExp("[\\w\\d]*@[\\w\\d]+(\\.[\\w\\d]+)+");
    if (!emailRegex.test(newEmail)) {
      res.status(400).send({
        message: "Invalid email",
        err_on: "newEmail",
      });
      return;
    }
    // check if email is taken
    let query_email = { email: newEmail };
    result = await collection.findOne(query_email);
    if (result) {
      res.status(400).send({
        message: "Email taken",
      });
      return;
    }

    updates.email = newEmail;
  }

  if (newPhoneNumber != undefined && newPhoneNumber != "") {
    let phoneRegex = new RegExp("[\\d]{10,13}");
    if (!phoneRegex.test(newPhoneNumber)) {
      res.status(400).send({
        message: "Invalid phone number",
      });
      return;
    }
    updates.phoneNumber = newPhoneNumber;
  }

  let updateDocument = {
    $set: updates,
  };

  try {
    const upd_result = await collection.updateOne(filter, updateDocument);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal server error",
    });
    return;
  }

  res.status(200).send({
    success_message: "Profile updated",
  });
  return;
};

const getProfile = async (req: Request & { token?: string, token_data?: Record<any, any> }, res: Response) => {
    const collection = (await db).db("sakugwej").collection("users");
    let query = { username: req.token_data?.username };
    let result = await collection.findOne(query);
    if (!result) {
        res.status(400).send({
            message: "User not found",
        });
      }
    res.status(200).send({
      message: "sucess",
      data: { ...result, _id: undefined },
    });
    return;
}

export { register, login, changeProfile, getProfile };
