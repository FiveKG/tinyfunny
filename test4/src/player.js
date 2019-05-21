let Send_rec_format = require('./send_rec_format')

class Player
{
    constructor({ id, name, sex },mongo=null)
    {
        this.id = id
        this.name = name
        this.sex = sex
        this.mongo = mongo
        this.send_rec_format = new Send_rec_format()

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
        
        that.send_sock("update_name",0,'名字不能为空')
    }

    //@param  pid<array>
    async find_player(pid)
    {
        let that = this
        pid = parseInt(pid[0])

        try
        {
            let res = await this.mongo.find_one('players',{_id:pid})
            //发包
            that.send_sock("find_player",1,res)
            console.log(`${that.sock.remoteAddress}:${that.sock.remotePort} 查找成功 `)
        }
        catch(err)
        {
            console.log(err)
        }

        
        
    }

    //@param player<Player>
    async delete_player()
    {
        //删除自己的player
        let that = this
        
        try
        {
            await this.mongo.delete('players',{_id:this.id},)

            //发包
            that.send_sock("delete_player",1,'删除成功')
            console.log(`${that.sock.remoteAddress}:${that.sock.remotePort} 删除成功 `)
        }
        catch(err)
        {
            console.log(err)
        }    
        //退出登陆
        that.log_out() 
    }

    //@param player<Player>
    async log_out()
    {
        this.send_sock('log_out', 1, null)
        console.log(`${this.sock.remoteAddress}:${this.sock.remotePort} 登出成功 `)
        delete this
    }



    send_sock(...args)
    {
        this.send_rec_format.set(args[0], args[1], args[2])
        let send = this.send_rec_format.get()
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