import { Request, Response } from "express";
import db from "../utils/db";
import crypto from "crypto-js";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";
import { jwt } from "../utils/jwt";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
import { getUpdatedvalues } from "../services/profile/updatedValues";
import { HttpStatusCode } from "../types/HttpStatusCode";
import { AWS } from "../utils/aws";
import { imageMimeType } from "../types/imageMimetypes";
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
      theme: "bochi_the_default",
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
  try {
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
        _id: result._id,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );
    res.send({
      message: "Login successful",
      token: token,
      theme: result.theme ? result.theme : "bochi_the_default",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

const changeProfilePicture = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (req.files.length == 0 || req.files.length > 1) {
    res.status(HttpStatusCode.BAD_REQUEST).send({
      message: "Invalid File Amount",
    });
    return;
  }
  let imageFile = req.files[0];
  if (!imageMimeType.includes(imageFile.mimetype)) {
    res.status(HttpStatusCode.BAD_REQUEST).send({
      message: "Invalid File Type",
    });
    return;
  }

  try {
    let s3 = new AWS.S3();

    // upload to s3
    let params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: Math.floor(Date.now() / 1000) + "_" + imageFile.originalname,
      Body: imageFile.buffer,
      ContentType: imageFile.mimetype,
    };
    const uploadData = await s3
      .upload(params, (err: any) => {
        if (err) {
          console.log(err);
          res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send();
          return;
        }
      })
      .promise();

    // update on successful upload
    const collection = (await db).db("sakugwej").collection("users");
    let query = { _id: new ObjectId(req.token_data?._id) };
    let update = {
      $set: {
        profilePicture: uploadData.Location,
      },
    };

    // check if there is a profile picture already set and delete it
    let queryResult = await collection.findOne(query);
    if (queryResult?.profilePicture) {
      let deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: queryResult.profilePicture.split("/").pop(),
      };
      s3.deleteObject(deleteParams, (err: any) => {
        if (err) {
          console.log(err);
          res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            message: "Unable to delete existing profile picture",
          });
          return;
        }
      });
    }

    // update database
    collection.updateOne(query, update);

    // send response
    res.status(HttpStatusCode.OK).send({
      message: "Profile picture updated successfully",
      profilePicture: uploadData.Location,
    });
  } catch (err) {
    console.log(err);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
      message: "Internal server error",
    });
  }
};

const changeProfile = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.body) {
    res.status(400).send({
      message: "Bad Response",
    });
    return;
  }
  try {
    // check if user exists
    const collection = (await db).db("sakugwej").collection("users");
    let query = { _id: new ObjectId(req.token_data?._id) };
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

const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const collection = (await db).db("sakugwej").collection("users");
    let query = { _id: new ObjectId(req.token_data?._id) };
    let result = await collection.findOne(query);
    if (!result) {
      res.status(400).send({
        message: "User not found",
      });
    }
    res.status(200).send({
      message: "success",
      data: {
        ...result,
        _id: undefined,
        password: undefined,
        salt: undefined,
        theme: undefined,
      },
    });
    return;
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal server error",
    });
    return;
  }
};

export { register, login, changeProfile, getProfile, changeProfilePicture };
