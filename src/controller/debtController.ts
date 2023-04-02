import { Response } from "express";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
import { HttpStatusCode } from "../types/HttpStatusCode";
import db from "../utils/db";
import { ObjectId, SortDirection } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const getDebts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const _userId = new ObjectId(req.token_data?._id);
    const checkUser = (await db).db("sakugwej").collection("users");
    let filterUser = {
      _id: _userId,
    };
    let user = await checkUser.findOne(filterUser);
    if (!user) {
      res.status(400).send({
        message: "User not found",
      });
      return;
    }

    const utc = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Jakarta",
    });
    const now = new Date(utc).toISOString();
    const def = new Date(new Date(utc).getTime() + 30 * 24 * 60 * 60 * 1000);
    const until = req.query.until
      ? new Date(req.query.until as string).toISOString()
      : def.toISOString();

    const collection = (await db).db("sakugwej").collection("debts");
    const filterDebt = {
      userId: _userId,
      dueDate: { $gte: new Date(now), $lte: new Date(until) },
    };
    const sortDebt = {
      dueDate: 1 as SortDirection,
      name: 1 as SortDirection,
      amount: -1 as SortDirection,
    };
    const limitDebt = parseInt(req.query.limit as string) || 10;
    const skipDebt = parseInt(req.query.skip as string) || 0;

    let cursor = collection
      .find(filterDebt)
      .sort(sortDebt)
      .limit(limitDebt)
      .skip(skipDebt);
    if ((await collection.countDocuments(filterDebt)) === 0) {
      res.status(400).send({
        message: "Debt not found",
      });
      return;
    }
    let result = await cursor.toArray();
    res.status(200).send({
      message: "Debt(s) found",
      data: [...result],
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
    const collection = (await db).db("sakugwej").collection("debts");
    const addDebt = {
      userId: new ObjectId(req.token_data?._id),
      type: req.body.type,
      amount: parseFloat(req.body.amount),
      name: req.body.name,
      description: req.body.description,
      startDate: new Date(req.body.startDate),
      dueDate: new Date(req.body.dueDate),
    };
    const addResult = await collection.insertOne(addDebt);
    res.status(HttpStatusCode.CREATED).send({
      message: "Debt added successfully with id " + addResult.insertedId,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal server error",
      err: new Date(req.body.dueDate),
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
    const _debtId = new ObjectId(req.params.id);
    const collection = (await db).db("sakugwej").collection("debts");
    let filter = { userId: _userId, _id: _debtId };
    const updated = () => {
      let update: Record<any, any> = {};
      if (req.body.type && req.body.type !== "") {
        update.type = req.body.type;
      }
      if (req.body.amount) {
        update.amount = parseFloat(req.body.amount);
      }
      if (req.body.name) {
        update.name = req.body.name;
      }
      if (req.body.description) {
        update.description = req.body.description;
      }
      if (req.body.startDate) {
        update.startDate = new Date(req.body.startDate);
      }
      if (req.body.dueDate) {
        update.dueDate = new Date(req.body.dueDate);
      }
      return update;
    };

    const updateDocument = {
      $set: updated(),
    };
    const updResult = await collection.updateOne(filter, updateDocument);
    if (updResult.modifiedCount === 0) {
      res.status(400).send({
        message: "Debt not updated",
      });
      return;
    }

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

    const collection = (await db).db("sakugwej").collection("debts");
    const _debtId = new ObjectId(req.params.id);

    let filterDebt = _debtId ? { _id: _debtId } : {};
    const delResult = await collection.deleteOne(filterDebt);
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
