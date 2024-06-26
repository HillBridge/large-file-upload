const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
const Koa = require("koa");
const static = require("koa-static");
//const router = require("./router")
const handleSql = require("./mysql");
const middleware = require("./middleware");
const koaBody = require("koa-body");
const Router = require("koa-router");
const router = new Router();
const app = new Koa();

app.use(
  static(path.join(__dirname, "./"), {
    maxage: 86400 * 1000,
  })
);

app.use(
  koaBody({
    multipart: true,
    //encoding: 'gzip',
    formidable: {
      //uploadDir:path.join(__dirname,'./static/upload/'), // 设置文件上传目录
      keepExtensions: true, // 保持文件的后缀
      maxFieldsSize: 2 * 1024 * 1024, // 文件上传大小
      onFileBegin: (name, file) => {
        // 文件上传前的设置
        //console.log(`name: ${name}`);
        // console.log("file===",file);
      },
    },
  })
);

// 加载中间件
middleware(app);

router.get("/userInfo", (ctx) => {
  // const cookies = ctx.request.header.cookie
  const cookies = ctx.cookies.get("kkb:sess");

  if (cookies) {
    const buffer = Buffer.from(cookies, "base64");
    const decodedString = buffer.toString("utf8");
    const parseCookies = JSON.parse(decodedString);
    console.log("userInfo", parseCookies["token"]);
  }

  const userInfo = {
    username: "qiao",
    age: 28,
    love: "paly games",
  };
  ctx.body = {
    code: "0",
    data: {
      userInfo,
    },
  };
});

router.post("/login", (ctx) => {
  const { username, password } = ctx.request.body;
  if (username === "admin" && password === "123456") {
    const token = "qiao0624";
    ctx.session.token = token;
    // console.log("ddd", ctx.session.public_key, ctx.session.tt);
    // ctx.cookies.set("token", token, {
    //   expires: new Date("2024-06-30"),
    //   httpOnly: true,
    // });
    ctx.body = {
      code: "0",
      data: {
        token,
      },
      msg: "success",
    };
  } else {
    ctx.body = {
      code: "0",
      data: null,
      msg: "username or password is wrong",
    };
  }
});

router.post("/checkfile", async (ctx) => {
  const { hash, ext } = ctx.request.body;
  const filepath = path.resolve(__dirname, `static/upload/${hash}.${ext}`);
  const chunksDir = path.resolve(__dirname, `static/upload/${hash}`);
  let uploaded = false;
  let uploadedList = [];
  if (fse.existsSync(filepath)) {
    uploaded = true;
  } else {
    uploadedList = fse.existsSync(chunksDir) ? fse.readdirSync(chunksDir) : [];
  }
  ctx.body = {
    code: "0",
    data: {
      uploaded,
      uploadedList,
    },
  };
});

router.post("/mergefile", async (ctx) => {
  const { ext, size, hash } = ctx.request.body;
  // 最终合并的文件路径
  const filePath = path.resolve(__dirname, `static/upload/${hash}.${ext}`);
  const chunksDir = path.resolve(__dirname, `static/upload/${hash}`);
  // 获取到所有上传的切片
  let chunks = await fse.readdir(chunksDir);
  chunks.sort((a, b) => a.split("-")[1] - b.split("-")[1]);
  chunks = chunks.map((cp) => path.resolve(chunksDir, `${cp}`));

  await Promise.all(
    chunks.map(async (file, index) => {
      const readStream = await fse.createReadStream(file);
      const writeStream = await fse.createWriteStream(filePath, {
        start: size * index,
        end: size * (index + 1),
      });
      readStream.pipe(writeStream); // 可读流通过管道写入可写流
      readStream.on("end", async () => {
        //console.log("====",fse.readdirSync(chunksDir))
        if (fse.readdirSync(chunksDir).length > 0) {
          fse.unlinkSync(file);
        } else {
          fse.rmdirSync(chunksDir);
        }
      });
    })
  );
  ctx.body = {
    code: "0",
    data: {
      url: `static/upload/${hash}.${ext}`,
    },
    description: "文件合并上传成功",
  };
});

router.post("/uploadfile", async (ctx) => {
  if (Math.random() < 0.7) {
    ctx.status = 500;
    return (ctx.body = {
      code: "1",
      description: "切片上传失败",
    });
  }
  const file = ctx.request.files.file; // 获取上传文件
  const { name, hash } = ctx.request.body;
  const chunkDir = path.resolve(__dirname, `static/upload/${hash}`);
  const existDir = fs.existsSync(chunkDir);
  if (!existDir) {
    await fse.mkdir(chunkDir);
  }
  if (!fs.existsSync(`${chunkDir}/${name}`)) {
    await fse.move(file.path, `${chunkDir}/${name}`);
  }

  ctx.body = {
    code: "0",
    description: "切片上传成功",
  };
});

router.post("/upload", (ctx) => {
  const file = ctx.request.files.file; // 获取上传文件
  //console.log("file",file)
  const ext = ctx.request.body.filename.split(".").pop(); // 获取上传文件扩展名

  const curFile = ctx.request.body.filename;

  const reader = fs.createReadStream(file.path); // 创建可读流

  const res = fs.existsSync(`static/upload/${curFile}`);

  let description = "";
  if (ext == "jpeg" || ext == "png" || ext == "jpg") {
    description = "图片已上传";
  } else {
    description = "文件已上传";
  }

  if (res) {
    return (ctx.body = {
      code: "101",
      description: description,
    });
  }

  const upStream = fs.createWriteStream(`static/upload/${curFile}`); // 创建可写流

  reader.pipe(upStream); // 可读流通过管道写入可写流

  ctx.body = {
    code: "0",
    description: description,
  };
});

// 加载路由
//router(app)

app.use(router.routes()).use(router.allowedMethods());

app.listen(3003, () => {
  console.log("the server is started at 3003");
});

/*
	用户登录注册密码如何保证安全性？
	当前技术的解决方案，https+非对称加密
	1.使用https传输协议，要比http协议更加安全
		http是以明文发送的报文信息，一旦浏览器与服务端之间的传输报文被截取，那么
		别人就可能伪造登录的情况，所以http不适合敏感信息的传输，银行卡号，密码等。
		更适合用https。
		另外浏览器端可以在登录页嵌入别人的js代码片段或截取登录信息，这一层，前端
		无论使用哪种密码加密都无法防止别人劫持，所以，可以采用短信验证码等方式增加
		安全性，另外配合https做网络层的安全处理，在网络层通过ssl协议进行加密传输，身份
		验证等。
	2.采用非对称加密方案
		客户端向服务端发送请求，服务端生成一对公钥和私钥，将公钥发给客户端
		客户端用公钥对敏感信息进行加密，然后发送给服务端
		服务端通过私钥进行解密，进行验证
	3.https实质就是http基础上加上ssl安全协议，它的目的是为了解决客户端与服务端数据
		传输过程中被窃取的可能性。


	
*/
