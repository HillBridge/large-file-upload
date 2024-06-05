const mysql = require("mysql");

//创建数据池
const pool = mysql.createPool({
	host: "127.0.0.1",
	user: "root",
	password: "",
	database: "user"
})


//在数据池中进行会话操作
function getMysqlResult(sql){
	return new Promise((resolve,reject)=>{
		pool.getConnection((err,connection)=>{
			if(err) reject(err);
			//let sql = "SELECT * FROM user WHERE id>1 and id<4"
			//let sql = "INSERT INTO user values(12,'popding',129021)"
			//let sql = "delete from user where id = 6"
			//let sql = "delete from user where username = 'jackding'"
			//let sql = "update user set username = 'qikeding' where id = 10"
			
			connection.query(sql,(error,result,fields)=>{
				if(error) reject(error);
				resolve(result)
			})
			//结束会话
			connection.release();
		})
	})
}

module.exports = getMysqlResult;