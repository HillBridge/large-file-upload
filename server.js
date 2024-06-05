const path = require("path");
const Koa = require("koa");
const Router = require("koa-router");
// 静态资源的访问，如图片，css，js等
const static = require("koa-static");
// 用于静态资源的缓存。第一次请求为200，第二次从本地缓存读取，status 304
const staticCache  = require("koa-static-cache");
const session = require("koa-session");
const KeyGrip = require("keygrip");
const body = require("koa-better-body");

const server = new Koa();
server.listen(3001,()=>{
	console.log("The server is started at 3001");
})

// 设置cookie的密钥
server.keys = [
	"sdsdsdsdsdsdsd",
	"jwi8732uj9ajfj9j",
	"283798ud9ahfh9h92heh"
]

server.use(session({
	maxAge: 10*1000,
	renew: false
},server))

server.context.token = "123456hajekskajvnvnsak"



// KeyGrip为cookie模块服务 可定义增加或者删除密钥且不会使客户端凭证失效
// server.keys = new KeyGrip(['im a newer secret', 'i like turtle'], 'sha256');

const router = new Router();

// router.get("/",async (ctx,next) =>{
// 	ctx.body = "0000000000index page";
// })
router.get("/about/:id/aa",async (ctx,next) =>{
	ctx.body = "hello ablout";
	console.log(ctx.params)
})
/*
cookie定义：
	cookie是一种报文信息，请求报文和相应报文中都可以有cookie,以key-value的形式存在，
cookie作用：
	主要用来做服务端与浏览器之间传递信息，比如sessionID,token等用户标识
cookie使用过程：
	1.服务端向客户端发送cookie
	2.浏览器将cookie报存
	3.浏览器将cookie发送到服务器做用户身份识别
	[cookie是由服务端进行维护的，比如过期时间等,第一次服务端将cookie存在response
	header中返回到客户端，也仅此一次，这次中request header中没有cookie,第二次请求后
	才有]
	session
	session是存储在服务端的
	token:JWT[json web token] 现在做用户识别的方式
*/
router.get("/home",async (ctx,next) =>{
	ctx.body = "home";
	let expiresed = ctx.cookies.get("name")
	console.log("expiresed",expiresed)
	if(!expiresed){
		ctx.cookies.set("name","bridge",{
			maxAge: 10*1000,
			singed: true,
			httpOnly: false
		})
	}
	//console.log(ctx.cookies.get("name",{signed:true}))
	//ctx.send(fs.createReadStream("./static/2.html"))
	// ctx.body = "hello home"+ctx.token;
	// console.log(ctx.query)
	// ctx.assert(ctx.query.user,400,'user is required')
	// ctx.assert(ctx.query.pass,400,'pass is required')
	// ctx.redirect("https://www.baidu.com/")
})

router.all("/session",async ctx=>{
	console.log("session",ctx.session["sign"])
	if(!ctx.session["sign"]){
		ctx.session["sign"] = 0;
	}
	ctx.session["sign"]++;
	ctx.body = `这是第${ctx.session["sign"]}次访问`
})


router.use("/user",require("./routes/news"))


server.use(
    staticCache(path.join(__dirname,"./static"), {
    maxAge: 365 * 24 * 60 * 60
  })
);

server.use(static(path.join(__dirname,"./static"),{
	maxage: 86400*1000
}))



server.use(body({
	uploadDir: './static/upload',
	keepExtensions: 'true'
}))

router.post('/upload',async ctx=>{
	console.log(ctx.request.files[0].name)
	//ctx.body = "yes"

})


//f服务器与路由连接起来,router使用必须用关键字use
//server.use(router.routes())

server.use(router.routes())
  	.use(router.allowedMethods());