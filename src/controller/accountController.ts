import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
import { HttpStatusCode } from "../types/HttpStatusCode";
import db from "../utils/db";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const getAccounts = async (
  req: Request & { token?: string; token_data?: Record<any, any> },
  res: Response
) => {
  try {
    // check if user exists
    const userId  = new ObjectId(req.token_data?._id);
    const checkUser = (await db).db("sakugwej").collection("users");
    let query = { _id: userId };
    let user = await checkUser.findOne(query);
    if (!user) {
      res.status(400).send({
        message: "User not found",
      });
      return;
    }
    const collection = (await db).db("sakugwej").collection("accounts");
    let query2 = { userId: userId };
    let cursor = collection.find(query2);
    if ((await collection.countDocuments(query2)) === 0) {
      res.status(400).send({
        message: "Account not found",
      });
      return;
    }
    let result = await cursor.toArray();
    res.status(200).send({
      message: "Account(s) found",
      data: { ...result, _id: undefined },
    });
    return;
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const addAccount = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.body) {
    res.status(400).send({
      message: "Bad Payload",
    });
    return;
  }
  try {
    // check if user exists
    const _userId    = new ObjectId(req.token_data?._id);
    const checkUser = (await db).db("sakugwej").collection("users");
    let query = { _id: _userId };
    let user = await checkUser.findOne(query);
    if (!user) {
      res.status(400).send({
        message: "User not found",
      });
      return;
    }
    const collection  = (await db).db("sakugwej").collection("accounts");
    const addDocument = {
      userId: _userId,
      accountName: req.body.account_name,
      accountNumber: req.body.account_number,
      accountDescription: req.body.account_description,
    };
    const addResult = await collection.insertOne(addDocument);
    res.status(HttpStatusCode.CREATED).send({
      message: "Account added successfully with id " + addResult.insertedId,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const updateAccount = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.body) {
    res.status(400).send({
      message: "Bad Payload",
    });
    return;
  }
  try {
    const _userId   = new ObjectId(req.token_data?._id);
    const checkUser = (await db).db("sakugwej").collection("users");
    let query = { _id: _userId };
    let user = await checkUser.findOne(query);
    if (!user) {
      res.status(400).send({
        message: "User not found",
      });
      return;
    }
    const collection = (await db).db("sakugwej").collection("accounts");
    let filter = { userId: _userId };
    // update only the fields that are provided
    const updateDocument = {
      $set: {
        accountName: req.body.accountName,
        accountNumber: req.body.accountNumber,
        accountDescription: req.body.account_description,
      },
    };
    const updResult = await collection.updateOne(filter, updateDocument);
    res.status(200).send({
      message: "Account updated successfully",
    });
    return;
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const deleteAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const _userId   = new ObjectId(req.token_data?._id);
    const checkUser = (await db).db("sakugwej").collection("users");
    let query = { _id: _userId };
    let user = await checkUser.findOne(query);
    if (!user) {
      res.status(400).send({
        message: "User not found",
      });
      return;
    }
    const collection = (await db).db("sakugwej").collection("accounts");
    let filter = { userId: _userId };
    const delResult = await collection.deleteOne(filter);
    res.status(200).send({
      message: "Account deleted successfully",
    });
    return;
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

export { getAccounts, addAccount, updateAccount, deleteAccount };
