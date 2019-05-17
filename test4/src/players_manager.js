let Player = require('./player')
let Make_id = require('./make_id')
let Send_rec_format = require('./send_rec_format')


class Players_manager
{
    constructor(server)
    {
        this.send_rec_obj = new Send_rec_format()
        this.make_id = new Make_id()



        let network = server.network
        network.set_handler(this.on_data.bind(this))

        // let mongoDB = server.mongoDB
        // mongoDB.set_handler(this.on_mongoDB.bind(this))

        this.mongoDB = server.mongoDB
        this.server = server
    }

    //逻辑业务
    on_data(data, sock)
    {
        //没有登陆的状态
        if (!sock.player)
        {
            switch (data['operate'])
            {
                case 'register':
                    this.create_player(data['data'], sock)
                    break
                case 'log_in':
                    this.log_in(data['data'], sock)
                    break
                default:
                    break;
            }
        }

        //登陆阶段
        if (sock.player)
        {
            let player = sock.player
            // let operate = data.operate

            // let func = player[operate]
            // func(sock, data)

            switch (data['operate'])
            {
                case 'find_player':
                    player.find_player(data['data'], sock)
                    break
                case 'delete_player':
                    player.delete_player(sock)
                    break
                case 'log_out':

                    delete sock.player
                    player.log_out(sock)

                    break
                case 'update_name':
                    player.update_name(data['data'], sock)
                    break
                default:
                    break;
            }
        }

    }

    save_one_player(player)
    {
        //序列化
        let db = player.as_db()

        mongo.update({ _id: player.pid }, db)
    }

    log_in(id_pwd, sock)
    {
        let [pid, pwd] = id_pwd
        let that = this

        let result = this.mongoDB.find_player(pid)
        result.then(function (res, err)
        {
            if (err)
            {
                that.send_rec_obj.set('log_in', 0, "登陆失败")
                console.log(err)
            }
            if (res)
            {
                let player_data = res.player
                //player_data = JSON.parse(player_data)

                if (player_data.pwd == pwd)
                {
                    //建立连接
                    let player = new Player(player_data)
                    sock.player = player
                    player.set(sock)

                    that.send_rec_obj.set('log_in', 1, player)
                    console.log(`${sock.remoteAddress}:${sock.remotePort} 登陆成功`)
                }
                else
                {
                    that.send_rec_obj.set('log_in', 0, "密码错误")
                }

            }
            else
            {
                that.send_rec_obj.set('log_in', 0, "未注册")
            }

            let send = that.send_rec_obj.get()
            sock.write(JSON.stringify(send))
        })
    }
    //注册，成功返回true，失败返回false
    create_player(register_data, sock)
    {
        let that = this
        //整理数据
        let pid = this.make_id.get_id()

        let player_data = { 'id': pid, 'name': register_data[0], 'sex': register_data[1], 'pwd': register_data[2] }

        //创建玩家，放进mongodb
        let player = new Player(player_data)

        let result = this.mongoDB.create_player(player)

        result.then(function (res, err)
        {
            if (err)
            {
                that.send_rec_obj.set('register', 0, "注册失败")
                console.log(err)
            }
            if (res)
            {
                console.log(res.ops)
                console.log(`${sock.remoteAddress}:${sock.remotePort} 注册成功`)
                that.send_rec_obj.set('register', 1, player)
            }
            let send = that.send_rec_obj.get()
            sock.write(JSON.stringify(send))
        })
    }


}

module.exports = Players_manager