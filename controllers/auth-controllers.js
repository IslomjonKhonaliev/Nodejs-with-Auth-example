const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register controllers
const registerUser = async (req, res) => {
  try {
    // Extract user informations from request body
    const { username, email, password, role } = req.body;

    // Check if the user is already existing in our database
    const checkExistingUsername = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (checkExistingUsername) {
      return res.status(400).json({
        success: false,
        message:
          "User already exists with either username or email! Please try again with a different username or email",
      });
    }
    // hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // save or create a new user
    const addNewUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "user",
    });
    await addNewUser.save();
    if (addNewUser) {
      res.status(201).json({
        success: true,
        message: "New User is added successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Unable to register an user! Please try again later",
      });
    }
  } catch (error) {
    console.log("Error is ", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again",
    });
  }
};

// Login controllers
const loginUser = async (req, res) => {
  try {
    // Extract user information from request body
    const { username, password } = req.body;
    // Check if username is existing in our database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid credentials!",
      });
    }

    // if the password is correct or not
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return res.status(404).json({
        success: false,
        message: "Invalid credentials!",
      });
    }

    // Create user token
    const accessToken = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_TOKEN_KEY,
      { expiresIn: "15m" }
    );
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      accessToken,
    });
  } catch (error) {
    console.log("Error is ", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again",
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    // First we need to get user id
    const userId = req.userInfo.userId;

    // Extract old and new password;
    const { oldPassword, newPassword } = req.body;

    // Find the current logged in user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User is not found",
      });
    }

    // Check if old password is correct;
    const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatched) {
      return res.status(400).json({
        success: false,
        message: "Old password is not correct! Please try again",
      });
    }

    // hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update user password from old to new password;
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password is changed successfully",
    });
  } catch (error) {
    console.log("Error is ", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again",
    });
  }
};

module.exports = { registerUser, loginUser, changePassword };
