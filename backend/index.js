
import express from "express";
import cors from "cors";
import userRoutes from "./userRoutes.js";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use([express.urlencoded({ extended: true }), express.json()]);

app.use("/api", userRoutes);

app.listen(PORT, (error) => {
  if (error) {
    console.log("Error occurred, server can't start", error);
  } else {
    console.log(
      "Server is Successfully Running, and App is listening on port " + PORT
    );
  }
});
