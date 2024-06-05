const Router = require("koa-router");
const router = new Router();


router.get("/nba", async (ctx,next)=>{
		ctx.body = "2222222222nba page"
	})


module.exports = router.routes();