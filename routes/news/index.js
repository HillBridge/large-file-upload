const Router = require("koa-router");
const router = new Router();

router.get("/",async (ctx,next) =>{
	ctx.body = "111111111news page";
})


router.use(require("./cbaRoutes"))
router.use(require("./nbaRoutes"))

module.exports = router.routes();