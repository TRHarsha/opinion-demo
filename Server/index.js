const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const server = express();
const reviewRouter = require("./router/ReviewRouter");
const bodyPraser = require("body-parser")

async function main() {
  try {
    // MongoDB connection with the database name specified (replace 'reviews' with your actual DB name)
    await mongoose.connect("mongodb+srv://crypticnodmand:Pritam%402010@cluster0.h5xs3.mongodb.net/reviews");
    console.log("Connected to database");
  } catch (err) {
    console.error("Error connecting to database:", err);
  }
}

main();
server.use(bodyPraser.json({ limit: '50mb' }));
server.use(bodyPraser.urlencoded({ limit: '50mb', extended: true }));

server.use(cors());
server.use(express.json());
server.use("/review", reviewRouter);

const port = process.env.PORT || 8081;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
