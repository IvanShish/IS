const close_dist = 2, epsCenter = 2
const coord = require("./coord")

const CTRL_GO_TO_ZONE = {
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
        const ball = input.ball
        if (ball && ball.d < close_dist) {
            if (Math.abs(ball.a) > 10) return {n: "turn", v: ball.a}
            return {n: "dash", v: 100}
        }

        const playerCoords = input.playerCoords
        if (!playerCoords) return null
        if (Math.abs(playerCoords.x - input.centerZoneX) > epsCenter ||
            Math.abs(playerCoords.y - input.centerZoneY) > epsCenter) {
            const angle = coord.calculateAngleToPoint(input.notParsedP, playerCoords.x, playerCoords.y,
                input.centerZoneX, input.centerZoneY)
            if (Math.abs(angle) > 10) return {n: "turn", v: angle}
            return {n: "dash", v: 100}
        }
        return null
    }
}

module.exports = CTRL_GO_TO_ZONE