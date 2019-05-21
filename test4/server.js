let Players_manager = require('./src/players_manager')
let Network = require('./src/network')
let MongoDB = require('./src/mongo')
let Account_db = require('./src/account_db')
let Player_db = require('./src/player_db')

class Server
{
    constructor()
    {
        this.mongo = new MongoDB()
        this.network = new Network()
        this.players_manager = new Players_manager(this)
    }

    listen_connect()
    {
        this.network.listen_connect()
    }
}

let server = new Server()
server.listen_connect()
