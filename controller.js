const Msg = require("./msg")
const Manager = require("./manager")
const ManagerTA = require("./managerTA")
const passDT = require("./decisionTreePass")
const scoringGoalDT = require("./scoringGoalDecisionTree")
const goalieTA = require("./goalieTA")
// const coord = require("./coord")

class Controller {
    constructor() {
        // this.manager = new Manager(this)
        this.manager = new ManagerTA(this)
        this.agent = null
        this.isSc = false
        this.DT = null
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
        if (this.isSc) this.DT = scoringGoalDT
        else this.DT = passDT
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
        // if (!this.agent.run) return
        if (this.agent.position === "r") return
        this.agent.act = this.manager.getAction(this.DT, p, this.agent.teamName)
    }
}

module.exports = Controller
