class Account_manager
{
    constructor(server)
    {
        this.cur_max_pid = null
        this.all_accounts = {}
        
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
         if (!sock.account)
        {
             switch (data['operate'])
            {
                case 'register':
                    this.create_account(data['data'], sock)
                    break
                case 'log_in':
                    this.log_in(data['data'], sock)
                    break
                default:
                    break;
            }
        }

        //登陆阶段
        if (sock.account)
        {
            let player = sock.player

            switch (data['operate'])
            {

                case 'delete_player':
                    player.delete_player()
                    break
                case 'log_out':
                    delete sock.player
                    player.log_out()
                    break
                default:
                    break;
            }
        }

    }

    async log_in(account_id_pwd,sock)
    {
        let [aid, pwd] = account_id_pwd
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
    

    async create_account()
    {
        
    }
}