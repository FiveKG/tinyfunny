let Account = require('./account')
class Account_manager
{
    constructor(server)
    {
        this.cur_max_pid = null
        this.all_accounts = {}

        let network = server.network
        network.set_account_handler(this.on_data.bind(this))

        this.send_rec_obj = server.send_rec_obj

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
            let account = sock.account

            switch (data['operate'])
            {

                case 'delete_player':
                    account.delete_player()
                    break
                case 'log_out':
                    delete sock.account
                    account.log_out()
                    break
                default:
                    break;
            }
        }

    }

    async log_in(account_id_pwd,sock)
    {
        let [aid, pwd] = account_id_pwd
        aid = parseInt(aid)
        
        let that = this

        let account = this.all_accounts[aid]
        if (account && account['pwd'] == pwd)
        {
            //sock和account绑定关系
            let account = new Account({'id':aid,'pwd':pwd,'player':aid},that.mongo)
            sock.account = account
            account.set_sock(sock)

            console.log(`${sock.remoteAddress}:${sock.remotePort} 登陆成功`)

            that.send_rec_obj.set('log_in', 1, {'id':aid,'pwd':pwd,'player':aid})
            let send = that.send_rec_obj.get()
            sock.write(JSON.stringify(send))
        }
    }
    

   //注册
   async create_account(register_data, sock)
   {
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
       this.all_accounts[account_data._id] = account_data
       console.log(this.all_accounts)
       console.log(`${sock.remoteAddress}:${sock.remotePort} 注册成功`)

       //发包
       this.send_rec_obj.set('register', 1, account_data)
       let send = this.send_rec_obj.get()
       sock.write(JSON.stringify(send))
   }
}

module.exports = Account_manager