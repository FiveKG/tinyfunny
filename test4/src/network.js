let net = require('net')


class Network
{
    constructor()
    {   
        this.port = 8080
        this.host = '127.0.0.1'
        this.socket_handler =null//for players_manager
        this.prepare_connect()
    }
    prepare_connect()
    {
        let that = this
        this.server=net.createServer(function(sock)
        {
            sock.player = null
            function rec_data(data)
            {
                data = JSON.parse(data)
                that.socket_handler(data,sock) 
            }
            console.log(`${sock.remoteAddress}:${sock.remotePort} Connected`)
            sock.on('data',rec_data)
            
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
        })

    }

    listen_connect()
    {
        let port =this.port
        let host = this.host
        this.server.listen(port,host,function()
        {
            console.log(`Server started on port ${port} at ${host}`) 
        })  
    }

    set_handler(handler)
    {
        this.socket_handler = handler
    }

}

module.exports = Network;

