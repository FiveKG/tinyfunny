class Player{
    constructor([id,name,sex,pwd])
    {
        this.id = id
        this.name = name
        this.sex = sex
        this.pwd = pwd
    }
    update_name(new_name)
    {
        this.name = new_name
    }
}
module.exports = Player
