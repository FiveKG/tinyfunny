let Send_rec_format = require('./send_rec_format')
let format = require('./date_format')
let Mongo = require('./mongo')
class Mail
{
    constructor(my_pid,mongo)
    {  
        this.cur_max_id =null
        this.pid = my_pid
        this.receiver = null
        this.send_time = null
        this.type= 'commom'
        this.checked = 1
        this.content = null
        this.extra_type = null
        this.extra_data = null

        this.all_mail_head = null
        this.unread_mail_head = null
        this.readed_mail_head = null

        this.mongo = mongo
        this.sock = null

        this.send_rec_obj = new Send_rec_format()

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
        this.cur_max_id = res[0].mid+1
    }

    set_sock(sock)
    {
        this.sock = sock
    }

    //发送邮件，保存进mongo
    async send_mail(send_data)
    {
        console.log(send_data)
        // this.receiver = send_data[0]
        // this.content = send_data[1]
        // this.extra_type = send_data[2]
        // this.extra_data = send_data[3]
        // try
        // {
        //     await this.get_cur_max_mid()//_id
        //     this.set_mail_head(receiver_id)
        //     this.set_maik_body(content,extra_type,extra_data)
        //     //更新num数字
        //     await this.mongo.update('max_id', { _id: "get_mid" }, { $set: { mid: this.cur_max_id }})
        // }
        // catch(err)
        // {
        //     console.log(err)
        // }
    }

    set_mail_head(receiver_id)
    {
        this.receiver = receiver_id
        this.send_time = new Date().Format('yyyy-MM-dd hh:mm:ss');
        let head_bd = this.as_head_db()
        this.mongo.insert("mail_head",head_bd)
    }
    set_maik_body(content,extra_type,extra_data)
    {
        this.content = content
        this.extra_type =extra_type
        this.extra_data = extra_data
        let body_bd = this.as_body_db()
        this.mongo.insert("mail_body",body_bd)
    }

    //收取邮件,从mongo拉取mail_head信息
    async load_my_mails()
    {
        try
        {
            let mail_ids = await this.get_mail_ids()
            let head_array = []
            for(let i=0;i<mail_ids.length;i++)
            {
                let temp = {}
                temp._id = mail_ids[i]
                head_array.push(temp)
            }
            
            this.unread_mail_head = await this.mongo.find("mail_head",{checked:1,$or:head_array})//checked=1为未读信息
            this.readed_mail_head = await this.mongo.find("mail_head",{checked:0,$or:head_array})//checked=1为已读信息
            this.all_mail_head = await this.mongo.find("mail_head",{$or:head_array})
        }
        catch(err)
        {
            console.log(err)
        }

    }

    //外部调用查看邮箱,option<null?check_unread?check_readed>,返回promise
    async check_mail(option = null)
    {
        await this.load_my_mails()
        console.log(option[0])
        let send_data =null
        switch(option[0])
        {
            case 'unread':
                send_data= this.unread_mail_head
                break
            case 'readed':
                send_data= this.readed_mail_head
                break
            default:
                send_data= this.all_mail_head
                break
        }
        this.send_sock('check_mail',1,send_data)
    }   

    async show_mail_detail(mid)
    {
        mid = Number.parseInt(mid)
        let ret = await this.mongo.find_one('mail_body',{_id:mid})
        return ret
    }


    async delete_mail(mail_id)
    {
        mail_id = Number.parseInt(mail_id)
        this.mongo.delete('mail_head',{_id:mail_id})
        this.mongo.delete('mail_body',{_id:mail_id})
    }

    log_out()
    {
        this.sock.mail = null
        this.set_sock(null)
    }
    send_sock(...args)
    {
        this.send_rec_obj.set(args[0], args[1], args[2])
        let send = this.send_rec_obj.get()
        this.sock.write(JSON.stringify(send))
    }

    as_head_db()
    {
        return{
            _id:this.cur_max_id,
            receiver:this.receiver,
            sender:this.pid,
            send_time:this.send_time,
            type:this.type,
            checked:this.checked,
            mail_body:this.cur_max_id
        }
    }
    
    as_body_db()
    {
        return{
            _id:this.cur_max_id,
            content:this.content,
            extra_type:this.extra_type,
            extra_data:this.extra_data
        }
    }
}

module.exports = Mail

// let mail = new Mail(1001)
// mail.send_mail(1002,'hello')

// mail.check_mail('check_unread').then(function(res)
// {
//     console.log(res)
// })

// mail.show_mial_detail(1).then(function(res)
// {
//     console.log(res)
// })

// mail.send_mail(1002,"hahaha")
// mail.send_mail(1002,"aaaa")

// mail.delete_mail(3)
