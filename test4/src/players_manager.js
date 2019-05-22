let Player = require('./player')

class Players_manager
{
    constructor(server)
    {
        let network = server.network
        network.set_player_handler(this.on_data.bind(this))
        this.sock = null

        this.send_rec_obj = server.send_rec_obj
        this.mongo = server.mongo

        this.server = server
    }


    //逻辑业务
    on_data(data, sock)
    {
        this.sock = sock
        //没有登陆的状态
        if (!sock.player)
        {
            switch (data['operate'])
            {
                case 'log_in':
                    this.log_in(sock)
                    break
                case 'create_player':
                    this.create_player(data['data'],sock)
                    break
                default:
                    break;
            }
        }

        //登陆阶段
        if (sock.player)
        {
            let player = sock.player

            switch (data['operate'])
            {
                case 'find_player':
                    player.find_player(data['data'])
                    break
                case 'delete_player':
                    player.delete_player()
                    break
                case 'update_name':
                    player.update_name(data['data'])
                    break
                case 'log_out':
                    player.log_out()
                default:
                    break;
            }
        }

    }


    async log_in(sock)
    {
        if (sock.account)
        { 
            let id =parseInt(sock.account.player)
            if(id)
            {
                try
                {
                    let res= await this.mongo.find_one('players', { '_id': id })

                    let pid = res._id
                    let name = res.name
                    let sex = res.sex

                    //sock和player绑定联系
                    let player = new Player({ 'id': pid, 'name': name, 'sex': sex }, this.mongo)
                    sock.player = player
                    player.set_sock(sock)

                    //发包
                    this.send_sock('log_in', 1, { 'id': pid, 'name': name, 'sex': sex })
                }
                catch(err)
                {
                    console.log(err)
                }
            }
            else
            {
                console.log(`${sock.remoteAddress}:${sock.remotePort} player为null`)
                this.send_sock('log_in', 0, '玩家为空')
                return
            }
            
        }
    }

    async create_player(player_data,sock)
    {   

        let[name,sex] = player_data

        let pid = sock.account.id

        let player = new Player({id:pid,name:name,sex:sex},this.mongo)
        sock.player = player
        player.set_sock(sock)
        
        let palyer_data = { '_id': pid, 'name': name, 'sex': sex}
        try
        {
            await this.mongo.insert('players', palyer_data)
        }
        catch(err)
        {
            console.log(err)
            return
        }

        console.log(`${sock.remoteAddress}:${sock.remotePort} 创建玩家`)
        //发包
        this.send_sock('create_player',1,'创建玩家成功')
    }

    send_sock(...args)
    {
        this.send_rec_obj.set(args[0], args[1], args[2])
        let send = this.send_rec_obj.get()
        this.sock.write(JSON.stringify(send))
    }

}

module.exports = Players_manager