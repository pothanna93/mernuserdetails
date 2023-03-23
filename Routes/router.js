const express = require("express");

const router = new express.Router();
const controller = require("../Controllers/usersControllers");
const upload = require("../multerConfig/storageConfig");

//routes

router.post(
  "/user/register",
  upload.single("user_profile"),
  controller.userpost
);

router.get("/user/details", controller.userget);
router.get("/user/:id", controller.singleUserGet);
router.put(
  "/user/edit/:id",
  upload.single("user_profile"),
  controller.useredit
);
router.delete("/user/delete/:id", controller.userdelete);
router.put("/user/status/:id", controller.userStatus);
router.get("/userexport", controller.userExport);

module.exports = router;
