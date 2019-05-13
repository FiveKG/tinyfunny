let net = require('net')
let Send_client = require('./src/Send_client')
let Players= require('./src/Players')
let readline = require('readline') 
let send_obj =new Send_client()
let player =null
let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
    })
//define the server port and host 定义服务器地址和端口号
const port = 8080
const host = '127.0.0.1'
//Create an instance of the socket client.创建一个客户端实例
const client = new net.Socket()
//Connect to the server using the above defined config.使用以上配置连接服务器
client.connect(port,host,function()
{
   console.log(`Connected to server on ${host}:${port}`)
   
    rl.setPrompt('command> ') 
    

    rl.on('line',function(line)
    {
        rl.prompt()
        switch (line.trim())
        {
            case 'log_in':
                log_in() 
                break
            case 'log_out':
                log_out()
                break
            case 'register':
                if(player)
                {
                    console.log('你已登陆!')
                }
                else
                {
                    register()
                } 
                break
            case 'check_player':
                if(player)
                {
                    check_player()
                }
                else
                {
                    console.log('请先登陆')
                } 
                break
            case 'update_name':
                if(player)
                {
                update_name()
                }
                else
                {
                    console.log('请先登陆')
                }
                break
            case 'delete_player'://删除玩家
                if(player)
                {
                    delete_player()
                }
                else
                {
                    console.log('请先登陆')
                } 
                break 
            case 'close':
                client.destroy()
                break
            default:
                break
        }
    })
})
//登陆
function log_in()
{
    console.log("输入账号:")
    let rows = 2//控制行数
    let data = []//存储输入的数据

    rl.on('line',function(line)
    {
        //将接下来两行的数据保存在数组并发送到服务端
        data.push(line)
        if(data.length == 1)
        {
            console.log('请输入密码:')
        }
        if(rows==data.length)
        {
            send_obj.set('log_in',1,data)
            let send  = send_obj.get()
            client.write(JSON.stringify(send))
        }
    })
}

//登陆成功
function log_in_success(player_data)
{   
    let id = player_data['id']
    let name = player_data['name']
    let sex = player_data['sex']
    let statue = player_data['statue']
    player = new Players(id,name,sex,statue)
    console.log('登陆成功')
    player.toString()
}

//登出
function log_out()
{
    console.log("退出yes/no?")
    let rows = 1//控制行数
    let data = []//存储输入的数据
    rl.on('line',function(line){
        data.push(line)
        //将接下来两行的数据保存在数组并发送到服务端
        if(rows==data.length&&line =="yes")
        {
            send_obj.set('log_out',1,player)
            let send = send_obj.get()
         
            client.write(JSON.stringify(send))
        }
    })
}

//注册
function register()
{
    let rows =3
    let data = []//存储输入的数据
    console.log('请输入名称:')
    rl.on('line',function(line)
    {
        //将接下来的数据保存在数组并发送到服务端
        data.push(line)
        if(data.length == 1)
        {
            console.log('请输入性别(female/male):')
        }
        if(data.length == 2)
        {
            console.log('请输入密码:')
        }
        if(data.length ==rows)
        {
            //转载发送
            send_obj.set('register',1,data)
            let send  = send_obj.get()
            client.write(JSON.stringify(send))
        }
    })
}

//查找
function check_player()
{
    let rows =1
    let data = []//存储输入的数据
    console.log('请输入id号:')
    rl.on('line',function(line)
    {
        //将接下来的数据保存在数组并发送到服务端
        data.push(line)
        if(data.length ==rows)
        {
            //转载发送
            send_obj.set('check_player',1,data)
            let send  = send_obj.get()
            client.write(JSON.stringify(send))
        }
    })
}

//更新
function update_name()
{
    let rows =2
    let data = [player.id]//存储输入的数据
    console.log('请输入新名字:')

    rl.on('line',function(line)
    {
        //将接下来的数据保存在数组并发送到服务端
        data.push(line)
        if(data.length ==rows)
        {
            //转载发送
            send_obj.set('update_name',1,data)
            let send  = send_obj.get()
            client.write(JSON.stringify(send))
        }
    })
}

//删除自己
function delete_player()
{
    console.log("删除yes/no?")
    let rows = 1//控制行数
    let data = []//存储输入的数据
    rl.on('line',function(line){
        data.push(line)
        //将接下来两行的数据保存在数组并发送到服务端
        if(rows==data.length&&line =="yes")
        {
            send_obj.set('delete_player',1,player)
            let send = send_obj.get()
         
            client.write(JSON.stringify(send))
        }
    })
}

//Add a data event listener to handle data coming from the server 添加一个事件去处理来自服务器的信息
client.on('data',function(data)
{
  //console.log(`Server Say ${data}`)
  data = JSON.parse(data)
   switch(data["operate"])
   {
        case 'log_in':
            if(data["result"]==1)
            {
                log_in_success(data['data'])
            }
            else
            {
                console.log(data['data'])
            }
            break
        case 'log_out':
            if(data['result']==1)
            {
                player=null
                console.log('登出成功')
            }
            break
        case 'register':
            if(data['result']==1)
            {
                console.log('注册成功')
                console.log(data['data'])
            }
            else
            {
                console.log(data['data'])
            }
            break
        case 'check_player':
            console.log(data['data'])
            break
        case 'update_name':
            console.log(data['data'])
            break
        case 'delete_player':
            if(data['result']==1)
            {
                console.log(data['data'])
                player=null
            }
            else
            {
                console.log(data['data'])
            }
            break
        default:
            break
   }
})



//Add Client Close function 关闭客户端
client.on('close',function()
{   
    rl.close()
   console.log('Connection Closed')
})
//Add Error Event Listener 异常捕捉
client.on('error',function(error){
   console.error(`Connection Error ${error}`) 
})

rl.on('close', function()
{ 
    console.log('readline退出!')
    //process.exit(0)
})
