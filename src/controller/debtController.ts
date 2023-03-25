import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
import { HttpStatusCode } from "../types/HttpStatusCode";
import db from "../utils/db";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const getDebts = async (
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
    const collection = (await db).db("sakugwej").collection("debts");
    let query2 = { userId: new ObjectId(req.token_data?._id) };
    let cursor = collection.find(query2);
    if ((await collection.countDocuments(query2)) === 0) {
      res.status(400).send({
        message: "Debt not found",
      });
      return;
    }
    let result = await cursor.toArray();
    res.status(200).send({
      message: "Debt(s) found",
      data: { ...result, _id: undefined },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const addDebt = async (req: AuthenticatedRequest, res: Response) => {
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
    const collection = (await db).db("sakugwej").collection("debts");
    const addDebt = {
      userId: new ObjectId(req.token_data?._id),
      type: req.body.type,
      amount: req.body.amount,
      name: req.body.name,
      description: req.body.description,
      dueDate: req.body.dueDate,
    };
    const addResult = await collection.insertOne(addDebt);
    res.status(HttpStatusCode.CREATED).send({
      message: "Debt added successfully with id " + addResult.insertedId,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const updateDebt = async (req: AuthenticatedRequest, res: Response) => {
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
    const collection = (await db).db("sakugwej").collection("debts");
    let filter = { userId: new ObjectId(req.token_data?._id) };
    const updateDocument = {
      $set: {
        accountId: req.body.accountId,
        type: req.body.type,
        amount: req.body.amount,
        name: req.body.name,
        description: req.body.description,
        startDate: req.body.startDate,
        dueDate: req.body.dueDate,
      },
    };
    const updResult = await collection.updateOne(filter, updateDocument);
    res.status(200).send({
      message: "Debt updated successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const deleteDebt = async (req: AuthenticatedRequest, res: Response) => {
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
    const collection = (await db).db("sakugwej").collection("debts");
    let filter = { userId: new ObjectId(req.token_data?._id) };
    const delResult = await collection.deleteOne(filter);
    res.status(200).send({
      message: "Debt deleted successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

export { getDebts, addDebt, updateDebt, deleteDebt };
