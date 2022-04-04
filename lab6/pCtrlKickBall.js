const bound_y = 34, bound_eps = 2, farGoal = 15

const CTRL_GO_TO_BALL = {
    lastAddressee: "",  // Последний адресат ("goal" или "player")

    execute(input, controllers, level, treeSide) {
        const immediate = this.immediateReaction(input)
        if (immediate) return immediate

        this.lastAddressee = ""
        const nextControllers = controllers[level + treeSide]
        if (!nextControllers) return null
        if (nextControllers.length === 2) {
            const next = nextControllers[0].execute(input, controllers, level + 1, "L")
            if (next) return next
            else return nextControllers[1].execute(input, controllers, level + 1, "R")
        } else if (nextControllers.length === 1) {
            return nextControllers[0].execute(input, controllers, level + 1, "L")
        }
        return null
    },

    immediateReaction(input) {
        if (input.canKick) {
            let player = null
            if (!input.ownSide) player = input.teamOwn ? input.teamOwn[0] : null
            const goal = input.goal
            let target
            if (goal && player) {
                if (this.lastAddressee === "player") {
                    this.lastAddressee = "goal"
                    target = goal
                } else {
                    if (goal.d < player.d) {
                        this.lastAddressee = "goal"
                        target = goal
                    } else {
                        this.lastAddressee = "player"
                        target = player
                    }
                }
            }
            else if (goal) {
                this.lastAddressee = "goal"
                if (goal.d > farGoal) target = {a: goal.a, d: -12.5}
                else target = {a: goal.a + 10, d: 30}
            }
            else if (player) {
                this.lastAddressee = "player"
                target = player
            }

            if (target) {
                return {n: "kick", v: `${target.d * 2 + 40} ${target.a}`}
            }
            const playerCoords = input.playerCoords
            if (!playerCoords) return null
            if (playerCoords.y > bound_y - bound_eps)
                return {n: "kick", v: `10 -45`}
            return {n: "kick", v: `10 45`}
        }
        return null
    }
}

module.exports = CTRL_GO_TO_BALL