import db from "../../utils/db";
import dotenv from "dotenv";
dotenv.config();

async function emailExisted(email: String) {
  const collection = (await db).db("sakugwej").collection("users");
  let query = { email: email };
  try {
    let result = await collection.findOne(query);
    if (result) {
      return true;
    }
  } catch (err) {
    // defaults to true if error occured
    return true;
  }
  return false;
}

async function usernameExisted(username: String) {
  const collection = (await db).db("sakugwej").collection("users");
  let query = { username: username };
  try {
    let result = await collection.findOne(query);
    if (result) {
      return true;
    }
  } catch (err) {
    // defaults to true if error occured
    return true;
  }
  return false;
}

export { emailExisted, usernameExisted };
