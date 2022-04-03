const bound_y = 34, bound_eps = 2

const CTRL_GO_TO_BALL = {
    execute(input, controllers) {
        const next = controllers[0]
        const immediate = this.immediateReaction(input)
        if (immediate) return immediate

        if (next) {
            const command = next.execute(input, controllers.slice(1))
            if (command) return command
        }
    },

    immediateReaction(input) {
        if (input.canKick) {
            const player = input.teamOwn ? input.teamOwn[0] : null
            const goal = input.goal
            let target
            if (goal && player) target = goal.d < player.d ? goal : player
            else if (goal) target = goal
            else if (player) target = player

            if (target)
                return {n: "kick", v: `${target.d * 2 + 40} ${input.goal.a}`}
            const playerCoords = input.playerCoords
            if (!playerCoords) return null
            if (playerCoords.y > bound_y - bound_eps)
                return {n: "kick", v: `10 45`}  // mb pomenyat' nado
            return {n: "kick", v: `10 -45`}
        }
        return null
    }
}

module.exports = CTRL_GO_TO_BALL