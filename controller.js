const Msg = require("./msg");
const coord = require("./coord");

class Controller {
    constructor() {
        this.actions = [{act: "flag", fl: "frb"}, {act: "flag", fl: "gl"},
            {act: "flag", fl: "fc"}, {act: "kick", fl: "b", goal: "gr"}]
        // this.actions = [{act: "kick", fl: "b", goal: "gr"}]
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
            this.currAction = 0
        }
    }

    analyzeSee(msg, cmd, p) { // Анализ сообщения
        if (!this.agent.run) return

        let xy = coord.calculatePlayerCoord(p) // Расчет координат игрока
        if (xy && xy.x && xy.y) {
            this.agent.xCoord = xy.x
            this.agent.yCoord = xy.y
        }
        else {
            this.agent.xCoord = null
            this.agent.yCoord = null
        }

        let coords = coord.parseCoord(p)
        this.analyzeAction(coords)
    }

    analyzeAction(objects) {
        const action = this.actions[this.currAction]
        if (!action) return

        // objects.sort((a, b) => a.d - b.d)
        if (action.act === "flag") {
            const fl = objects.flags.find(e => e.flagName === action.fl)

            if (!fl) {
                // Искомый флаг не виден, значит игроку следует повернуться в поисках
                // искомого флага
                this.agent.act = {
                    n: 'turn',
                    v: 30
                }
                return
            }

            if (Math.abs(fl.a) > 5) {
                // Искомый флаг виден и находится далеко от игрока, тогда необходимо
                // повернуться в направлении флага
                this.agent.act = {
                    n: 'turn',
                    v: fl.a
                }
            } else {
                // предлагается переходить к следующему действию, если расстояние до
                // флага в маршруте движения меньше 3
                if (fl.d < 3) {
                    this.currAction++
                    return
                }
                // флаг находится близко = расстояние меньше 6, но больше 3
                this.agent.act = {
                    n: 'dash',
                    v: fl.d < 6  ? 50 : 100
                }
            }
        } else if (action.act === "kick") {
            const ball = objects.obj.find(e => e.name === 'b')

            if (!ball) {
                // Искомый мяча не виден, значит игроку следует повернуться в поисках
                // искомого мяча
                this.agent.act = {
                    n: 'turn',
                    v: 30
                }
                return
            }

            if (Math.abs(ball.a) > 5) {
                // Искомый мяч виден и находится далеко от игрока, тогда необходимо
                // повернуться в направлении мяча
                this.agent.act = {
                    n: 'turn',
                    v: ball.a
                }
            } else {
                // предлагается переходить к следующему действию, если расстояние до
                // мяча в маршруте движения меньше 0.5
                if (ball.d < 0.5) {
                    const gl = objects.flags.find(e => e.flagName === action.goal) // Проверяем видны ли ворота
                    if (!gl) {
                        // Искомые ворота не видны, значит игроку следует немного пнуть мяч в поисках
                        // ворот
                        this.agent.act = {
                            n: 'kick',
                            v: "10 45"
                        }
                    }
                    else {
                        // Искомые ворота видны, значит игроку следует пнуть мяч в сторону ворот
                        this.agent.act = {
                            n: 'kick',
                            v: "100 " + gl.a 
                        }
                    }
                }
                else {
                    // мяч находится близко = расстояние меньше 4, но больше 0.5
                    this.agent.act = {
                        n: 'dash',
                        v: ball.d < 4  ? 50 : 100
                    }
                }
            }
        }
    }
}

module.exports = Controller
