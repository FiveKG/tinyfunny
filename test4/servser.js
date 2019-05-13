let Players= require('./src/players')
let Make_id = require('./src/make_id')
let MongoDB = require('./src/mongoDB')
let Player_pool = require('./src/player_pool')
let Send_server = require('./src/send_server')
let make_id = new Make_id()
let net = require('net')
//define host and port to run the server
const port = 8080
const host = '127.0.0.1'
let mongodb = new MongoDB()//数据库
let send_obj = new Send_server()//收发格式
let player_pool =new Player_pool()//登陆的玩家池

//创建一个服务器实例
const server = net.createServer(onClientConnection)
//开始监听
server.listen(port,host,function()
{
    console.log(`Server started on port ${port} at ${host}`) 
})

//声明监听方法
function onClientConnection(sock)
{
	//.记录客户连接
	console.log(`${sock.remoteAddress}:${sock.remotePort} Connected`)
	// 监听来自客户端的信息
	sock.on('data',function(data)
	{
		//记录客户端信息
		console.log(`${sock.remoteAddress}:${sock.remotePort} Says : ${data} `)
		//. 返回信息给客户端
		data = JSON.parse(data)
		switch(data["operate"])
		{
			case "log_in":
				log_in(sock,data)//登陆
				break
			case "log_out":
				log_out(sock,data)//登出
				break
			case 'register':
				register(sock,data)//注册
				break
			case 'check_player':
				check_player(sock,data)
				break
			case 'update_name'://更新
				update_name(sock,data)
				break
			case 'delete_player'://删除玩家
				delete_player(sock,data)
				break
			default:
				break
		}
			
	})
	//.处理客户端断开连接
	sock.on('close',function()
	{
			console.log(`${sock.remoteAddress}:${sock.remotePort} Terminated the connection`)
	})
	//处理客户端连接异常
	sock.on('error',function(error)
	{
			console.error(`${sock.remoteAddress}:${sock.remotePort} Connection Error ${error}`)
	})
}


//登陆
function log_in(sock,data)
{
    let id =data["data"][0]
    let pwd = data["data"][1]
    let send = null
    mongodb.check_player(id,function(err,res)
    {
        if(err)
        {
            //数据库出错
            console.log(`${sock.remotePort}登陆失败:`)
            console.log(err)
            send_obj.set('log_in',0,"未知错误！")
            let send = send_obj.get()
            sock.write(JSON.stringify(send))
            send = null
            return
        }
        if(res.length>0)
        {
            if(pwd == res[0]["pwd"])//密码正确
            {
                console.log(`${sock.remoteAddress}:${sock.remotePort}:登陆成功`)
                //登陆成功则建立一个玩家对象
                id = res[0]['_id']
                let name = res[0]['name']
                let sex =res[0]['sex']

                let player1= new Players(id,name,sex,1)//玩家对象
                player_pool.add_player(id,player1)//玩家放进玩家池
                //发送玩家信息给客户端
                send_obj.set('log_in',1,player1)
            }
            else
            {
                //密码不正确
                console.log(`${sock.remoteAddress}:${sock.remotePort}:密码错误`)
                send_obj.set('log_in',0,'密码错误')
            }
        }
        else
        {
            console.log(`${sock.remoteAddress}:${sock.remotePort}:账号未注册`)
            send_obj.set('log_in',0,'账号未注册')
        }

        send = send_obj.get()
        sock.write(JSON.stringify(send))
        send = null
        //查看玩家池
        player_pool.check_pool()
    })
}

//登出
function log_out(sock,data)
{
    let player = data['data']
    //玩家池删除该玩家
    player_pool.delete_player(player['id'])
    //通知删除结果
    send_obj.set('log_out',1,null)
    let send = send_obj.get()
    sock.write(JSON.stringify(send))
    send = null
    //查看玩家池
    player_pool.check_pool()
}

//注册
function register(sock,data)
{
    let id = make_id.get_id()
    let name = data['data'][0]
    let sex = data['data'][1]
    let pwd = data['data'][2]
    //判断信息
    if(id&&name&&sex&&pwd)
    {
        //注册信息进mongo
        mongodb.insert_player(id,name,sex,pwd,function(err,res)
        {
            if(err)
            {
                //数据库出错
                console.log(`${sock.remoteAddress}:${sock.remotePort}插入失败:`)
                console.log(err)
                send_obj.set('register',0,"未知错误！")
                let send = send_obj.get()
                sock.write(JSON.stringify(send))
                send = null
                return
            }
            else
            {
                //添加成功
                console.log(`${sock.remoteAddress}:${sock.remotePort}插入结果:`)
                console.log(res.result)
                send_obj.set('register',1,`你的账号为:${id}`)
                let send = send_obj.get()
                sock.write(JSON.stringify(send))
                send = null
            }
        })
    }
    else
    {
        //填写信息有误
        console.log(`${id}填写信息有误`)
        send_obj.set('register',0,"填写信息有误")
        let send = send_obj.get()
        sock.write(JSON.stringify(send))
        send = null
        return
    }

}

//查找玩家
function check_player(sock,data)
{
    let id = data['data'][0]
    mongodb.check_player(id,function(err,res)
    { 
        if(err)
        {
            //数据库出错
            console.log(`${sock.remoteAddress}:${sock.remotePort}数据库err:`)
            console.log(res)
        }
        if(res.length>0)
        {
            //去除密码
            for(let i = 0;i<res.length;i++)
            {
                delete res[i]['pwd']
            }
            console.log(`${sock.remoteAddress}:${sock.remotePort}查询结果:`)
            console.log(res)
            
            //发送结果
            send_obj.set('check_player',1,res[0])
            let send = send_obj.get()
            sock.write(JSON.stringify(send))
            send = null
            return 
        }
        console.log(`${sock.remoteAddress}:${sock.remotePort}查询失败`)
        send_obj.set('check_player',0,"查询失败")
        let send = send_obj.get()
        sock.write(JSON.stringify(send))
        send = null
    })
}

function update_name(sock,data)
{
    let id = data['data'][0]
    let new_name= data['data'][1]
    if(id&&new_name)
    {
        mongodb.update_name(id,new_name,function(err,res)
        {
            if(err)
            {
                //数据库出错
                console.log(`${sock.remoteAddress}:${sock.remotePort}更新失败:`)
                console.log(err)
                send_obj.set('update_name',0,"未知错误！")
                let send = send_obj.get()
                sock.write(JSON.stringify(send))
                send = null
                return
            }
            else
            {
                //更新成功
                console.log(`${sock.remoteAddress}:${sock.remotePort}更新结果:`)
                console.log(res.result)
                send_obj.set('update_name',1,"更新成功！")
                let send = send_obj.get()
                sock.write(JSON.stringify(send))
                send = null
            }

        })
    }
    else
    {
         //填写信息有误
         console.log(`${id}填写信息有误`)
         send_obj.set('update_name',0,"填写信息有误")
         let send = send_obj.get()
         sock.write(JSON.stringify(send))
         send = null
         return
    }
}

//删除
function delete_player(sock,data)
{
    let id = data['data']['id']
    mongodb.delete_player(id,function(err,res)
    {
        if(err)
		{
			//数据库出错
			console.log(`${sock.remoteAddress}:${sock.remotePort}删除失败:`)
			console.log(err)
			send_obj.set('delete_player',0,"未知错误！")
			let send = send_obj.get()
			sock.write(JSON.stringify(send))
			send = null
			return
		}
		else
		{
			//删除成功
			console.log(`${sock.remoteAddress}:${sock.remotePort}删除结果:`)
			console.log(res.result)
			send_obj.set('delete_player',1,"删除成功！")
			let send = send_obj.get()
			sock.write(JSON.stringify(send))
			send = null
		}
    })    
}

// //产ID测试
// let id = new Make_id()
// console.log(id.get_id())

//玩家对象测试
// let player1= new Players(1,2,"g")
// console.log(player1.toString())

// //数据库测试
//登陆
// function test(pwd){
//     console.log(pwd)
// }

// function log_in(result,pwd){
//     if(result){
//             console.log(result)
//             console.log(pwd)
//         }
//     else{
//         console.log('no player')
//     }
// }
// let mongodb = new MongoDB()
// let player = mongodb.check_player(1001,log_in,"123")


// // mongodb.delete_player(5)
// mongodb.close_DB()


