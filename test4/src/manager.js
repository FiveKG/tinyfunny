let Players = require('./players')

class Manager
{   
    constructor(server)
    {
       this.players = {}
       this.server = server

       let network_manager = server.network
       network_manager.handler(this.on_data.bind(this))

    }

    on_data(data)
    {
        console.log(data)
    }

      //注册，成功返回true，失败返回false
    create_player([pid,name,sex,pwd])
    {   
        return player = new Players([pid,name,sex,pwd])
    }
  
    //查询玩家，存在返回数据，不存在返回undefind
    find_player(pid)
    {
        return this.players[pid]
    }

    //删除玩家
    delete_player(player)
    {
        delete this.players[player.pid]
    }

}

module.exports = Manager