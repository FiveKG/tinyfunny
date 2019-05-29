let Account = require('./account')
class Account_manager
{
    constructor(server)
    {
        this.cur_max_aid = null
        this.all_accounts = {}

        this.send_rec_obj = server.send_rec_obj

        this.mongo = server.mongo
        this.sock = null

        this.online = {}
   

        this.load_accounts()
        this.load_max_aid()
    }

    on_data(option,data)//用于用户登出时删除online数据
    {
        switch(option)
        {
            case 'log_out':
                delete this.online[data]
                console.log(`在线玩家账号：${Object.keys(this.online)}`)
                break
            default:
                break
        }
    }

    //获取id
    async load_max_aid()
    {
        let res =await this.mongo.find("max_id", {_id:"get_aid"})

        this.cur_max_aid = res[0].aid
    }

    //加载account
    async load_accounts()
    {

        let res = await this.mongo.load("accounts")
        for (let i = 0; i < res.length; i++)
        {
            let _id = res[i]._id
            this.all_accounts[_id] = res[i]
        }
        
        console.log(this.all_accounts)
        console.log('accounts 加载完毕!')
    }           

    log_in(account_id_pwd,sock)
    {
        let [aid, pwd] = account_id_pwd
        
        aid =Number.parseInt(aid)

        let account = this.all_accounts[aid]
        if (account && account['pwd'] == pwd)
        {
            let player = account.player

            let account_data = {'id':aid,'pwd':pwd,'player':player}
            account = new Account(account_data,this.mongo)

            //查看是否重复下线，有则踢下线
            if(this.online.aid)
            {
                let sock = this.online.aid
                this.send_sock(sock,'log_in',0,'重复登陆，被迫下线')
                sock.account.log_out()
                //内存中删除
                delete this.online.aid
            }

            //sock和account绑定关系
            sock.account = account
            account.set_sock(sock)
            account.set_handler(this.on_data.bind(this))

            //新登陆用户加载进内存
            this.online[aid] = sock
            console.log(`在线账号:${Object.keys(this.online)}`)

            console.log(`${sock.remoteAddress}:${sock.remotePort} 登陆成功`)

            //发包 
            this.send_sock(sock,'log_in', 1,'登陆成功')
        }
    }
    

   //注册
   async create_account(register_data, sock)
   {
       //整理数据

       let aid = this.cur_max_aid
       let pwd = register_data[0]

       let account_data = { '_id': aid, 'pwd': pwd, 'player': null }

       try
       {
           // 创建account,保存进数据库
           await this.mongo.insert('accounts', account_data)

           //更新num数字
           await this.mongo.update('max_id', { _id: "get_aid" }, { $inc: { aid: 1 }})
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
       this.send_sock(sock,'register', 1, account_data)
   }

   //发包
   send_sock(sock,...args)
    {
        this.send_rec_obj.set(args[0], args[1], args[2])
        let send = this.send_rec_obj.get()
        sock.write(JSON.stringify(send))
    }
}

module.exports = Account_manager