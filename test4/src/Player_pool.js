class Player_pool
{
    constructor()
    {
        this.pool = new Map()
    }
    add_player(id,player_obj)
    {
        this.pool.set(id,player_obj)
    }
    delete_player(id)
    {
        this.pool.delete(id)
    }
    get_player(id)//返回玩家对象
    {
        return this.pool.get(id)
    }
    check_pool()
    {
        console.log('玩家池:')
        console.log(this.pool)
    }
}

module.exports = Player_pool