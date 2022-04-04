const CTRL_GO_TO_BALL = {
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
        if (input.ballInZone && !input.canKick) {
            const ball = input.ball
            if (!ball) {
                return {n: "turn", v: 45}
            }
            if (Math.abs(ball.a) > 10) {
                return {n: "turn", v: ball.a}
            }
            return {n: "dash", v: 100}
        }
        return null
    }
}

module.exports = CTRL_GO_TO_BALL