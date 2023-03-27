import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
import { HttpStatusCode } from "../types/HttpStatusCode";
import db from "../utils/db";
import { ObjectId, SortDirection } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const getTransactions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const _userId = new ObjectId(req.token_data?._id);
    const checkUser = (await db).db("sakugwej").collection("users");
    const filterUser = { 
      _id: _userId 
    };
    let user = await checkUser.findOne(filterUser);
    if (!user) {
      res.status(400).send({
        message: "User not found",
      });
      return;
    }
    const collection = (await db).db("sakugwej").collection("transactions");
    const filterTransaction = { 
      userId: _userId 
    };
    const sortTransaction = {
      createdAt: -1 as SortDirection,
    };
    const skipTransaction = parseInt(req.query.skip as string) || 0;
    const limitTransaction = parseInt(req.query.limit as string) || 10;

    let cursor = collection.
                  find(filterTransaction).
                  sort(sortTransaction).
                  skip(skipTransaction).
                  limit(limitTransaction);
    if ((await collection.countDocuments(filterTransaction)) === 0) {
      res.status(400).send({
        message: "Transaction not found",
        data: _userId
      });
      return;
    }
    let rawResult = await cursor.toArray();
    let utc = new Date().toLocaleDateString("en-US", {
      timeZone: "Asia/Jakarta",
    }).split("/");
    let localDate = `${utc[2]}-${utc[0]}-${utc[1]}`;

    let result: { 
      createdAt: string,  
      notes: any 
    }[] = [];

    rawResult.forEach((item) => {
      let diff = new Date(localDate).getTime() - new Date(item.createdAt).getTime();
      let days = Math.floor(diff / (1000 * 60 * 60 * 24));
      let createdAt = item.createdAt;

      delete item.createdAt
      result[days] = {
        createdAt,
        notes: result[days]?.notes ? [...result[days].notes, item] : [item]
      }
    });

    result = result.filter((item) => item !== null);

    res.status(200).send({
      message: "Transaction(s) found",
      data: [ ...result ],
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
    const userId = new ObjectId(req.token_data?._id);
    const checkUser = (await db).db("sakugwej").collection("users");
    let query = { _id: userId };
    let user = await checkUser.findOne(query);
    if (!user) {
      res.status(400).send({
        message: "User not found",
      });
      return;
    }
    const accountId = new ObjectId(req.body.accountId);
    const checkAccount = (await db).db("sakugwej").collection("accounts");
    let query2 = { _id: accountId, userId: userId };
    let acc = await checkAccount.findOne(query2);
    if (!acc) {
      res.status(400).send({
        message: "Account not found",
      });
      return;
    }
    const collection = (await db).db("sakugwej").collection("transactions");
    const addDocument = {
      userId: userId,
      type: req.body.type,
      amount: req.body.amount,
      category: req.body.category,
      accountId: accountId,
      description: req.body.description,
      createdAt: req.body.createdAt,
    };
    const addResult = await collection.insertOne(addDocument);
    res.status(HttpStatusCode.CREATED).send({
      message: "Transaction added successfully with id " + addResult.insertedId,
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
    const userId = new ObjectId(req.token_data?._id);
    const checkUser = (await db).db("sakugwej").collection("users");
    let query = { _id: userId };
    let user = await checkUser.findOne(query);
    if (!user) {
      res.status(400).send({
        message: "User not found",
      });
      return;
    }
    const accountId = new ObjectId(req.body.accountId);
    const checkAccount = (await db).db("sakugwej").collection("accounts");
    let query2 = {
      userId: userId,
      accountId: accountId,
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
        accountId: accountId,
        type: req.body.type,
        amount: req.body.amount,
        category: req.body.category,
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
    const _userId = new ObjectId(req.token_data?._id);
    const checkUser = (await db).db("sakugwej").collection("users");
    let filterUser = { _id: _userId };
    let user = await checkUser.findOne(filterUser);
    if (!user) {
      res.status(400).send({
        message: "User not found",
      });
      return;
    }
    const collection = (await db).db("sakugwej").collection("transactions");
    const _transactionId = new ObjectId(req.params.id);
    let filterTransaction = _transactionId ?  { userId: _userId, _id: _transactionId } : { userId: _userId };
    const delResult = await collection.deleteOne(filterTransaction);
    res.status(200).send({
      message: "Transaction deleted successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal server error",
      _transactionId: req.query.id,
    });
  }
};

export {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
};
