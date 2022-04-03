// Подключение модуля разбора сообщений от сервера
const Msg = require('./msg')
// Подключение модуля расчета координат
const coord = require('./coord')
const Controller = require("./controller")

class Agent {
    constructor() {
        this.position = "l"
        this.teamName = null
        this.run = false // Игра начата
        this.act = null // Действия
        this.xCoord = null
        this.yCoord = null
        this.controller = new Controller()
        this.controller.setAgent(this)
        this.audioGo = false
        this.goalScored = false
        this.number = null
    }

    msgGot(msg) { // Получение сообщения
        let data = msg.toString('utf8') // Приведение к строке
        this.controller.processMsg(data) // Разбор сообщения
        this.sendCmd() // Отправка команды
    }

    setSocket(socket) { // Настройка сокета
        this.socket = socket
    }

    socketSend(cmd, value) { // Отправка команды
        this.socket.sendMsg(`(${cmd} ${value})`)
    }

    sendCmd() {
        if (this.run || this.act && this.act.n === 'move') {
            if (this.act) {
                this.socketSend(this.act.n, this.act.v)
            }
            this.act = null
        }
    }
}

module.exports = Agent // Экспорт игрока