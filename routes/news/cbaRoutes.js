const Router = require("koa-router");
const router = new Router();
	
router.get("/cba", async (ctx,next)=>{
	ctx.body = "3333333333cba page"
})


module.exports = router.routes();