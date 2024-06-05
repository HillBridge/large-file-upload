const	handleSql = require("../mysql.js")
const   rsaInstance = require("../util/walk")
const	NodeRSA = require('node-rsa');



module.exports = (router) =>{
	/*
		RSA非对称加密，服务端生成公钥和私钥，客户端发送请求拿到公钥对密码进行加密，
		服务端拿到加密的密码通过私钥进行解密然后进行验证
	*/
	router.get("/pubkey",(ctx) => {
		ctx.body = {
			code: '0',
			description: 'rsa 公钥',
			data: {
				public_key: ctx.session.public_key
			}
		}
	})
	router.post("/register",async (ctx,next)=>{
		// 解析上传的参数
		let { username, password } = ctx.request.body
		
		const public_key = ctx.session.public_key
		const private_key = ctx.session.private_key

	  	const prikey = new NodeRSA(private_key);
		prikey.setOptions({encryptionScheme: 'pkcs1'});

		const decryptedPwd = prikey.decrypt(password, 'utf8'); 

		const searchSqlByUsername = "select * from user where username = '"+username+"' "
		const searchSqlByPassword = "select * from user where password = '"+decryptedPwd+"' "
		
		const usernameRes = await handleSql(searchSqlByUsername)
		const passwordRes = await handleSql(searchSqlByPassword)
		
		if(usernameRes.length != 0){
			return ctx.response.body = {
			    code:'101',
			    description: '用户名已存在'
			}
		}

		if(passwordRes.length != 0){
			return ctx.body = {
			    code:'101',
			    description: '密码已存在'
			}
		}

		const key = Math.random()*10000+20
		const addSql = "insert into user values('"+key+"','"+username+"','"+decryptedPwd+"') "
		const res = await handleSql(addSql)
		if(res){
			ctx.response.body = {
			    code:'0',
			    description: '注册成功',
			}
		}
		
	})
}