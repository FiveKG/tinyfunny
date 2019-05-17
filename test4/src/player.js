let Send_rec_format = require('./send_rec_format')
let send_rec_obj = new Send_rec_format()

class Player
{
    constructor({ id, name, sex, pwd })
    {
        this.id = id
        this.name = name
        this.sex = sex
        this.pwd = pwd

        //登录之后关联的连接
        this.sock = null
    }

    set_sock(sock)
    {
        this.sock = sock
    }

    on_mongoDB(opearte, result)
    {
        let sock = this.sock

        let that = this
        switch (opearte)
        {
            case 'find_player':
                result.then(function (res, err)
                {
                    if (err)
                    {
                        console.log(err)
                    }
                    that.send_sock(sock, opearte, 1, res.player)
                    console.log(`${sock.remoteAddress}:${sock.remotePort} 查询结果:${res.player}`)
                })
                break
            case 'update_name':
                result.then(function (res, err)
                {
                    if (err)
                    {
                        console.log(err)
                    }
                    that.send_sock(sock, opearte, 1, res.result)
                    console.log(`${sock.remoteAddress}:${sock.remotePort} 更改结果:${JSON.stringify(res.result)}`)
                })
                break
            case 'delete_player':
                result.then(function (res, err)
                {
                    if (err)
                    {
                        console.log(err)
                    }
                    that.send_sock(sock, opearte, 1, res.result)
                    console.log(`${sock.remoteAddress}:${sock.remotePort} 删除结果:${JSON.stringify(res.result)}`)
                })
                break
            default:
                break
        }
    }
    //@param new_name<array>
    update_name(new_name)
    {
        this.name = new_name[0]

        this.save_db(function ()
        {
            //发包
        })
    }

    //@param  pid<array>
    find_player(pid)
    {
        mongo.operate_mongoDB('find_player', pid[0], sock)
    }

    //@param player<Player>
    delete_player(sock)
    {
        mongo.operate_mongoDB('delete_player', this, sock)
    }

    //@param player<Player>
    log_out(sock)
    {
        delete this.sock

        this.send_sock(sock, 'log_out', 1, null)
        console.log(`${sock.remoteAddress}:${sock.remotePort} 登出成功 `)
    }

    // operate_mongoDB(operate,data)
    // {
    //     mongo.operate_mongoDB(operate,data)
    // }


    send_sock(sock, ...args)
    {
        send_rec_obj.set(args[0], args[1], args[2])
        let send = send_rec_obj.get()
        sock.write(JSON.stringify(send))
    }

    //序列化
    as_db()
    {
        return {
            _id: this.id,
            name: this.name,
            sex: this.sex,
        }
    }

    //保存player到数据库
    save_db(call_back)
    {
        let db = this.as_db()
        mongo.update({ _id: this.id }, { $set: { "player": db } }, call_back)
    }

}
module.exports = Player


account 账号角色
{
    id: 1 //
    pwd: 1234//
    player: xx
}

=>
{
    id: 1, pwd : 1234, player: 1
}

player 游戏角色
{
    pid: 1
    name: "xxx"
}

=>
{
    id: 1, name: "xxx"
}

