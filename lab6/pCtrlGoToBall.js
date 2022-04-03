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
        if (input.ballInZone) {
            const ball = input.ball
            if (!ball) return {n: "turn", v: 45}
            if (Math.abs(ball.a) > 10) {
                return {n: "turn", v: ball.a}
            }
            return {n: "dash", v: 100}
        }
        return null
    }
}

module.exports = CTRL_GO_TO_BALL