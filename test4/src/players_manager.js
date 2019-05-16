let Player = require('./player')
let Make_id = require('./make_id')
let Send_rec_format = require('./send_rec_format')


class Players_manager
{   
    constructor(server)
    {
        this.send_rec_obj =new Send_rec_format()
        this.make_id = new Make_id()
        this.log_in_players = {}
        this.registered_players = {}
       

        this.server = server
        let network = server.network
        network.set_handler(this.on_data.bind(this))

        this.mongoDB = server.mongoDB

        
    }

    //逻辑业务
    on_data(data,sock)
    {   
        switch (data['operate']) {
            case 'register':
                this.create_player(data['data'],sock)
                break
            case 'log_in':
                this.log_in(data['data'],sock)
                break
            case 'log_out':
                this.log_out(data['data'],sock)
                break
            case 'find_player':
                this.find_player(data['data'],sock)
                break
            case 'delete_player':
                this.delete_player(data['data'],sock)
                break
            case 'check_log_players':
                this.check_log_players()
                break
            case 'update_name':
                this.update_name(data['data'],sock)
                break
            case 'close_connect':
                this.close_connect(data['data'])
                break
            default:
                break;
        }
    }

    check_log_players()
    {
        console.log('已登陆玩家：')
        console.log(this.log_in_players)
    }
    log_in(id_pwd,sock)
    {
        let [pid,pwd] = id_pwd
        //mongodb
        let that= this
        let result = this.mongoDB.find_player(pid)
        result.then(function(res,err)
        {
            if(err)
            {
                that.send_rec_obj.set('log_in',0,"登陆失败")
                console.log(err)
            }
            else
            {
                if(res&&res['pwd']==pwd)
                {
                    let player = new Player([res['_id'],res['name'],res['sex'],res['pwd']])
                    that.log_in_players[pid] = player
                    that.send_rec_obj.set('log_in',1,player)
                    console.log(`已登陆玩家池：${JSON.stringify(that.log_in_players)}`)
                }
                else
                {
                    that.send_rec_obj.set('log_in',0,"密码错误/未注册")
                }
            }
            let send = that.send_rec_obj.get()
            sock.write(JSON.stringify(send))
        })
        
    }

    log_out(player,sock)
    {
        let pid = player.id
        delete this.log_in_players[pid]
        this.send_rec_obj.set('log_out',1,'登出成功')
        let send = this.send_rec_obj.get()
        sock.write(JSON.stringify(send))
        console.log(`${sock.remoteAddress}:${sock.remotePort}:${pid}登出成功`)

        console.log(`已登陆玩家池：${JSON.stringify(this.log_in_players)}`)
    }

      //注册，成功返回true，失败返回false
    create_player(register_data,sock)
    {   
        //整理数据
        let player_data = register_data
        let pid = this.make_id.get_id()
        player_data.splice(0,0,pid)
        
        //mongodb
        let result = this.mongoDB.create_player(player_data)
        let that = this
        result.then(function(res,err)
        {
            if(err)
            {
                that.send_rec_obj.set('register',0,"创建失败")
                console.log(err)
            }
            else
            {
                that.send_rec_obj.set('register',1,"你的账号为:"+pid)       
            }
            let send = that.send_rec_obj.get()
            sock.write(JSON.stringify(send))
            console.log(`${sock.remoteAddress}:${sock.remotePort}注册结果:${JSON.stringify(res.result)}`)
        })

    }
  
    //查询玩家，存在返回数据，不存在返回undefind
    find_player(pid,sock)
    {   
        //mongodb
        let result = this.mongoDB.find_player(pid)
        let that = this
        result.then(function(res,err)
        {
            if(err)
            {
                that.send_rec_obj.set('find_player',0,"查找失败")
                console.log(err)
            }
            else
            {
                that.send_rec_obj.set('register',1,res)
            }
            let send = that.send_rec_obj.get()
            sock.write(JSON.stringify(send))
            console.log(`${sock.remoteAddress}:${sock.remotePort}查询结果:${JSON.stringify(res)}`)
        })
    }

    //删除玩家
    delete_player(player,sock)
    {
        let pid = player.id
        //mongodb
        let result = this.mongoDB.delete_player(pid)
        let that = this

        result.then(function(res,err)
        {
            if(err)
            {
                that.send_rec_obj.set('delete_player',0,"删除失败")
                console.log(err)
            }
            else
            {
                that.send_rec_obj.set('delete_player',1,"删除成功")
            }
            let send = that.send_rec_obj.get()
            sock.write(JSON.stringify(send))
            console.log(`${sock.remoteAddress}:${sock.remotePort}删除结果:${JSON.stringify(res)}`)
        })
        delete this.log_in_players[pid] 
    }

    update_name(update_data,sock)
    {
        //mongodb
        let [player,new_name] = update_data
        let result = this.mongoDB.update_name(player.id,new_name)

        let that = this
        result.then(function(res,err)
        {
            if(err)
            {
                that.send_rec_obj.set('update_name',0,"更名失败")
                console.log(err)
            }
            else
            {
                that.send_rec_obj.set('update_name',1,"更名成功")
            }
            let send = that.send_rec_obj.get()
            sock.write(JSON.stringify(send))
            console.log(`${sock.remoteAddress}:${sock.remotePort}更名结果:${JSON.stringify(res)}`)
        })
    }

    close_connect(player)
    {   
        let pid = player.id
        delete this.log_in_players(pid)
        console.log(`已登陆玩家池：${JSON.stringify(this.log_in_players)}`)
    }

}

module.exports = Players_manager