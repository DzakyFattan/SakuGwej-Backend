import { Response } from "express";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
import { HttpStatusCode } from "../types/HttpStatusCode";
import db from "../utils/db";
import { ObjectId, SortDirection } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const getAccounts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // check if user exists
    const _userId = new ObjectId(req.token_data?._id);
    const checkUser = (await db).db("sakugwej").collection("users");
    const filterUser = {
      _id: _userId,
    };
    let user = await checkUser.findOne(filterUser);
    if (!user) {
      res.status(400).send({
        message: "User not found",
      });
      return;
    }
    const collection = (await db).db("sakugwej").collection("accounts");
    const filterAccount = {
      userId: _userId,
    };
    const sortAccount = {
      priority: -1 as SortDirection,
      name: 1 as SortDirection,
    };
    const limitAccount = parseInt(req.query.limit as string) || 10;
    const skipAccount = parseInt(req.query.skip as string) || 0;

    let cursor = collection
      .find(filterAccount)
      .sort(sortAccount)
      .limit(limitAccount)
      .skip(skipAccount);
    if ((await collection.countDocuments(filterAccount)) === 0) {
      res.status(400).send({
        message: "Account not found",
      });
      return;
    }
    let result = await cursor.toArray();
    res.status(200).send({
      message: "Account(s) found",
      data: [...result],
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
    const _userId = new ObjectId(req.token_data?._id);
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
    const addDocument = {
      userId: _userId,
      name: req.body.name,
      number: req.body.number,
      amount: parseFloat(req.body.amount),
      description: req.body.description,
      image: req.body.image,
      priority: parseInt(req.body.priority) || -1,
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
    const _userId = new ObjectId(req.token_data?._id);
    const checkUser = (await db).db("sakugwej").collection("users");
    let query = { _id: _userId };
    let user = await checkUser.findOne(query);
    if (!user) {
      res.status(400).send({
        message: "User not found",
      });
      return;
    }
    const _accountId = new ObjectId(req.params.id);
    const collection = (await db).db("sakugwej").collection("accounts");
    let filter = { userId: _userId, _id: _accountId };
    // update only the fields that are provided
    const updateDocument = {
      $set: {
        name: req.body.name,
        number: req.body.number,
        amount: parseFloat(req.body.amount),
        description: req.body.description,
        gambar: req.body.gambar,
        priority: parseInt(req.body.priority),
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
    const _userId = new ObjectId(req.token_data?._id);
    const checkUser = (await db).db("sakugwej").collection("users");
    let query = { _id: _userId };
    let user = await checkUser.findOne(query);
    if (!user) {
      res.status(400).send({
        message: "User not found",
      });
      return;
    }
    const _accountId = new ObjectId(req.params.id);
    const collection = (await db).db("sakugwej").collection("accounts");
    let filter = { userId: _userId, _id: _accountId };
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
