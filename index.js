const express = require("express");
const res = require("express/lib/response");
const { default: mongoose } = require("mongoose");
const session = require("express-session");
const { createClient } = require("redis");
const cors = require("cors");

let RedisStore = require("connect-redis")(session);

const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  REDIS_URL,
  SESSION_SECRET,
  REDIS_PORT,
} = require("./config/config");
//npm redis sử dụng là phiên bản 3.0.0
let redisClient = createClient({
  host: REDIS_URL,
  port: REDIS_PORT,
});

const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

//192.168.80.2 ipadress container mongo, check ip: docker inspect IDcontainer
//Can check docker network ls -> NAME mongo
const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;
//Kết nối CSDL mongoDB
const connectWithRetry = () => {
  mongoose
    //   .connect("mongodb://admin:password@mongo:27017/?authSource=admin")
    .connect(mongoURL)
    .then(() => console.log("successfully connected to DB"))
    .catch((e) => {
      console.log(e);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

app.enable("trust proxy");
//Sử dụng cors
app.use(cors({}));
//Sử dụng redis tạo session cho kết nối
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    //saveUninitialized: false,
    // resave: false,
    cookie: {
      secure: false,
      resave: false,
      saveUninitialized: false,
      httpOnly: true,
      maxAge: 30000,
    },
  })
);

app.use(express.json());

app.get("/api/v1", (req, res) => {
  res.send("<h2>Hi  There!!!!!</h2>");
  console.log("yeah it ran");
});
//localhost:3000/api/v1/post/
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`listening on port ${port}`));
