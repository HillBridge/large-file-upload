const logger = require("koa-logger");
const bodyParser = require("koa-bodyparser");
const session = require("koa-session"); // koa-session内部使用base64对数据进行的加解密
const cookie = require("koa-cookie").default;
const rsaInstance = require("../util/walk");
const cors = require("@koa/cors");

// koa的中间件我的理解就是工厂里加工过程中的一道程序，且这个程序的顺序可控可调整
// 在代码上理解，其实就是一个func

module.exports = (app) => {
  // session
  app.keys = ["sdsdsdsdsdsdsd", "jwi8732uj9ajfj9j", "283798ud9ahfh9h92heh"];
  app.use(
    session(
      {
        key: "kkb:sess",
        // maxAge: 60 * 60 * 24 * 1000,
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
        renew: false, //当cookie快过期时请求,会重置cookie的过期时间
      },
      app
    )
  );

  app.use(
    cors({
      origin: "http://localhost:3000",
      allowMethods: ["GET", "POST"],
      allowHeaders: ["Content-Type", "Accept", "Authorization"],
      credentials: true,
    })
  );

  //app.use(cookie());

  app.use(async (ctx, next) => {
    // 跨域中间件
    ctx.set("Access-Control-Allow-Origin", "http://localhost:3000");
    ctx.set("Access-Control-Allow-Headers", "*");
    ctx.set("Access-Control-Allow-Credentials", true);

    // console.log("public_key+++", ctx.session.public_key);
    // session
    // if (!ctx.session.public_key) {
    //   ctx.session.public_key = rsaInstance.public_key;
    //   ctx.session.private_key = rsaInstance.private_key;
    // }
    await next();
  });

  // 日志中间件
  //app.use(logger())

  // 解析参数
  app.use(bodyParser());
};
