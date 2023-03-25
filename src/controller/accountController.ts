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
    const checkUser = (await db).db("sakugwej").collection("users");
    let query = { _id: new ObjectId(req.token_data?._id) };
    let user = await checkUser.findOne(query);
    if (!user) {
      res.status(400).send({
        message: "User not found",
      });
      return;
    }
    const collection = (await db).db("sakugwej").collection("accounts");
    let query2 = { userId: new ObjectId(req.token_data?._id) };
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
    const checkUser = (await db).db("sakugwej").collection("users");
    let query = { _id: new ObjectId(req.token_data?._id) };
    let user = await checkUser.findOne(query);
    if (!user) {
      res.status(400).send({
        message: "User not found",
      });
      return;
    }
    const collection = (await db).db("sakugwej").collection("accounts");
    const addDocument = {
      userId: new ObjectId(req.token_data?._id),
      accountName: req.body.account_name,
      accountNumber: req.body.account_number,
    };
    const addResult = await collection.insertOne(addDocument);
    res.status(HttpStatusCode.CREATED).send({
      message: "Account added",
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
    const checkUser = (await db).db("sakugwej").collection("users");
    let query = { _id: new ObjectId(req.token_data?._id) };
    let user = await checkUser.findOne(query);
    if (!user) {
      res.status(400).send({
        message: "User not found",
      });
      return;
    }
    const collection = (await db).db("sakugwej").collection("accounts");
    let filter = { userId: new ObjectId(req.token_data?._id) };
    // update only the fields that are provided
    const updateDocument = {
      $set: {
        accountName: req.body.accountName,
        accountNumber: req.body.accountNumber,
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
    const checkUser = (await db).db("sakugwej").collection("users");
    let query = { _id: new ObjectId(req.token_data?._id) };
    let user = await checkUser.findOne(query);
    if (!user) {
      res.status(400).send({
        message: "User not found",
      });
      return;
    }
    const collection = (await db).db("sakugwej").collection("accounts");
    let filter = { userId: new ObjectId(req.token_data?._id) };
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
