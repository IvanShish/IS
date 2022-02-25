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
            this.agent.run = true
        } else if (p[2].startsWith("goal")) {
            this.agent.run = false
        }
    }

    analyzeSee(msg, cmd, p) { // Анализ сообщения
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

        const objects = this.getAllObjects(p)
        const flags = objects.f
        if (flags.length >= 3) {
            let coords = coord.parseCoord(flags)
            this.analyzeAction(coords.flags)
        }
    }

    analyzeAction(objects) {
        const action = this.actions[this.currAction]
        if (!action) return

        // objects.sort((a, b) => a.d - b.d)
        if (action.act === "flag") {
            const fl = objects.find(e => e.flagName === action.fl)

            if (!fl) {
                // Искомый флаг не виден, значит игроку следует повернуться в поисках
                // искомого флага
                this.agent.act = {
                    n: 'turn',
                    v: 30
                }
                return
            }

            if (Math.abs(fl.a) > 30) {  // TODO: какое условие?
                // Искомый флаг виден и находится далеко от игрока, тогда необходимо
                // повернуться в направлении флага
                this.agent.act = {
                    n: 'turn',
                    v: fl.a
                }
                console.log('turn: ', fl.a)
            } else {
                // предлагается переходить к следующему действию, если расстояние до
                // флага в маршруте движения меньше 3
                if (fl.d < 3) {
                    this.currAction++
                    console.log('nextaction')
                    return
                }
                // флаг находится близко = расстояние меньше 6, но больше 3
                console.log('run')
                this.agent.act = {
                    n: 'dash',
                    v: fl.d < 6  ? 50 : 100
                }
            }
        } else if (action.act === "kick") {

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
