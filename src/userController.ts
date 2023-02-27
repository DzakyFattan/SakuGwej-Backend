import { Request, Response } from "express";
import db from "./db";
import crypto from "crypto-js";
import dotenv from "dotenv";

dotenv.config();

const register = async (req: Request, res: Response) => {
    if (!req.body) {
        res.status(400).send("Please provide a username and password");
        return;
    }
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).send("Please provide a username and password");
        return;
    }
    const collection = (await db).db("sakugwej").collection("users");
    let query = { username: username };
    let result = await collection.findOne(query);
    if (result) {
        res.status(400).send("User already exists");
        return;
    }
    try {
        const encryptedPass = crypto.AES.encrypt(password, process.env.PASS_SECRET!).toString();
        const insert = await collection.insertOne({ username, password: encryptedPass });
        res.send(insert).status(204);
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
};

const login = async (req: Request, res: Response) => {
    // res.send("Hello, you are in the login route");
    if (!req.body) {
        res.status(400).send("Please provide a username and password");
        return;
    }
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).send("Please provide a username and password");
        return;
    }
    // search for username and pass
    const collection = (await db).db("sakugwej").collection("users");
    let query = { username: username };
    let result = await collection.findOne(query);
    if (!result) {
        res.status(404).send("User not found");
        return;
    }
    try {
        const decryptedPass = crypto.AES.decrypt(result.password, process.env.PASS_SECRET!).toString(crypto.enc.Utf8);
        if (decryptedPass != password) {
            // console.log(decryptedPass, password);
            res.status(400).send("Incorrect password");
            return;
        }
    res.send(result);
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
};

export { register, login };
