import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
import { HttpStatusCode } from "../types/HttpStatusCode";
import db from "../utils/db";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const getTransactions = async (
  req: Request & { token?: string; token_data?: Record<any, any> },
  res: Response
) => {
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
    const collection = (await db).db("sakugwej").collection("transactions");
    let query2 = { user_id: new ObjectId(req.token_data?._id) };
    let cursor = collection.find(query2);
    if ((await collection.countDocuments(query2)) === 0) {
      res.status(400).send({
        message: "Transaction not found",
      });
      return;
    }
    let result = await cursor.toArray();
    res.status(200).send({
      message: "Transaction(s) found",
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

const addTransaction = async (req: AuthenticatedRequest, res: Response) => {
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
    const checkAccount = (await db).db("sakugwej").collection("accounts");
    let query2 = { userId: new ObjectId(req.token_data?._id), accountId: req.body.accountId };
    let acc = await checkAccount.findOne(query2);
    if (!acc) {
      res.status(400).send({
        message: "Account not found",
      });
      return;
    }
    const collection = (await db).db("sakugwej").collection("transactions");
    const addDocument = {
      userId: new ObjectId(req.token_data?._id),
      accountId: req.body.accountId,
      type: req.body.type,
      amount: req.body.amount,
      description: req.body.description,
      createdAt: req.body.date,
    };
    const addResult = await collection.insertOne(addDocument);
    res.status(HttpStatusCode.CREATED).send({
      message: "Transaction added successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const updateTransaction = async (req: AuthenticatedRequest, res: Response) => {
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
    const checkAccount = (await db).db("sakugwej").collection("accounts");
    let query2 = {
      user_id: new ObjectId(req.token_data?._id),
      accountId: req.body.accountId,
    };
    let acc = await checkAccount.findOne(query2);
    if (!acc) {
      res.status(400).send({
        message: "Account not found",
      });
      return;
    }
    const collection = (await db).db("sakugwej").collection("transactions");
    let filter = { userId: new ObjectId(req.token_data?._id) };
    const updateDocument = {
      $set: {
        accountId: req.body.accountId,
        type: req.body.type,
        amount: req.body.amount,
        description: req.body.description,
        createdAt: req.body.date,
      },
    };
    const updResult = await collection.updateOne(filter, updateDocument);
    res.status(200).send({
      message: "Transaction updated successfully",
    });
    return;
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const deleteTransaction = async (req: AuthenticatedRequest, res: Response) => {
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
    const checkAccount = (await db).db("sakugwej").collection("accounts");
    let query2 = {
      user_id: new ObjectId(req.token_data?._id),
      accountId: req.body.accountId,
    };
    let acc = await checkAccount.findOne(query2);
    if (!acc) {
      res.status(400).send({
        message: "Account not found",
      });
      return;
    }
    const collection = (await db).db("sakugwej").collection("transactions");
    let filter = { userId: new ObjectId(req.token_data?._id) };
    const delResult = await collection.deleteOne(filter);
    res.status(200).send({
      message: "Transaction deleted successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

export {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
};
