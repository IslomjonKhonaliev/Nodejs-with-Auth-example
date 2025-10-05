console.log("Server is starting...");


require("dotenv").config();
const express = require("express");
const connectToDB = require("./database/db");
const authRoutes = require("./routes/auth-routes");
const homeRouter = require("./routes/home-routes");
const adminRouter = require("./routes/admin-routes");
const imageRouter = require("./routes/image-routes");

// Connect to mongoDB
connectToDB();
// create an app
const app = express();

// Middleware
app.use(express.json());

// Create a port and
// Add the listen to port
const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRoutes);
app.use("/api/home", homeRouter);
app.use("/api/admin", adminRouter);
app.use("/api/image", imageRouter);

app.listen(PORT, () => {
  console.log(`Server is now running at port ${PORT}`);
});
