//玩家类
class Player
{
    constructor()
    {
        this.pid
        this.name = "somebody"
    }

    //修改名字行为
    update_name(new_name)
    {
        this.name = new_name
        console.log(`player ${this.pid} change name :${new_name}`)
    }
}

//玩家管理类
class PlayersMangaer
{
    constructor()
    {
        this.players = {}
    }

    //创建
    create_player()
    {
        let player = new Player()
        return player
    }

    //查找
    find_player(pid)
    {
        return this.players[pid]
    }

    //删除
    delete_player(player)
    {
        delete this.players[player.pid]
    }
}

//网络
class Network
{
    
}

//服务端类
class Server
{
    constructor()
    {
        this.players_manager = new PlayersMangaer()
        this.network = new Network()
    }

    //网络监听


}
