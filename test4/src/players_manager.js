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
        this.all_accounts = {}


        let network = server.network
        network.set_handler(this.on_data.bind(this))

        this.player_db = server.player_db
        this.account_db = server.account_db

        this.load_accounts()
        
    }

    load_accounts()
    {
        let that = this
        Account.load_accounts(that.account_db,async function(err,res)
        {
            if(err)
            {
                console.log(err)
                throw err
            }

            function loading()
            {
                for(let i=0;i<res.length;i++)
                {
                    let _id =res[i]._id
                    that.all_accounts[_id]=res[i]
                    console.log(that.all_accounts)
                }
            }

            await loading()
            console.log('account 加载完毕!')
        })
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

        let account = this.all_accounts[aid]
        if(account&&account['pwd']==pwd)
        {
            this.player_db.find_one({'_id':account.player},function(err,res)
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
                let player = new Player({'id':pid,'name':name,'sex':sex},that.player_db)
                sock.player = player
                player.set_sock(sock)

                console.log(`${sock.remoteAddress}:${sock.remotePort} 登陆成功`)

                that.send_rec_obj.set('log_in', 1, {'id':pid,'name':name,'sex':sex})
                let send = that.send_rec_obj.get()
                sock.write(JSON.stringify(send))
            })
        }
    }
    //注册
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
        let account_data = {'_id': aid, 'pwd':pwd, 'player':pid}

        
        // 创建account,保存进数据库
        this.account_db.insert(account_data,function(err,res)
        {
            if (err)
            {
                console.log(err)
                throw err
            }
        })
        // 创建player,保存进数据库
        this.player_db.insert(player_data,function(err,res)
        {
            if(err)
            {
                console.log(err)
                throw err
            }
        })

        //把account加载进内存
        that.all_accounts[account_data._id] = account_data
        console.log(that.all_accounts)
        console.log(`${sock.remoteAddress}:${sock.remotePort} 注册成功`)
        
        //发包
        that.send_rec_obj.set('register', 1, account_data)
        let send = that.send_rec_obj.get()
        sock.write(JSON.stringify(send))
    }
}

module.exports = Players_manager