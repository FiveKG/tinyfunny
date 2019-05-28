let Send_rec_format = require('./send_rec_format')
class Account
{       
    constructor({id,pwd,player},mongo=null)
    {
        this.id = id
        this.pwd = pwd
        this.player = player
        this.send_rec_obj = new Send_rec_format()
        this.mongo = mongo
        this.account_handler = null
        this.sock = null
    }

    set_sock(sock)
    {
        this.sock = sock
    }


    async log_out()
    {
        //退出online
        this.account_handler('log_out',this.id)

        this.send_sock('log_out',1,'登出成功')
        console.log(`${this.sock.remoteAddress}:${this.sock.remotePort} 登出成功 `)
        
        this.sock.account = null
        this.set_sock(null)
    }

    
    async update_account(operate)
    {
        switch(operate)
        {
            case 'delete_player':  
                this.player = null
                break
            case 'create_player':
                this.player = this.id
                break
            default:
                break
        }
        let db = this.as_db()
        try
        {
            await this.mongo.update('accounts',{ _id: this.id }, { $set: db })
        }
        catch(err)
        {
            console.log(err)
        }
    }

  
     //序列化
    as_db()
    {
        return {
            pwd: this.pwd,
            player: this.player,
        }
    }

    send_sock(...args)
    {
        this.send_rec_obj.set(args[0], args[1], args[2])
        let send = this.send_rec_obj.get()
        this.sock.write(JSON.stringify(send))
    }

    set_handler(handler)
    {
        this.account_handler = handler
    }

}

module.exports = Account