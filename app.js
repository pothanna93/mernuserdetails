require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./db/connection");
const app = express();
const router = require("./Routes/router");
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("./uploads"));
app.use("/files", express.static("./public/files"));
app.use(router);

app.listen(PORT, () => {
  console.log(`server started at port number ${PORT}`);
});
