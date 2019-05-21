class Account
{       
    constructor({aid,pwd,player},mongo=null)
    {
        this.aid = aid
        this.pwd = pwd
        this.player = player

        this.mongo = mongo
    }

}

module.exports = Account