let net = require('net');
let readline = require('readline'); 
let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
    });
//define the server port and host 定义服务器地址和端口号
const port = 8080;
const host = '127.0.0.1';
//Create an instance of the socket client.创建一个客户端实例
const client = new net.Socket();
//Connect to the server using the above defined config.使用以上配置连接服务器
client.connect(port,host,function(){
   console.log(`Connected to server on ${host}:${port}`);
   
    rl.setPrompt('command> '); 
    rl.prompt();

    rl.on('line',function(line)
    {
        switch (line.trim())
        {
            case 'log_in':
                log_in(rl); 
                break;
            case 'log_out':
                log_out(rl);
                break;
            default:
                break;
        }
        
    })
    
    // rl.on('line', function(line) {
    //     switch(line.trim()) {
    //     case 'log_in':
    //     log_in();
    //     client.write(line);
    //     break;
    //     case 'register':
    //     client.write('check_player');
    //     break;
    //     case 'close':

    //        rl.close()
        
    //     break;
    //     default:
    //     console.log('没有找到命令！');
    //     break;
    //     }
    // });

});

function log_in(){
    console.log("输入账号密码");
    let log_in_data = {};
    let rows = 2;//控制行数
    let data = [];//存储输入的数据
    rl.on('line',function(line){
        //将接下来两行的数据保存在数组并发送到服务端
        data.push(line);
        if(rows==data.length){
        log_in_data= {"log_in":data};
        client.write(JSON.stringify(log_in_data));
        }
    });
}

function log_out(){
    console.log("退出yes/no?");
    let log_out_data = {};
    let rows = 1;//控制行数
    let data = [];//存储输入的数据
    rl.on('line',function(line){
        data.push(line);
        //将接下来两行的数据保存在数组并发送到服务端
        if(rows==data.length&&line =="yes"){
        
        log_out_data= {"log_out":data};
        client.write(JSON.stringify(log_out_data));
        }
    });
}

rl.on('close', function() { 
    console.log('readline退出!');
    //process.exit(0);
   });

//Add a data event listener to handle data coming from the server 添加一个事件去处理来自服务器的信息
client.on('data',function(data){
   console.log(` ${data}`); 
});
//Add Client Close function 关闭客户端
client.on('close',function(){
   console.log('Connection Closed');
});
//Add Error Event Listener 异常捕捉
client.on('error',function(error){
   console.error(`Connection Error ${error}`); 
});