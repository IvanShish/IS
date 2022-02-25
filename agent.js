// Подключение модуля разбора сообщений от сервера
const Msg = require('./msg')
// Подключение модуля расчета координат
const coord = require('./coord')
const Controller = require("./controller")

class Agent {
    constructor() {
        this.position = "l" // По умолчанию - левая половина поля
        this.run = false // Игра начата
        this.playOn = false
        this.act = null // Действия
        this.xCoord = null
        this.yCoord = null
        this.xCoordEnemy = null
        this.yCoordEnemy = null
        this.id = null
        this.v = null // Скорость вращения
        this.controller = new Controller()
        this.controller.setAgent(this)
    }

    msgGot(msg) { // Получение сообщения
        let data = msg.toString('utf8') // Приведение к строке
        this.controller.processMsg(data) // Разбор сообщения
        this.sendCmd() // Отправка команды
    }

    setSocket(socket) { // Настройка сокета
        this.socket = socket
    }

    setV(v) {
        this.v = v
    }

    socketSend(cmd, value) { // Отправка команды
        this.socket.sendMsg(`(${cmd} ${value})`)
    }

    sendCmd() {
        if (this.run) { // Игра начата
            if (this.act) { // Есть команда от игрока
                if (this.act.n === "kick") // Пнуть мяч
                    this.socketSend(this.act.n, this.act.v + " 0")
                else // Движение и поворот
                    this.socketSend(this.act.n, this.act.v)
            }
            // if (this.playOn) {
            //     this.act = {n: "turn", v: this.v}
            //     this.socketSend(this.act.n, this.act.v)
            //     if (this.xCoord && this.yCoord) {
            //         console.log("Координаты игрока:", this.xCoord.toFixed(2), this.yCoord.toFixed(2)) // Вывод расчитанных координат
            //     } else {
            //         console.log("Невозможно определить координаты игрока")
            //     }
            //     if (this.xCoordEnemy && this.yCoordEnemy) {
            //         console.log("Координаты противника:", this.xCoordEnemy.toFixed(2), this.yCoordEnemy.toFixed(2))
            //     }
            // }
            this.act = null // Сброс команды
        }
    }
}

module.exports = Agent // Экспорт игрока