const CTRL_MOVE_IN_ZONE = {
    execute(input, controllers, level, treeSide) {
        const immediate = this.immediateReaction(input)
        if (immediate) return immediate

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
        if (input.inZone) {
            const ball = input.ball
            if (!ball) return {n: "turn", v: 60}
            if (Math.abs(ball.a) > 10) return {n: "turn", v: ball.a}
        }
        return null
    }
}

module.exports = CTRL_MOVE_IN_ZONE