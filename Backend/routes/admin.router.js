const express = require("express");
const { getAllPendingRequest } = require("../controllers/admin.controller");

const router = express.Router();

router.get("/drivers",getAllPendingRequest)

module.exports = router