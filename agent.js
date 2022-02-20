// Подключение модуля разбора сообщений от сервера
const Msg = require('./msg')
// Подключение модуля расчета координат
const coord = require('./coord')

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
    }

    msgGot(msg) { // Получение сообщения
        let data = msg.toString('utf8') // Приведение к строке
        this.processMsg(data) // Разбор сообщения
        this.sendCmd() // Отправка команды
    }

    setSocket(socket) { // Настройка сокета
        this.socket = socket
    }

    socketSend(cmd, value) { // Отправка команды
        this.socket.sendMsg(`(${cmd} ${value})`)
    }

    processMsg(msg) { // Обработка сообщения
        let data = Msg.parseMsg(msg) // Разбор сообщения
        if (!data) throw new Error("Parse error\n" + msg)
        // Первое (hear) - начало игры
        if (data.cmd === "hear") this.analyzeHear(data.p)
        if (data.cmd === "init") this.initAgent(data.p) // Инициализация
        if (data.cmd === "see") this.analyzeSee(data.msg, data.cmd, data.p) // Обработка
    }

    initAgent(p) {
        if (p[0] === "r") this.position = "r" // Правая половина поля
        if (p[1]) this.id = p[1] // id игрока
    }

    analyzeHear(p) {
        if (p[2] === "play_on") {
            this.playOn = true
        }
        this.run = true
    }

    analyzeSee(msg, cmd, p) { // Анализ сообщения
        if (!this.run) return

        let xy = coord.calculateCoord(p) // Расчет координат игрока
        if (xy.flags) {
            this.xCoord = xy.flags.x
            this.yCoord = xy.flags.y
        }
        if (xy.players) {
            this.xCoordEnemy = xy.players.x
            this.yCoordEnemy = xy.players.y
        } else {
            this.xCoordEnemy = null
            this.yCoordEnemy = null
        }
        if (this.xCoord && this.yCoord) {
            console.log("Координаты игрока:", this.xCoord.toFixed(2), this.yCoord.toFixed(2)) // Вывод расчитанных координат
        } else {
            console.log("Невозможно определить координаты игрока")
        }
        if (this.xCoordEnemy && this.yCoordEnemy) {
            console.log("Координаты противника:", this.xCoordEnemy.toFixed(2), this.yCoordEnemy.toFixed(2))
        }

    }

    sendCmd() {
        if (this.run) { // Игра начата
            if (this.act) { // Есть команда от игрока
                if (this.act.n === "kick") // Пнуть мяч
                    this.socketSend(this.act.n, this.act.v + " 0")
                else // Движение и поворот
                    this.socketSend(this.act.n, this.act.v)
            }
            if (this.playOn) {
                this.act = {n: "turn", v: 20}
                this.socketSend(this.act.n, this.act.v)
            }
            this.act = null // Сброс команды
        }
    }
}

module.exports = Agent // Экспорт игрока