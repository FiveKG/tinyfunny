let Player = require('./player')
let Send_rec_format = require('./send_rec_format')

class Players_manager
{
    constructor(server)
    {
        this.send_rec_obj = new Send_rec_format()
        this.all_accounts = {}

        this.cur_max_pid = null

        let network = server.network
        network.set_handler(this.on_data.bind(this))

        this.mongo = server.mongo
        this.load_accounts()
        this.load_max_pid()
    }
    //获取id
    async load_max_pid()
    {
        let that = this
        let res =await this.mongo.find('max_pid', {})

        that.cur_max_pid = res[0].pid
    }

    //加载
    async load_accounts()
    {
        let that = this
        let res = await this.mongo.load("accounts", {})

        for (let i = 0; i < res.length; i++)
        {
            let _id = res[i]._id
            that.all_accounts[_id] = res[i]
        }

        console.log(that.all_accounts)
        console.log('accounts 加载完毕!')
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


    async log_in(id_pwd, sock)
    {
        let [aid, pwd] = id_pwd
        let that = this

        let account = this.all_accounts[aid]
        if (account && account['pwd'] == pwd)
        {
            let res= await this.mongo.find_one('players', { '_id': account.player })

            let pid = res._id
            let name = res.name
            let sex = res.sex

            //sock和player绑定联系
            let player = new Player({ 'id': pid, 'name': name, 'sex': sex }, that.mongo)
            sock.player = player
            player.set_sock(sock)

            console.log(`${sock.remoteAddress}:${sock.remotePort} 登陆成功`)

            that.send_rec_obj.set('log_in', 1, { 'id': pid, 'name': name, 'sex': sex })
            let send = that.send_rec_obj.get()
            sock.write(JSON.stringify(send))
        
        }
    }

    //注册
    async create_player(register_data, sock)
    {
        let that = this
        //整理数据

        let pid = this.cur_max_pid += 1
        let aid = pid

        let name = register_data[0]
        let sex = register_data[1]
        let pwd = register_data[2]

        let player_data = { '_id': pid, 'name': name, 'sex': sex, }
        let account_data = { '_id': aid, 'pwd': pwd, 'player': pid }

        try
        {
            // 创建account,保存进数据库
            await this.mongo.insert('accounts', account_data)

            // 创建player,保存进数据库
            await this.mongo.insert('players', player_data)


            //更新num数字
            await this.mongo.update('max_pid', { _id: "get_pid" }, { $set: { pid: pid }})
        }
        catch(err)
        {
            console.log(err)
        }
        


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