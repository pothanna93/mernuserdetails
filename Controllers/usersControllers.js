const users = require("../models/userSchema");
const moment = require("moment");
const csv = require("fast-csv");
const fs = require("fs");
const BASE_URL = process.env.BASE_URL;

//user post
exports.userpost = async (req, res) => {
  const file = req.file.filename;
  const { fname, lname, email, mobile, gender, location, status } = req.body;

  if (
    !fname ||
    !lname ||
    !email ||
    !mobile ||
    !gender ||
    !location ||
    !status ||
    !file
  ) {
    res.status(401).json({ message: "All Inputs are Required!" });
  }

  try {
    const previousUser = await users.findOne({ email: email });
    if (previousUser) {
      res
        .status(401)
        .json({ message: "This User already exist in our database" });
    } else {
      const datecreated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

      const userData = new users({
        fname,
        lname,
        email,
        mobile,
        gender,
        location,
        status,
        profile: file,
        datecreated,
      });

      await userData.save();
      res.status(201).json(userData);
    }
  } catch (error) {
    res.status(401).json(error);
    console.log("catch block error");
  }
};

//user get details

exports.userget = async (req, res) => {
  //console.log(req.query);
  const search = req.query.search || "";

  const gender = req.query.genderSearch || "";

  const statusSearch = req.query.statusSearch || "";

  const sortByValue = req.query.sortByValue || "";

  const page = req.query.page || 1;
  const ITEM_PER_PAGE = 4;

  const query = {
    fname: { $regex: search, $options: "i" }, //here i chech small are capital
  };

  if (gender !== "All") {
    query.gender = gender.toLowerCase();
  }
  if (statusSearch !== "All") {
    query.status = statusSearch;
  }
  //console.log(query);
  try {
    const skip = (page - 1) * ITEM_PER_PAGE; // 1*4 =4
    const count = await users.countDocuments(query);

    const usersData = await users
      .find(query)
      .sort({ datecreated: sortByValue == "new" ? -1 : 1 }) //return all users
      .limit(ITEM_PER_PAGE)
      .skip(skip);

    const pageCount = Math.ceil(count / ITEM_PER_PAGE); //8/4=2

    res.status(200).json({
      Pagination: {
        count,
        pageCount,
      },

      usersData,
    });
  } catch (error) {
    res.status(401).json(error);
  }
};

//single user get

exports.singleUserGet = async (req, res) => {
  const { id } = req.params;
  try {
    const singleUser = await users.findOne({ _id: id });
    res.status(200).json(singleUser);
  } catch (error) {
    res.status(401).json(error);
  }
};

//user edit

exports.useredit = async (req, res) => {
  const { id } = req.params;
  const {
    fname,
    lname,
    email,
    mobile,
    gender,
    location,
    status,
    user_profile,
  } = req.body;

  const file = req.file ? req.file.filename : user_profile;
  const dateUpdated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

  try {
    const updateUser = await users.findByIdAndUpdate(
      { _id: id },
      {
        fname,
        lname,
        email,
        mobile,
        gender,
        location,
        status,
        profile: file,
        dateUpdated,
      }
    );

    await updateUser.save();
    res.status(201).json(updateUser);
  } catch (error) {
    res.status(401).json(error);
  }
};

//user delete

exports.userdelete = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteUser = await users.findByIdAndDelete({ _id: id });
    res.status(200).json(deleteUser);
  } catch (error) {
    res.status(401).json(error);
  }
};

//user  status change

exports.userStatus = async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;
  try {
    const userStatusUpdate = await users.findByIdAndUpdate(
      { _id: id },
      { status: data },
      { new: true }
    );
    res.status(201).json(userStatusUpdate);
  } catch (error) {
    res.status(401).json(error);
  }
};

//export to csv

exports.userExport = async (req, res) => {
  // res.send("from csv");
  try {
    const usersdata = await users.find();

    const csvStream = csv.format({ headers: true });

    if (!fs.existsSync("public/files/export/")) {
      if (!fs.existsSync("public/files")) {
        fs.mkdirSync("public/files/");
      }
      if (!fs.existsSync("public/files/export")) {
        fs.mkdirSync("./public/files/export/");
      }
    }

    const writablestream = fs.createWriteStream(
      "public/files/export/users.csv"
    );

    csvStream.pipe(writablestream);

    writablestream.on("finish", function () {
      res.json({
        downloadUrl: `${BASE_URL}/files/export/users.csv`,
      });
    });
    if (usersdata.length > 0) {
      usersdata.map((user) => {
        csvStream.write({
          FirstName: user.fname ? user.fname : "-",
          LastName: user.lname ? user.lname : "-",
          Email: user.email ? user.email : "-",
          Phone: user.mobile ? user.mobile : "-",
          Gender: user.gender ? user.gender : "-",
          Status: user.status ? user.status : "-",
          Profile: user.profile ? user.profile : "-",
          Location: user.location ? user.location : "-",
          DateCreated: user.datecreated ? user.datecreated : "-",
          DateUpdated: user.dateUpdated ? user.dateUpdated : "-",
        });
      });
    }
    csvStream.end();
    writablestream.end();
  } catch (error) {
    res.status(401).json(error);
  }
};
