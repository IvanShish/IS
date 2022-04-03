const CTRL_MIDDLE = {
    action: "return",
    turnData: "ft0",

    execute(input, controllers) {
        const next = controllers[0] // Следующий уровень
        switch (this.action) {
            case "return":
                input.cmd = this.actionReturn(input)
                break
            case "rotateCenter":
                input.cmd = this.rotateCenter(input)
                break
            case "seekBall":
                input.cmd = this.seekBall(input)
                break
        }
        input.action = this.action
        if (next) { // Вызов следующего уровня
            const command = next.execute(input, controllers.slice(1))
            if (command) return command
            if (input.newAction) this.action = input.newAction
            return input.cmd
        }
    },

    actionReturn(input) { // Возврат к своим воротам
        if (!input.goalOwn) return {n: "turn", v: 60}
        if (Math.abs(input.goalOwn.a) > 10)
            return {n: "turn", v: input.goalOwn.a}
        if (input.goalOwn.d > 3)
            return {n: "dash", v: input.goalOwn.d * 2 + 30}
        this.action = "rotateCenter"
        return {n: "turn", v: 180}
    },

    rotateCenter(input) { // Повернуться к центру
        if (!input.flags["fc"]) return {n: "turn", v: 60}
        this.action = "seekBall"
        return {n: "turn", v: input.flags["fc"].a}
    },

    seekBall(input) { // Осмотр поля
        if (input.flags[this.turnData]) {
            if (Math.abs(input.flags[this.turnData].a) > 10)
                return {n: "turn", v: input.flags[this.turnData].a}
            if (this.turnData === "ft0") {
                this.turnData = "fb0"
            } else {
                if (this.turnData === "fb0") {
                    this.turnData = "ft0"
                    this.action = "rotateCenter"
                    return this.rotateCenter(input)
                }
            }
        }
        if (this.turnData === "ft0")
            return {n: "turn", v: input.side === "l" ? -30 : 30}
        if (this.turnData === "fb0")
            return {n: "turn", v: input.side === "l" ? 30 : -30}
        throw `Unexpected state ${JSON.stringify(this)}, ${JSON.stringify(input)}`
    },
}
module.exports = CTRL_MIDDLE