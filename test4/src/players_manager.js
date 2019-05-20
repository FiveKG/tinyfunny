let Player = require('./player')
let Make_id = require('./make_id')
let Send_rec_format = require('./send_rec_format')
let Account = require('./account')

class Players_manager
{
    constructor(server)
    {
        this.send_rec_obj = new Send_rec_format()
        this.make_id = new Make_id()
        this.all_account = {}


        let network = server.network
        network.set_handler(this.on_data.bind(this))

        //模拟一个用户进内存
        let account = new Account({'aid':1001,'pwd':'123','player': 6324})
        this.all_account['1001']=account

        
        this.mongo = server.mongo
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
            
            switch (data['operate'])
            {
                case 'find_player':
                    player.find_player(data['data'])
                    break
                case 'delete_player':
                    player.delete_player()
                    break
                case 'log_out':
                    delete sock.player
                    player.log_out()
                    break
                case 'update_name':
                    player.update_name(data['data'])
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
        let [aid, pwd] = id_pwd
        let that = this

        let account = this.all_account[aid]
        if(account&&account['pwd']==pwd)
        {
            this.mongo.find_one({'_id':account.player},function(err,res)
            {
                if(err)
                {
                    console.log(err)
                    throw err
                }
                let pid = res._id
                let name = res.name
                let sex = res.sex
                
                //sock和player绑定联系
                let player = new Player({'id':pid,'name':name,'sex':sex},that.mongo)
                sock.player = player
                player.set_sock(sock)

                console.log(`${sock.remoteAddress}:${sock.remotePort} 登陆成功`)

                that.send_rec_obj.set('log_in', 1, {'id':pid,'name':name,'sex':sex})
                let send = that.send_rec_obj.get()
                sock.write(JSON.stringify(send))
            })
        }
    }
    //注册，成功返回true，失败返回false
    create_player(register_data, sock)
    {
        let that = this
        //整理数据
        let pid= this.make_id.get_id()
        let aid = this.make_id.get_id()
        let name  = register_data[0]
        let sex = register_data[1]
        let pwd = register_data[2]

        let player_data = { '_id': pid, 'name': name, 'sex': sex,}
        let account_data = {'aid': aid, 'pwd':pwd, 'player':pid}

        // 创建account
        

        this.mongo.insert(player_data,function(err,res)
        {
            if (err)
            {
                console.log(err)
                throw err
            }
            if (res)
            {
                let account = new Account(account_data)
                let player = new Player(player_data,that.mongo)
                that.all_account[account.aid] = account
                that.send_rec_obj.set('register', 1, account)

                console.log(that.all_account)
                console.log(`${sock.remoteAddress}:${sock.remotePort} 注册成功`)
            }
            let send = that.send_rec_obj.get()
            sock.write(JSON.stringify(send))
        })
    }
}

module.exports = Players_manager