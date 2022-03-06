const User = require("../models/userModel");
//Mã hoá
const bcrypt = require("bcryptjs");
//Hàm đăng ký
exports.signUp = async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashpassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      //   req.body
      username,
      password: hashpassword,
    });
    req.session.user = newUser;
    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(400).json({
      status: "fail",
    });
  }
};
//Hàm đăng nhập
exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({
      username,
    });
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "user not found",
      });
    }
    const isCorrect = await bcrypt.compare(password, user.password);
    if (isCorrect) {
      req.session.user = user;
      res.status(200).json({
        status: "success",
      });
    } else {
      res.status(400).json({
        status: "fail",
        message: "incorrect username or password",
      });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({
      status: "fail",
    });
  }
};
