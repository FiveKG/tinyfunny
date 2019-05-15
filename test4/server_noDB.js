let Players= require('./src/players')
let Make_id = require('./src/make_id')
let MongoDB = require('./src/mongoDB')
let Player_pool = require('./src/player_pool')
let Send_server = require('./src/send_server')
let Manager = require('./src/manager')
let make_id = new Make_id()
let net = require('net')
//define host and port to run the server
const port = 8080
const host = '127.0.0.1'
let mongodb = new MongoDB()//数据库
let send_obj = new Send_server()//收发格式
let player_pool =new Player_pool()//登陆的玩家池

     //创建玩家用户

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
    let player = new Players()
    let manager = new Manager()
	sock.on('data',function(data)
	{
		//记录客户端信息
		console.log(`${sock.remoteAddress}:${sock.remotePort} Says : ${data} `)
		//. 返回信息给客户端
        data = JSON.parse(data)
        if(data['status']=='manager')
        {
            switch(data["operate"])
            {
                case "log_in":
				log_in(sock,data,manager)//登陆
				break
			case "log_out":
				log_out(sock,data,manager)//登出
				break
            case 'register':
                register(sock,data,manager)//注册
				break
			case 'update_name'://更新
				update_name(sock,data,manager)
                break
            case 'check_player'://查找
                check_player(sock,data,manager)
                break
            case 'delete_player'://删除玩家
                delete_player(sock,data,manager)
				break
			default:
				break
            }
        }
        else
        {
            switch(data["operate"])
		    {
                case "log_in":
                    log_in(sock,data,player)//登陆
                    break
                case "log_out":
                    log_out(sock,data,player)//登出
                    break
                case 'register':
                    register(sock,data,player)//注册
                    break
                case 'update_name'://更新
                    update_name(sock,data,player)
                    break
                default:
                    break
		    }
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
function log_in(sock,data,client)
{

    let result = client.log_in(data['data'])
    if(result)
    {
        client.toString()
        player_pool.check_pool()
        send_obj.set('log_in',1,data['data'])
    }
    else
    {
        send_obj.set('log_in',0,'登陆失败')
    }
    let send = send_obj.get()  
    sock.write(JSON.stringify(send))
}

//登出
function log_out(sock,data,client)
{
    client.log_out()
    //通知删除结果
    send_obj.set('log_out',1,null)
    let send = send_obj.get()
    sock.write(JSON.stringify(send))
    send = null
    //查看玩家池
    player_pool.check_pool()
}

//注册
function register(sock,data,client)
{
    let id = make_id.get_id()
    let client_data = data['data']
    client_data.unshift(id)

    let result = client.register(client_data);
    if(result)
    {   
        send_obj.set('register',1,client_data)
        let send = send_obj.get()
        sock.write(JSON.stringify(send))
        player_pool.add_player(id,client)

        player_pool.check_pool()
        client.toString()
    }
    else
    {
        send_obj.set('register',0,'注册失败')
        let send = send_obj.get()
        sock.write(JSON.stringify(send))
    }

}

//查找玩家
function check_player(sock,data,manager)
{
    let find_id = data['data'][0]
    console.log(find_id)
    
    let result = player_pool.get_player(find_id)
    console.log(result)
    
  
}

//更名
function update_name(sock,data,client)
{

    let result = client.update_name(data['data'][0])
   
    if(result)
    {
        send_obj.set('update_name',1,client)

    }
    else
    {
        send_obj.set('update_name',0,client)
    }
    let send = send_obj.get()
    sock.write(JSON.stringify(send))
    

    player_pool.check_pool()
}

//删除
function delete_player(sock,data)
{
    let id = data['data']

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


