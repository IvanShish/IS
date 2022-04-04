const bound_y = 34, bound_eps = 2

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
            const player = input.teamOwn ? input.teamOwn[0] : null
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
                target = goal
            }
            else if (player) {
                this.lastAddressee = "player"
                target = player
            }

            if (target) {
                console.log(target)
                return {n: "kick", v: `${target.d * 2 + 40} ${target.a}`}
            }
            const playerCoords = input.playerCoords
            if (!playerCoords) return null
            this.lastAddressee = ""
            if (playerCoords.y > bound_y - bound_eps)
                return {n: "kick", v: `10 45`}  // mb pomenyat' nado
            return {n: "kick", v: `10 -45`}
        }
        return null
    }
}

module.exports = CTRL_GO_TO_BALL