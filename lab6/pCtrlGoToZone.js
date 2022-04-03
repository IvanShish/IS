const close_dist = 2, epsCenter = 2

const CTRL_GO_TO_ZONE = {
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
        const ball = input.ball
        if (ball && ball.d < close_dist) {
            if (Math.abs(ball.a) > 10) return {n: "turn", v: ball.a}
            return {n: "dash", v: 100}
        }

        if (!input.inZone) {
            const playerCoords = input.playerCoords
            if (!playerCoords) return null
            if (Math.abs(playerCoords.x - input.centerZoneX) > epsCenter ||
                Math.abs(playerCoords.y - input.centerZoneY) > epsCenter) {
                const angle = 0 // TODO: calculate angle
                if (angle > 10) return {n: "turn", v: angle}
                return {n: "dash", v: 100}
            }
        }
        return null
    }
}

module.exports = CTRL_GO_TO_ZONE