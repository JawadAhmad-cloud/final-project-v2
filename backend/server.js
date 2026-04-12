require("dotenv").config();
const app = require("./src/app");
const connectToDatabase = require("./src/db/db");

connectToDatabase();
const port = 5000;

app.listen(port, () => {
  console.log("server started successfully at port:" + port);
});
