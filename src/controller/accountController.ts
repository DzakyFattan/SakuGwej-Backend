import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
import db from "../utils/db";
import dotenv from "dotenv";

dotenv.config();

const getAccounts = async (
  req: Request & { token?: string; token_data?: Record<any, any> },
  res: Response
) => {
  try {
    // check if user exists
    const checkUser = (await db).db("sakugwej").collection("users");
    let query = { _id: req.token_data?._id };
    let user = await checkUser.findOne(query);
    if (!user) {
      res.status(400).send({
        message: "User not found",
      });
      return;
    }
    const collection = (await db).db("sakugwej").collection("accounts");
    let query2 = { user_id: req.token_data?._id };
    let result = await collection.findOne(query2);
    if (!result) {
      res.status(400).send({
        message: "Account not found",
      });
      return;
    }
    res.status(200).send({
      message: "Account found",
      data: { ...result, _id: undefined }
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
    let query = { _id: req.token_data?._id };
    let user = await checkUser.findOne(query);
    if (!user) {
      res.status(400).send({
        message: "User not found",
      });
      return;
    }
    const collection = (await db).db("sakugwej").collection("accounts");
    const addDocument = {
      userId: req.token_data?._id,
      accountName: req.body.account_name,
      accountNumber: req.body.account_number,
    };
    let add_result = await collection.insertOne(addDocument);
    res.status(201).send({
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
    let query = { _id: req.token_data?._id };
    let user = await checkUser.findOne(query);
    if (!user) {
      res.status(400).send({
        message: "User not found",
      });
      return;
    }
    const collection = (await db).db("sakugwej").collection("accounts");
    const { newAccName, newAccNumber } = req.body;
    let filter = { user_id: req.token_data?._id };
    // update only the fields that are provided
    const updateDocument = {
      $set: {
        accountName: newAccName,
        accountNumber: newAccNumber,
      },
    };
    let upd_result = await collection.updateOne(filter, updateDocument);
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
    let query = { _id: req.token_data?._id };
    let user = await checkUser.findOne(query);
    if (!user) {
      res.status(400).send({
        message: "User not found",
      });
      return;
    }
    const collection = (await db).db("sakugwej").collection("accounts");
    let filter = { user_id: req.token_data?._id };
    let del_result = await collection.deleteOne(filter);
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
