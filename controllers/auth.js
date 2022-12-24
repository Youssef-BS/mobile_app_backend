import User from "../models/User.js"
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import fs from "fs"
export const register = async (req, res) => {

  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.SECRET_KEY
    ).toString(),
  });
  const avatar = req.files.avatar.tempFilePath;
  try {
    const user = await newUser.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};



export const login = async (req,res,next)=>{
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(401).json({ success: false, message: error.message });

    const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

    originalPassword !== req.body.password &&
      res.status(401).json({ success: false, message: error.message });

    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.SECRET_KEY,
      { expiresIn: "5d" }
    );

    const { password, ...info } = user._doc;

    res.status(200).json({ ...info, accessToken });
  } catch (err) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.username);

    // sendToken(res, user, 201, `Welcome back ${user.name}`);
     const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.SECRET_KEY,
      { expiresIn: "5d" }
    );
    const { password, ...info } = user._doc;
    res.status(200).json({ ...info, accessToken });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};