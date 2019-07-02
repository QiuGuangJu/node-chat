const app = require("express")();
const bodyParser = require("body-parser");
const http = require("http").Server(app);
const cors = require("cors");
const io = require("socket.io")(http);
const static = require("express-static");

http.listen(8080);
app.use(cors());
app.use(bodyParser.urlencoded());

let onlineList = [];

// 用户下线时修改onlineList
function offLine(id) {
    let target = onlineList.find(item => item.sockeid === id);
    onlineList = onlineList.filter((val) => {
        return val !== target
    })
}

// 用户上线时修改onlineList
function onLine(data, id) {
    if (!onlineList.find(item => item.account === data.account)) {
        data.sockeid = id;
        onlineList.push(data)
    }
}

io.on("connection", socket => {
    console.log('有人链接了服务器');
    socket.on("up", data => {
        onLine(data, socket.id);
        socket.broadcast.emit("system-up", `${data.nickname}: 上线了`);
        // 推送在线列表给每一个client
        io.sockets.emit("system-online", onlineList)

    });

    // 监测用户下线
    socket.on("off", () => {
        console.log(`检测到socket.id为： ${socket.id} 的用户下线`);
        offLine(socket.id);
        io.sockets.emit("system-online", onlineList)
    });

    socket.on("single-chat", obj => {
        let originObj = onlineList.find(item => {
            return item.sockeid === socket.id
        });
        if (originObj) {
            originObj.msg = obj.msg;
            io.to(obj.sockeid).emit('single-chat-serverRes', originObj);
        }

    });

    socket.on("group-chat", obj => {
        console.log(obj);
        socket.broadcast.to('group1').emit('group-chat-serverRes', obj)
    });


    socket.on("disconnect", () => {
        offLine(socket.id);
        io.sockets.emit("system-online", onlineList)
    });

    socket.on("group1", data => {
        socket.join("group1");
        console.log("服务端接收到分组请求")
    })

});


app.use("/", require("./router/index")(onlineList));
app.use(static("/www"));
console.log("server is running");