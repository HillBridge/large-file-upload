const handleSql = require("../mysql.js")
const md5 = require("blueimp-md5")


module.exports = (router) =>{
	router.post("/login", async (ctx,next) => {

		const { username, password, key } = ctx.request.body
		const searchSqlByUsername = "select * from user where username = '"+username+"' "
		
		const usernameRes = await handleSql(searchSqlByUsername)
		const passwordRes = usernameRes[0].password

		var hashPwd = md5(md5(username, key), passwordRes)
		/*
			md5加密方式：
				前后端采取相同的加密方式，服务端对于客户端传递过来的密码进行相同
				的加密规则后进行比对，如果相同，则证明登录成功
		*/
		if(password == hashPwd){
			ctx.response.body = {
				code: '0',
				description: '登录成功'
			}
		}else{
			ctx.response.body = {
				code: '1',
				description: '账号或密码错误'
			}
		}
	})
}