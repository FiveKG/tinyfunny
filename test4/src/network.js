let net = require('net')


class Network
{
    constructor()
    {   
        this.port = 8080
        this.host = '127.0.0.1'
        this.account_socket_handler =null//for players_manager
        this.player_socket_handler =null //for accounts_manager
        this.prepare_connect()
    }
    prepare_connect()
    {
        let that = this
        this.server=net.createServer(function(sock)
        {
            sock.player = null
            sock.account = null
            async function rec_data(data)
            {
                data = JSON.parse(data)
                //先发account，后发player
                await that.account_socket_handler(data,sock) 
                await that.player_socket_handler(data,sock)
                
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

    set_account_handler(handler)
    {
        this.account_socket_handler = handler
    }

    set_player_handler(handler)
    {
        this.player_socket_handler = handler
    }

}

module.exports = Network;

