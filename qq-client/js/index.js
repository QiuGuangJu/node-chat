$(document).ready(function () {
    var socket = io.connect("http://localhost:8080")

    socket.on("connect", () => {
        console.log("链接服务器成功")
    })

    socket.on("reconnect", () => {
        console.log("重新链接了服务器成功")
    })

    socket.on("group-chat-info", data => {
        console.log(data)
    })

    socket.on("group-chat-serverRes", data => {
        if ($(".qq-chat").css("display") === "block") {
            if ($(".fasong").attr("data-sockeid") !== "undefined"){
                $('.qq-chat-txt ul').html("")
                $('.qq-chat-t-head img').attr("src","images/head/default.jpg")
                $('.qq-chat-t-shuo').html("")
                $('.qq-chat-t-name').html("QQ群 1")
                $('.fasong').attr("data-sockeid", "undefined")
            }
        } else {
            $(".qq-chat").css("display", "block")
        }
        var name = data.name
        var ners = data.msg
        var now = new Date()
        var t_div = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + ' ' + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
        $('.qq-chat-txt ul').append('<li class="my"><div class="qq-chat-my"><span>' + name + '</span><i>' + t_div + '</i></div><div class="qq-chat-ner">' + ners + '</div></li>')
        $(".qq-chat-txt").scrollTop($(".qq-chat-txt")[0].scrollHeight);
        $('#qq-chat-text').val('').trigger("focus")
    })

    // 加组
    socket.emit("group1")

    // 某个用户上线了
    socket.on("system-up", data => {
        console.log(data)
    })

    let chatList = [],
        onlineList = [],
        group = []

    for (let i = 0; i < 1; i++) {
        let data = {}
        data.nickname = `QQ群 ${i + 1}`
        data.photo = 'default.jpg'
        group.push(data)
    }

    function updateList(data) {
        let _html = ""
        if (data.length > 0) {
            for (var item of data) {
                _html += `<li data-sockeid='${item.sockeid}'>
                <div class="qq-hui-img"><img src='images/head/${item.photo}'><i></i></div>
                <div class="qq-hui-name"><span>${item.nickname}</span><i>16:30</i></div>
                <div class="qq-hui-txt" title="">下次我们去公园拍摄吧~[图片]</div>
              </li>`
            }
        }

        $(".qq-hui ul").html(_html)
        $('.qq-hui li').dblclick(function () {
            // 获取每一个li独有的data-sockeId
            let sockeid = $(this).attr("data-sockeid")
            // 给发送按钮设置一个data-sockedId
            $(".fasong").attr("data-sockeid", sockeid)

            // 通过 sockeid 找到当前聊天对象,并加入chatList数组中
            let target = onlineList.find(item => item.sockeid === sockeid)
            $('.qq-chat').css('display', 'block').removeClass('mins')
            $('.qq-chat-t-name').html($(this).find('span').html())
            $('.qq-chat-t-head img').attr('src', $(this).find('img').attr('src'))
            $('.qq-chat-you span').html($(this).find('span').html())
            $('.qq-chat-you i').html($(this).find('.qq-hui-name i').html())
            $('.qq-chat-ner').html($(this).find('.qq-hui-txt').html())
            $("#qq-chat-text").trigger("focus")
            $('.my').remove()
        })
    }

    // 渲染在线列表
    socket.on("system-online", data => {
        onlineList = data
        updateList(onlineList)
    })

    socket.on("single-chat-serverRes", data => {
        chatList.push(data)
        $(".qq-chat").css("display", "block")
        if (!$(".qq-chat .fasong").attr("data-sockeid")) {
            $(".qq-chat .fasong").attr("data-sockeid", data.sockeid)
        } else if ($(".qq-chat .fasong").attr("data-sockeid") !== data.sockeid) {
            $(".qq-chat-txt ul").html("")
        }
        $('.qq-chat-t-head img').attr("src", `./images/head/${data.photo}`)
        $(".qq-chat-t-name").html(data.nickname)
        $(".qq-chat-t-shuo").html(data.mood)

        var name = data.nickname
        var ners = data.msg
        var now = new Date()
        var t_div = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + ' ' + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
        $('.qq-chat-txt ul').append('<li class="my"><div class="qq-chat-my blue"><span>' + name + '</span><i>' + t_div + '</i></div><div class="qq-chat-ner">' + ners + '</div></li>')
        $(".qq-chat-txt").scrollTop($(".qq-chat-txt")[0].scrollHeight);
        $('#qq-chat-text').val('').trigger("focus")
    })


    $('.qq-xuan li').click(function () {
        $(this).addClass('qq-xuan-li').siblings().removeClass('qq-xuan-li')
        let index = $(".qq-xuan li").index(this)
        switch (index) {
            case 0:
                $('.qq-hui ul').html("")
                updateList(chatList)
                break
            case 1:
                $('.qq-hui ul').html("")
                updateList(onlineList)
                break
            case 2:
                $('.qq-hui ul').html("")
                updateList(group)
                break
            case 3:
                break
        }
    })
    $('.qq-hui-txt').hover(function () {
        var aa = $(this).html()
        $('.qq-hui-txt').attr('title', aa)
    })
    $('.login-close').click(function () {
        $(this).parent().parent().css('display', 'none')
    })

    $('.qq-exe img').dblclick(function () {
        $('.qq-login').css('display', 'block').removeClass('mins')
    })
    //登陆
    $('.login-but').click(function () {
        var account = $('.login-txt').find('input').eq(0).val(),
            pwd = $('.login-txt').find('input').eq(1).val()

        if (!account || !pwd) {
            alert('请输入账号或者密码')
        } else {
            // ajax 判断用户名 和 密码
            $.ajax({
                url: "http://localhost:8080/login",
                headers: {},
                data: {
                    account: account,
                    pwd: pwd
                },
                type: "POST",
                success: data => {
                    data = JSON.parse(data)
                    if (data.status === 200) {
                        localStorage.setItem("token", data.token)
                        confirm('登陆成功！');
                        $('.qq').css('display', 'block').removeClass('mins')
                        $('.qq-login').css('display', 'none')
                        $(".qq-top-name span").html(data.msg.nickname);
                        $(".qq-top-shuo input").val(data.msg.mood);

                        socket.emit("up", data.msg)
                    }
                },
                error: (err) => {
                    console.log(err);
                }
            })


        }
    })
    $('.login-txt input').keydown(function (e) {
        if (e.keyCode == 13) {
            if ($('.login-txt').find('input').val() == '') {
                alert('请输入账号或者密码')
            } else if ($('login-txt input').val() != '') {
                $('.qq').css('display', 'block').removeClass('mins')
                $('.qq-login').css('display', 'none')
            }
        }
    })
    $('.qq-top-02.close').click(function () {
        $(this).parent().parent().parent().css('display', 'none')
        // 下线
        socket.emit("off")
    })
    $(".close").click(() => {
        $(".qq-chat").css("display", "none")
    })
    $('.min').click(function () {
        $(this).parent().parent().parent().addClass('mins')
    })
    $('.qq .close').click(function () {
        $('.qq-chat').css('display', 'none')
    })
    $('#qq-chat-text').keydown(function (e) {
        if (e.keyCode == 27) {
            $('.qq-chat').css('display', 'none')
        }
    })
    $('.fasong').click(function () {
        if ($('#qq-chat-text').val() == '') {
            alert("发送内容不能为空,请输入内容")
        } else if ($('#qq-chat-text').val() != '') {


            let sockeid = $(this).attr("data-sockeid");
            let msg = $("#qq-chat-text").val()

            if (sockeid != "undefined") {
                // 出发私聊事件
                socket.emit("single-chat", {sockeid, msg})
            } else {
                // 群聊
                let sockeid = socket.id;
                let origin = onlineList.find(item => item.sockeid == sockeid),
                    name = origin.nickname;

                socket.emit("group-chat", {name, msg})
            }

            var name = $('.qq-top-name span').html()
            var ner = $('#qq-chat-text').val()
            var ners = ner.replace(/\n/g, '<br>')
            var now = new Date()
            var t_div = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + ' ' + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
            $('.qq-chat-txt ul').append('<li class="my"><div class="qq-chat-my"><span>' + name + '</span><i>' + t_div + '</i></div><div class="qq-chat-ner">' + ners + '</div></li>')
            $(".qq-chat-txt").scrollTop($(".qq-chat-txt")[0].scrollHeight);
            $('#qq-chat-text').val('').trigger("focus")

        }
    })
    $('.close-chat').click(function () {
        $('.qq-chat').css('display', 'none')
    })
    $(".qq-hui").niceScroll({
        touchbehavior: false,
        cursorcolor: "#ccc",
        cursoropacitymax: 1,
        cursorwidth: 6,
        horizrailenabled: true,
        cursorborderradius: 3,
        autohidemode: true,
        background: 'none',
        cursorborder: 'none'
    });
});