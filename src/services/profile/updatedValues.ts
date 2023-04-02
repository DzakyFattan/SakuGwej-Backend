import { Response } from "express";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import crypto from "crypto-js";
import db from "../../utils/db";

var themes = ["bocchi", "ryo", "nijika", "kita"];

async function getUpdatedvalues(req: AuthenticatedRequest, res: Response) {
  const {
    newUsername,
    newPassword,
    newGender,
    newBirthDate,
    newEmail,
    newPhoneNumber,
    newTheme,
  } = req.body;

  let updates: Record<any, any> = {};
  let result = null;
  let query = null;
  const collection = (await db).db("sakugwej").collection("users");

  // prepare to update username
  if (newUsername != undefined && newUsername != "") {
    // check if newUsername is taken
    query = { username: newUsername };
    result = await collection.findOne(query);
    if (result) {
      res.status(400).send({
        message: "Username taken",
      });
      return { data: null, success: 0 };
    }

    // add the newUsername to the update list
    updates.username = newUsername;
  }

  if (newPassword != undefined && newPassword != "") {
    try {
      const salt = crypto.lib.WordArray.random(64).toString();
      const hashedPass = crypto
        .SHA256(salt + newPassword + process.env.PASS_SECRET!)
        .toString();
      updates.salt = salt;
      updates.password = hashedPass;
    } catch (err) {
      console.log(err);
      res.status(500).send({
        message: "Internal server error",
      });
      return { data: null, success: 0 };
    }
  }

  if (newGender != undefined && newGender != "") {
    let genders = ["Perempuan", "Laki-Laki", "Lainnya", "Roti Tawar"];
    if (!genders.includes(newGender)) {
      res.status(400).send({
        message: "Invalid gender",
      });
      return { data: null, success: 0 };
    }

    updates.gender = newGender;
  }

  if (newBirthDate != undefined && newBirthDate != "") {
    let dateRegex = new RegExp("[\\d]{4}-[\\d]{2}-[\\d]{2}");
    if (!dateRegex.test(newBirthDate)) {
      res.status(400).send({
        message: "Invalid birth date",
      });
      return { data: null, success: 0 };
    }
    updates.birthDate = new Date(newBirthDate);
  }

  if (newEmail != undefined && newEmail != "") {
    let emailRegex = new RegExp("[\\w\\d]*@[\\w\\d]+(\\.[\\w\\d]+)+");
    if (!emailRegex.test(newEmail)) {
      res.status(400).send({
        message: "Invalid email",
        err_on: "newEmail",
      });
      return { data: null, success: 0 };
    }
    // check if email is taken
    let query_email = { email: newEmail };
    result = await collection.findOne(query_email);
    if (result) {
      res.status(400).send({
        message: "Email taken",
      });
      return { data: null, success: 0 };
    }

    updates.email = newEmail;
  }

  if (newPhoneNumber != undefined && newPhoneNumber != "") {
    let phoneRegex = new RegExp("[\\d]{10,13}");
    if (!phoneRegex.test(newPhoneNumber)) {
      res.status(400).send({
        message: "Invalid phone number",
      });
      return { data: null, success: 0 };
    }
    updates.phoneNumber = newPhoneNumber;
  }

  if (newTheme != undefined && newTheme != "") {
    if (!themes.includes(newTheme)) {
      res.status(400).send({
        message: "Invalid theme",
      });
      return { data: null, success: 0 };
    }

    updates.theme = newTheme;
  }

  return { data: updates, success: 1 };
}

export { getUpdatedvalues };
