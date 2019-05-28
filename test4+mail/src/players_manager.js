let Player = require('./player')

class Players_manager
{
    constructor(server)
    {
        this.cur_max_pid = null

        this.send_rec_obj = server.send_rec_obj
        this.mongo = server.mongo

    }

     //获取id
     async load_max_pid()
     {
         let res =await this.mongo.find('max_id', {_id:"get_aid"})
         this.cur_max_pid = res[0].aid
     }


    async init_player(sock)
    {
        if(sock.account)
        { 
            let id =parseInt(sock.account.player)
            if(id)//如果该账号有player对象则初始化player，没有则提示创建
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
                    this.send_sock(sock,'log_in', 1, { 'id': pid, 'name': name, 'sex': sex })
                }
                catch(err)
                {
                    console.log(err)
                }
            }
            else
            {
                console.log(`${sock.remoteAddress}:${sock.remotePort} player为null`)
                this.send_sock(sock,'log_in', 0, '玩家为空')
                return
            }
            
        }
    }

    async create_player(player_data,sock)
    {   
        if(sock.player)
        {
            this.send_sock(sock,'create_player',0,'已有玩家角色')
            return
        }

        //获取id
        let pid = sock.account.id
        let[name,sex] = player_data 
    
        //更新数据库
        let palyer_data = { '_id': pid, 'name': name, 'sex': sex,"mail_head":[]}
        try
        {
            await this.mongo.insert('players', palyer_data)
        }
        catch(err)
        {
            console.log(err)
            return
        }

        //更新内存上account.player
        sock.account.player = pid


        console.log(`${sock.remoteAddress}:${sock.remotePort} 创建玩家`)
        //发包
        this.send_sock(sock,'create_player',1,'创建玩家成功')   
    }

    send_sock(sock,...args)
    {
        this.send_rec_obj.set(args[0], args[1], args[2])
        let send = this.send_rec_obj.get()
        sock.write(JSON.stringify(send))
    }

}

module.exports = Players_manager