class Account
{       
    constructor({id,pwd,player},mongo=null)
    {
        this.id = id
        this.pwd = pwd
        this.player = player

        this.mongo = mongo

        this.sock = null
    }

    set_sock(sock)
    {
        this.sock = sock
    }

    //@param account<Account>
    async log_out()
    {
        delete this
    }

    async delete_player()
    {
        this.player = null

        let db = this.as_db()
        try
        {
            let res = await this.mongo.update('accounts',{ _id: this.id }, { $set: db })
            console.log(res)
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

}

module.exports = Account