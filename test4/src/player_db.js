let MongoDB = require('./mongo')
class Player_db extends MongoDB
{
    constructor()
    {
        super('players')
    }

    
    // 查询接口
    find(cond, call_back)
    {
        super.find(cond,call_back)
    }

    //查询单个
    find_one(cond,call_back)
    {
        super.find_one(cond,call_back)
    }

    //修改 
    update(cond, info, call_back)
    {
        super.update(cond,info,call_back)
    }

    //删除
    delete(cond, call_back)
    {
        super.delete(cond,call_back)
    }

    //添加
    insert(cond,call_back)
    {
        super.insert(cond,call_back)
    }

    test()
    {
        super.test()
    }
}
module.exports = Player_db