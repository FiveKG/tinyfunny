class Player_pool
{
    constructor()
    {
        this.pool = new Map();
    }
    add_player(port,player_obj)
    {
        this.pool.set(port,player_obj)
    }
    delete_player(port)
    {
        this.pool.set(port)
    }
    check_player(port)//返回玩家对象
    {
        return this.pool.get(port)
    }
    check_pool()
    {
        console.log(this.pool)
    }
}

module.exports = Player_pool;