let Send_rec_format = require('./send_rec_format')
let format = require('./date_format')

class Mail
{
    constructor(pid,mongo)
    {  
        this.cur_max_id =null
        this.pid = pid

        this.type= 'commom'

        this.all_mail_head = null
        this.unread_mail_head = null
        this.readed_mail_head = null
        this.sended_mail_head = null

        this.mongo = mongo
        this.sock = null

        this.send_rec_obj = new Send_rec_format()
        this.mail_handler = null
        this.load_my_mails()

    }

    async get_mail_ids()
    {   
        let res= await this.mongo.find_one("players",{_id:this.pid})
        return res.mail_head
    }

    async get_cur_max_mid()
    {
        let res = await this.mongo.find('max_id',{_id:"get_mid"})
        this.cur_max_id = res[0].mid
    }

    set_sock(sock)
    {
        this.sock = sock
    }

    //发送邮件，保存进mongo
    async send_mail(send_data)
    {
        let receiver = Number.parseInt(send_data[0])
        let content = send_data[1]
        let extra_type = send_data[2]
        let extra_data = send_data[3]

        try
        {
            await this.get_cur_max_mid()//_id

            let head_bd = this.as_head_db(receiver)
            this.mongo.insert("mail_head",head_bd)

            let body_bd = this.as_body_db(content,extra_type,extra_data)
            this.mongo.insert("mail_body",body_bd)

            //更新player的mail_head
            this.mongo.update('players',{_id:this.pid},{$push:{mail_head:this.cur_max_id}})
            this.mongo.update('players',{_id:receiver},{$push:{mail_head:this.cur_max_id}})
            //更新num数字
            await this.mongo.update('max_id', { _id: "get_mid" }, { $inc: { mid:1 }})
            this.send_sock('send_mail',1,'发送成功')
        }
        catch(err)
        {
            console.log(err)
        }

        //发送邮件给对方
        this.mail_handler('send_mail',this.as_head_db(receiver))
    }


    //收取邮件,从mongo拉取mail_head信息
    async load_my_mails()
    {
        try
        {
            let mail_ids = await this.get_mail_ids()
            let mail_array = []
            for(let i=0;i<mail_ids.length;i++)
            {
                let temp = {}
                temp._id = mail_ids[i]
                mail_array.push(temp)
            }

            if(mail_array.length==0)//空邮箱
            {
                this.send_sock('init',1,`邮箱为空`)
                return
            }
            this.unread_mail_head = await this.mongo.find("mail_head",{checked:1,receiver:this.pid,$or:mail_array},{projection:{index:0}})//未读信息
            this.readed_mail_head = await this.mongo.find("mail_head",{checked:0,receiver:this.pid,$or:mail_array},{projection:{index:0}})//已读信息
            this.sended_mail_head = await this.mongo.find("mail_head",{sender:this.pid,$or:mail_array},{projection:{index:0}})//已发送信息
            this.all_mail_head = await this.mongo.find("mail_head",{$or:mail_array},{projection:{index:0}})

            let unread_mail_total = this.unread_mail_head.length
            if(unread_mail_total)
            {
                this.send_sock('init',1,`你有${unread_mail_total}封未读邮件`)
            }
        }
        catch(err)
        {
            console.log(err)
        }

    }

    //外部调用查看邮箱,option<null?check_unread?check_readed>
    async check_mail(option = null)
    {
        await this.load_my_mails()
        let send_data =null
        switch(option[0])
        {
            case 'unread':
                send_data= this.unread_mail_head
                break
            case 'readed':
                send_data= this.readed_mail_head
                break
            case 'send':
                send_data = this.sended_mail_head
                break
            default:
                send_data= this.all_mail_head
                break
        }
        this.send_sock('check_mail',1,send_data)
    }   

    async show_mail_detail(mid)
    {
        mid = Number.parseInt(mid[0])

        let ret = await this.mongo.find_one('mail_body',{_id:mid},{projection:{index:0}})
        this.mongo.update('mail_head',{_id:mid},{$set:{checked:0}})//查看后把checked改为0

        this.send_sock('show_mail_detail',1,ret)
    }


    delete_one_mail(mail_id)
    {
        mail_id = Number.parseInt(mail_id[0])
        try
        {  
            //删除player里的相关的mail_head 
            this.mongo.update('players',{_id:this.pid},{$pull:{mail_head:mail_id}})

            //mail_head和mail_body的索引值减1
            this.mongo.update('mail_head',{_id:mail_id},{$inc:{index:-1}})
            this.mongo.update('mail_body',{_id:mail_id},{$inc:{index:-1}})

            //删除mail_head和mail_body的索引值为0的数据
            this.mongo.delete_many('mail_head',{index:0})
            this.mongo.delete_many('mail_body',{index:0})
            this.send_sock('delete_mail',1,'邮件删除成功')
        }
        catch(err)
        {
            console.log(err)
            this.send_sock('delete_mail',0,'邮件删除失败')
        }
    }

    async delete_all_mails()
    {
        

        let mail_ids = await this.get_mail_ids()
        let mail_array = []
        for(let i=0;i<mail_ids.length;i++)
        {
            let temp = {}
            temp._id = mail_ids[i]
            mail_array.push(temp)
        }

        if(mail_array.length==0)//空邮箱
        {
            return
        }
        //mail_head和mail_body的索引值减1
        this.mongo.update_many('mail_head',{$or:mail_array},{$inc:{index:-1}})
        this.mongo.update_many('mail_body',{$or:mail_array},{$inc:{index:-1}})

        //删除mail_head和mail_body的索引值为0的数据
        this.mongo.delete_many('mail_head',{index:0})
        this.mongo.delete_many('mail_body',{index:0})
        this.send_sock('delete_mail',1,'邮件清空成功')
    }


    send_sock(...args)
    {
        this.send_rec_obj.set(args[0], args[1], args[2])
        let send = this.send_rec_obj.get()
        this.sock.write(JSON.stringify(send))
    }

    as_head_db(receiver)
    {
        return{
            _id:this.cur_max_id,//mid
            receiver:receiver,//收件者
            sender:this.pid,//发件者为自己
            send_time:new Date().Format('yyyy-MM-dd hh:mm:ss'),
            type:this.type,//类型：commom/offcial
            checked:1,//是否查看过  
            index:2,//被引用数
            mail_body:this.cur_max_id//mid
        }
    }
    
    as_body_db(content,extra_type=null,extra_data=null)
    {
        return{
            _id:this.cur_max_id,
            content:content,//内容
            extra_type:extra_type,//附件类型
            extra_data:extra_data,
            index:2
        }
    }

    set_handler(handler)
    {
        this.mail_handler = handler
    }
}

module.exports = Mail

