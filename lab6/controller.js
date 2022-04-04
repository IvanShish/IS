const Msg = require("./msg")

const CTRL_LOW = require("./gCtrlLow")
const CTRL_MIDDLE = require("./gCtrlMiddle")
const CTRL_HIGHT = require("./gCtrlHigh")

const P_CTRL_LOW = require("./pCtrlLow")
const P_CTRL_GO_TO_BALL = require("./pCtrlGoToBall")
const P_CTRL_GO_TO_ZONE = require("./pCtrlGoToZone")
const P_CTRL_KICK_BALL = require("./pCtrlKickBall")
const P_CTRL_MOVE_IN_ZONE = require("./pCtrlMoveInZone")

class Controller {
    constructor() {
        this.agent = null
        this.CTRL = null
        this.CTRLS = null
        this.isGk = null
        this.zoneCoords = {
            1: {xc: -35, yc: -27.075, xl: -52.5, yd: -20.15, xr: -17.5, yu: -34},
            2: {xc: -26.75, yc: -10.075, xl: -36, yd: 0, xr: -17.5, yu: -20.15},
            3: {xc: -26.75, yc: 10.075, xl: -36, yd: 20.15, xr: -17.5, yu: 0},
            4: {xc: -35, yc: 27.075, xl: -52.5, yd: 34, xr: -17.5, yu: 20.15},

            5: {xc: 0, yc: -22, xl: -17.5, yd: -10, xr: 17.5, yu: -34},
            6: {xc: 0, yc: 0, xl: -17.5, yd: 10, xr: 17.5, yu: -10},
            7: {xc: 0, yc: 22, xl: -17.5, yd: 34, xr: 17.5, yu: 10},

            8: {xc: 35, yc: -22, xl: 17.5, yd: -10, xr: 52.5, yu: -34},
            9: {xc: 35, yc: 0, xl: 17.5, yd: 10, xr: 52.5, yu: -10},
            10: {xc: 35, yc: 22, xl: 17.5, yd: 34, xr: 52.5, yu: 10}
        }
    }

    setAgent(agent) {
        this.agent = agent
    }

    setIsGk(isGk) {
        this.isGk = isGk
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
        if (this.agent.position === "l") {
            this.zoneCoords = {
                1: {xc: -35, yc: -27.075, xl: -52.5, yd: -20.15, xr: -17.5, yu: -34},
                2: {xc: -26.75, yc: -10.075, xl: -36, yd: 0, xr: -17.5, yu: -20.15},
                3: {xc: -26.75, yc: 10.075, xl: -36, yd: 20.15, xr: -17.5, yu: 0},
                4: {xc: -35, yc: 27.075, xl: -52.5, yd: 34, xr: -17.5, yu: 20.15},

                5: {xc: 0, yc: -22, xl: -17.5, yd: -10, xr: 17.5, yu: -34},
                6: {xc: 0, yc: 0, xl: -17.5, yd: 10, xr: 17.5, yu: -10},
                7: {xc: 0, yc: 22, xl: -17.5, yd: 34, xr: 17.5, yu: 10},

                8: {xc: 35, yc: -22, xl: 17.5, yd: -10, xr: 52.5, yu: -34},
                9: {xc: 35, yc: 0, xl: 17.5, yd: 10, xr: 52.5, yu: -10},
                10: {xc: 35, yc: 22, xl: 17.5, yd: 34, xr: 52.5, yu: 10}
            }
        }
        else {
            this.zoneCoords = {
                1: {xc: 35, yc: -27.075, xl: 52.5, yd: -20.15, xr: 17.5, yu: -34},
                2: {xc: 26.75, yc: -10.075, xl: 36, yd: 0, xr: 17.5, yu: -20.15},
                3: {xc: 26.75, yc: 10.075, xl: 36, yd: 20.15, xr: 17.5, yu: 0},
                4: {xc: 35, yc: 27.075, xl: 52.5, yd: 34, xr: 17.5, yu: 20.15},

                5: {xc: 0, yc: -22, xl: 17.5, yd: -10, xr: -17.5, yu: -34},
                6: {xc: 0, yc: 0, xl: 17.5, yd: 10, xr: -17.5, yu: -10},
                7: {xc: 0, yc: 22, xl: 17.5, yd: 34, xr: -17.5, yu: 10},

                8: {xc: -35, yc: -22, xl: -17.5, yd: -10, xr: -52.5, yu: -34},
                9: {xc: -35, yc: 0, xl: -17.5, yd: 10, xr: -52.5, yu: -10},
                10: {xc: -35, yc: 22, xl: -17.5, yd: 34, xr: -52.5, yu: 10}
            }
        }
        if (p[1]) this.agent.id = p[1] // id игрока
        if (!this.isGk) {
            this.CTRL = P_CTRL_LOW
            this.CTRLS = {
                "1": [P_CTRL_GO_TO_BALL, P_CTRL_GO_TO_ZONE], "2L": [P_CTRL_KICK_BALL],
                "2R": [P_CTRL_MOVE_IN_ZONE]
            }
        } else {
            this.CTRL = CTRL_LOW
            this.CTRLS = [CTRL_MIDDLE, CTRL_HIGHT]
        }
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
            this.agent.goalScored = true
        }
        this.agent.run = false
    }

    analyzeSee(msg, cmd, p) { // Анализ сообщения
        if (!this.agent.run) return

        this.agent.act = this.CTRL.execute(p, this.CTRLS, this.agent.teamName, this.agent.position,
            this.zoneCoords[this.agent.number])
        if (!this.isGk && this.agent.act) {
            console.log(this.agent.act)
        }
    }
}

module.exports = Controller
