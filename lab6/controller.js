const Msg = require("./msg")

const CTRL_LOW = require("./gCtrlLow")
const CTRL_MIDDLE = require("./gCtrlMiddle")
const CTRL_HIGHT = require("./gCtrlHigh")

class Controller {
    constructor() {
        this.agent = null
        this.CTRL = null
        this.isSc
    }

    setAgent(agent) {
        this.agent = agent
    }

    setIsSc(isSc) {
        this.isSc = isSc
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
        if (this.agent.controller.isSc) {
            this.CTRL = null
        }
        else this.CTRL = CTRL_LOW
    }

    analyzeHear(p) {
        if (p[2] === "play_on") {
            this.agent.run = true
            this.agent.goalScored = false
            return
        } else if (p[2].startsWith("goalie_catch_ball")) {
            console.log("ball caught")
        } else if (p[2].startsWith("goal_l") || p[2].startsWith("goal_r")) {
            console.log("goal")
            this.agent.audioGo = false
            this.agent.goalScored = true
        } else if (p[2] === "\"go\"") {
            console.log("go")
            this.agent.audioGo = true
            return
        }
        this.agent.run = false
    }

    analyzeSee(msg, cmd, p) { // Анализ сообщения
        if (!this.agent.run) return
        // if (this.agent.position === "r") return
        this.agent.act = this.CTRL.execute(p, [CTRL_MIDDLE, CTRL_HIGHT], this.agent.teamName, this.agent.position)
        if (this.agent.act) {
            console.log(this.agent.act)
        }
    }
}

module.exports = Controller

// look around fix
// 