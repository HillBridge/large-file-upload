
const Router = require("koa-router")
const router = new Router()
const login = require("./login")
const register = require("./register")


module.exports = (app) => {
	login(router)
	register(router)
	app.use(router.routes())
  		.use(router.allowedMethods());
}