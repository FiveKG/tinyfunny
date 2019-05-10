let Players= require('./src/Players');
let Make_id = require('./src/Make_id');
let MongoDB = require('./src/MongoDB')
let Player_pool = require('./src/Player_pool')
let Send_server = require('./src/Send_server');
let make_id = new Make_id()
let net = require('net');
//define host and port to run the server
const port = 8080;
const host = '127.0.0.1';
let mongodb = new MongoDB();
let send_obj = new Send_server();
let player_pool =new Player_pool();

//Create an instance of the server创建一个服务器实例
const server = net.createServer(onClientConnection);
//Start listening with the server on given port and host.开始监听
server.listen(port,host,function()
{
   console.log(`Server started on port ${port} at ${host}`); 
});
//Declare connection listener function 声明监听方法
function onClientConnection(sock)
{
    //Log when a client connnects.记录客户连接
    sock.setEncoding('utf-8')
    console.log(`${sock.remoteAddress}:${sock.remotePort} Connected`);
     //Listen for data from the connected client. 监听来自客户端的信息
    sock.on('data',function(data)
    {
        //Log data from the client 记录客户端信息
        console.log(`${sock.remoteAddress}:${sock.remotePort} Says : ${data} `);
        //Send back the data to the client. 返回信息给客户端
        data = JSON.parse(data)
        switch(data["operate"])
        {
          case "log_in":
            log_in(sock,data);//登陆
            break;
          case "log_out":
            log_out(sock,data);//登出
            break;
          case 'register':
            register(sock,data);//注册
            break;
          default:
            break;
        }
        
    });
    //Handle client connection termination. 处理客户端断开连接
    sock.on('close',function()
    {
        console.log(`${sock.remoteAddress}:${sock.remotePort} Terminated the connection`);
    });
    //Handle Client connection error. 处理客户端连接异常
    sock.on('error',function(error)
    {
        console.error(`${sock.remoteAddress}:${sock.remotePort} Connection Error ${error}`);
    });
};


//登陆
function log_in(sock,data)
{
  let id = parseInt(data["data"][0]);
  let pwd = data["data"][1];
  mongodb.check_player(id,function(result)
  {
    if(result)
    {
      if(pwd == result[0]["pwd"])//密码正确
      {
        //登陆成功则建立一个玩家对象
        id = result[0]['_id'];
        let name = result[0]['name'];
        let sex = result[0]['sex'];

        let player1= new Players(id,name,sex,1);//玩家对象
        player_pool.add_player(sock.remotePort,player1);//玩家放进玩家池
        
        //发送玩家信息给客户端
        send_obj.set('log_in',1,player1)
        let send = send_obj.get();
        sock.write(JSON.stringify(send));
        //查看玩家池
        player_pool.check_pool();
      }
      else
      {
        //密码不正确
        sock.write('密码错误');
      }
    }
    else
    {
      sock.write('查无此人！');
    }
  });
}
//登出
function log_out(sock,data)
{
  //玩家池删除该玩家
  player_pool.delete_player(sock.remotePort);
  //通知删除结果
  send_obj.set('log_out',1,null)
  let send = send_obj.get();
  sock.write(JSON.stringify(send));
  //查看玩家池
  console.log(player_pool)
}
//注册
function register(sock,data)
{
  let id = make_id.get_id();
  let name = data['data'][0];
  let sex = data['data'][1];
  let pwd = data['data'][2];
  //填写有错
  if(id&&name&&sex&&pwd)
  {
    
  }
  else
  {
    console.log('填写信息有误')
    send_obj.set('register',0,"填写信息有误")
    return
  }

  //插入数据库
  mongodb.insert_player(id,name,sex,pwd,function(err,res)
  {
      if(err)
      {
        console.log('inser err:'+err)
      }
      else
      {
        console.log(res.result)
      }
  });
  

}
// //产ID测试
// let id = new Make_id();
// console.log(id.get_id());

//玩家对象测试
// let player1= new Players(1,2,"g");
// console.log(player1.toString());

// //数据库测试
//登陆
// function test(pwd){
//   console.log(pwd)
// }

// function log_in(result,pwd){
//   if(result){
//       console.log(result);
//       console.log(pwd)
//     }
//   else{
//     console.log('no player')
//   }
// }
// let mongodb = new MongoDB();
// let player = mongodb.check_player(1001,log_in,"123");


// // mongodb.delete_player(5);
// mongodb.close_DB();


