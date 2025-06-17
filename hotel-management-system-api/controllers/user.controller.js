// src/controllers/user.controller.js
const response = require("../helper/responses");
const db = require("../models");

const userService = require("../services/user.service");
const transformers = require("../utils/transformers");

const createUser = async (req, res) => {
  try {
    const creatorRole = req.user.role;
    const targetRole = req.body.role;

    // 🔒 الرسبشين ما بيقدر يعمل رسبشين
    if (creatorRole === "receptionist" && targetRole === "receptionist") {
      return res
        .status(403)
        .json({ message: "Receptionist cannot create another receptionist" });
    }

    // باقي الفحص حسب ما بدك
    const newUser = await db.User.create(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const index = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await userService.getUser({ userId });
    // console.log(user);
    if (!user) return response.failedWithMessage("failed to get info", res);
    return response.successWithMessage("user info got successfully", res, {
      user: transformers.userTransformer(user),
    });
  } catch (err) {
    console.log("ERROR--> ", err);
    return response.serverError(res);
  }
};

const getUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await userService.getUser({ userId });
    if (!user)
      return response.failedWithMessage("failed to get user info", res);
    return response.successWithMessage("the User found successfully ", res, {
      user: transformers.userTransformer(user),
    });
  } catch (err) {
    console.log("ERROR--> ", err);
    return response.serverError(res);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const role = req.query.role;
    const users = await userService.getAllUsers({ role });
    return response.successWithMessage("users fetched successfully", res, {
      users: users.map(transformers.userTransformer),
    });
  } catch (err) {
    console.log("ERROR--> ", err);
    return response.serverError(res);
  }
};

module.exports = { index, getUser, createUser, getAllUsers };
