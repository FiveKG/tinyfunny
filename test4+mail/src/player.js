let Send_rec_format = require('./send_rec_format')

class Player
{
    constructor({ id, name, sex },mongo=null)
    {
        this.id = id
        this.name = name
        this.sex = sex
        this.mongo = mongo
        this.send_rec_obj = new Send_rec_format()

        //登录之后关联的连接
        this.sock = null

    }

    set_sock(sock)
    {
        this.sock = sock
    }


    //@param new_name<array>
    async update_name(new_name)
    {
        let that = this
        this.name = new_name[0]
        if(this.name)
        {
            let db = this.as_db()
            try
            {
                await this.mongo.update('players',{ _id: this.id }, { $set: db })

                //发包
                that.send_sock("update_name",1,'更名成功')
                console.log(`${that.sock.remoteAddress}:${that.sock.remotePort} 更名成功 `)
            }
            catch(err)
            {
                console.log(err)
            }
        }
        else
        {
            that.send_sock("update_name",0,'名字不能为空')

        }
        
    }

    //@param  pid<array>
    async find_player(pid)
    {
        let that = this
        pid = Number.parseInt(pid[0])

        try
        {
            let res = await this.mongo.find_one('players',{_id:pid},{projection:{mail_head:0}})//排除mail_head

            //发包
            that.send_sock("find_player",1,res)
            console.log(`${that.sock.remoteAddress}:${that.sock.remotePort} 查找成功 `)
        }
        catch(err)
        {
            console.log(err)
        }

    }

    log_out()
    {
        this.sock.player = null
        this.set_sock(null)

    }

    //@param player<Player>
    async delete_player()
    {
        try
        {
            await this.mongo.delete('players',{_id:this.id},)
        }
        catch(err)
        {
            console.log(err)
            return 
        }    

        //发包
        this.send_sock("delete_player",1,'删除成功')
        console.log(`${this.sock.remoteAddress}:${this.sock.remotePort} 删除成功 `)

        this.log_out()
    }

    send_sock(...args)
    {
        this.send_rec_obj.set(args[0], args[1], args[2])
        let send = this.send_rec_obj.get()
        this.sock.write(JSON.stringify(send))
    }

    //序列化
    as_db()
    {
        return {
            name: this.name,
            sex: this.sex,
        }
    }
}
module.exports = Player