const Msg = require("./msg");
const coord = require("./coord");
const {Flags} = require("./coord");

class Controller {
    constructor() {
        this.actions = [{act: "flag", fl: "frb"}, {act: "flag", fl: "gl"},
            {act: "flag", fl: "fc"}, {act: "kick", fl: "b", goal: "gr"}]
        this.currAction = 0
        this.agent = null
    }

    setAgent(agent) {
        this.agent = agent
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
        if (p[0] === "r") this.agent.position = "r" // Правая половина поля
        if (p[1]) this.agent.id = p[1] // id игрока
    }

    analyzeHear(p) {
        if (p[2] === "play_on") {
            this.agent.playOn = true
        } else if (p[2].startsWith("goal")) {

        }
        this.agent.run = true
    }

    analyzeSee(msg, cmd, p) { // Анализ сообщения
        const objects = this.getAllObjects(p)
        const flags = objects.f.sort((a, b) => a.d - b.d)
        if (flags.length >= 3) {
            let coords = coord.calculateCoord(flags)
            const act = this.actions[this.currAction++].act
        }
        if (!this.agent.run) return

        let xy = coord.calculateCoord(p) // Расчет координат игрока
        if (xy.flags) {
            this.agent.xCoord = xy.flags.x
            this.agent.yCoord = xy.flags.y
        }
        if (xy.players) {
            this.agent.xCoordEnemy = xy.players.x
            this.agent.yCoordEnemy = xy.players.y
        } else {
            this.agent.xCoordEnemy = null
            this.agent.yCoordEnemy = null
        }

    }

    getAllObjects(p) {
        const objects = {
            f: [],
            pl: [],
            b: null
        }

        for (let value of p) {
            if (!value.cmd) continue

            let object = value.cmd.p[0]
            if (object === 'f' || object === 'g') {   // Ворота или флаг
                let flagName = ''
                for (let i of value.cmd.p) {
                    flagName += i
                }

                const coords = Flags[flagName]
                if (coords) {
                    objects.f.push(value)
                }
            } else if (object === 'p') {    // Игрок
                console.log('p: ', value.p)
            } else if (object === 'b') {    // Мяч
                console.log('b: ', value.p)
            }
        }

        return objects
    }
}

module.exports = Controller
