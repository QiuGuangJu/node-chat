const express = require("express")
const connection = require("../../common/mysql/index")
const md5 = require("../../common/md5/md5")
const token = require("../../common/token/token")

module.exports = function (onlineList) {
    const router = express.Router()

    router.post("/reg", (req, res) => {
        connection.query("select account from user order by userid desc limit 1", (err, data) => {
            if (err) {
                console.log(err)
            } else {
                let newAccount = null
                if (data.length === 1) {
                    newAccount = data[0].account + 1
                } else {
                    newAccount = 10001
                }

                let newPwd = md5.md5(req.body.pwd + md5.MD5_SUFFIX)
                connection.query("insert into user values(0,'" + req.body.name + "','" + newPwd + "', '" + newAccount + "', '这个人很懒，什么都没留下','default.jpg')", (err, data) => {
                    if (err) {
                        console.log(err)
                    } else {
                        res.send(`{"status": 200, "account":${newAccount}}`)
                    }
                })
            }
        })
    })

    router.post("/login", (req, res) => {
        const account = req.body.account,
            pwd = md5.md5(req.body.pwd + md5.MD5_SUFFIX)

        // 判断用户是否已经登陆
        if(!onlineList.find(item=>item.account === req.body.account)){
            connection.query("SELECT * FROM `user` where account='" + account + "' ", (err, data) => {
                if (err) {
                    console.log(err)
                } else {
                    if (data.length === 1) {
                        // 登陆验证通过
                        if (data[0].pwd === pwd) {
                            // 1 生成token
                            const payload = {
                                name: account,
                                pwd: pwd
                            }
                            const _token = token.RS256.sign(payload, "./sl/pkcs8_rsa_private_key.pem")
                            // 修改数据库中对应account账户对应的token


                            res.send('{"status":200,"token": "' + _token + '","msg":' + JSON.stringify(data[0]) + '}')
                        }
                    }
                }
            })
        }

    })

    return router
}