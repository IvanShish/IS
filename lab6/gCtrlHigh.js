const closeDist = 1.5

const CTRL_HIGH = {
    execute(input) {
        const immediate = this.immediateReaction(input)
        if (immediate) return immediate
        const defend = this.defendGoal(input)
        if (defend) return defend
        if (this.last === "defend") input.newAction = "return"
        this.last = "previous"
    },

    immediateReaction(input) { // Немедленная реакция
        if (input.canKick) {
            this.last = "kick"

            const player = input.teamOwn ? input.teamOwn[0] : null
            const goal = input.goal
            let target
            if (goal && player) target = goal.d < player.d ? goal : player
            else if (goal) target = goal
            else if (player) target = player

            if (target)
                return {n: "kick", v: `${target.d * 2 + 40} ${input.goal.a}`}
            return {n: "kick", v: `100 0`}
        } else if (input.canCatch) {
            const ball = input.ball
            if (!ball) return null
            return {n: "catch", v: `${ball.a}`}
        }
    },

    defendGoal(input) { // Защита ворот
        if (input.ball) {
            const playerCoords = input.playerCoords
            if (!playerCoords || Math.abs(playerCoords.x) < 30 ||
                Math.abs(playerCoords.y) > 20 || input.ball.d > 20) {
                return null
            }
            const close = input.distClosestPlToBall
            if ((close && close.d + 1 > input.ball.d) || !close) {
                this.last = "defend"
                if (Math.abs(input.ball.a) > 5)
                    return {n: "turn", v: input.ball.a}
                return {n: "dash", v: 110}
            }

            const predictedPoint = input.predictedPoint
            if (predictedPoint && predictedPoint !== 1000 &&
            Math.abs(predictedPoint - playerCoords.y) > closeDist) {
                this.last = "defend"
                const angle = predictedPoint < playerCoords.y ? 90 : -90
                return {n: "dash", v: `100 ${angle}`}
            }
        }
    }
}
module.exports = CTRL_HIGH