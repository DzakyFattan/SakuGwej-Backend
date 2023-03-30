import { Response } from "express";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
import { HttpStatusCode } from "../types/HttpStatusCode";
import db from "../utils/db";
import { ObjectId, SortDirection } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const getInfo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const _userId = new ObjectId(req.token_data?._id);
    const checkUser = (await db).db("sakugwej").collection("users");
    const filterUser = { _id: _userId };
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
      priority: { $exists: true, $ne: null },
    };
    const sortAccount = {
      priority: 1 as SortDirection,
    };

    let cursor = collection.find(filterAccount).sort(sortAccount);
    if ((await collection.countDocuments(filterAccount)) === 0) {
      res.status(400).send({
        message: "No Data",
      });
      return;
    }
    let result = await cursor.toArray();
    res.status(200).send({
      message: "Fetched Successfully",
      data: {
        accounts: [...result],
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const updateInfo = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.body) {
    res.status(400).send({
      message: "Bad Payload",
    });
    return;
  }
  try {
    res.status(200).send({
      message: "Updated",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

export { getInfo, updateInfo };
