const coord = require("./coord")
let BALL = ['b', 'B'], GOAL_OWN = 'gr', GOAL_ENEMY = ["gl", "fglt", "fglb"]

const Taken = {
    setSee(p, teamName, side) {
        const notParsedP = p;
        p = coord.parseNames(p)
        if (side === 'l') {
            GOAL_OWN = 'gl'
            GOAL_ENEMY = ["gr", "fgrt", "fgrb"]
        }
        const playerCoords = this.getPlayerCoords(notParsedP)

        let ball
        if (p[BALL[0]]) {
            ball = p[BALL[0]]
        } else if (p[BALL[1]]) {
            ball = p[BALL[1]]
        } else {
            ball = null
        }
        const ballForScorer = p[BALL[0]] ? p[BALL[0]] : null
        const goalOwn = p[GOAL_OWN] ? p[GOAL_OWN] : null
        const goal = this.getEnemyGoal(p)

        if (!this.ballPrevTimer && this.ballPrevTimer !== 0) {
            this.ballPrevTimer = 0
        } else if (this.ballPrevTimer > 1) {
            this.ballPrevCoords = this.getBallCoords(notParsedP)
            this.ballPrevTimer = 0
        } else {
            this.ballPrevTimer++
        }
        const ballCoords = this.getBallCoords(notParsedP)
        if (ballCoords) this.ballCoords = ballCoords

        const teamOwn = this.getTeamOwn(p, teamName)
        const predictedPoint = this.getPredictedPoint()
        const closestPlayer = this.getClosestPlayerToBall(notParsedP)
        const goalForScorer = this.getGoalForScorer(p)
        const distClosestPlToBall = this.getDistClosestPlToBall(closestPlayer)

        return {
            ball: ball, goalOwn: goalOwn, goal: goal, closestPlayerToBall: closestPlayer,
            distClosestPlToBall: distClosestPlToBall, ballForScorer: ballForScorer, ballCoords: this.ballCoords,
            teamOwn: teamOwn, playerCoords: playerCoords, predictedPoint: predictedPoint, goalForScorer: goalForScorer,
            flags: p, teamName: teamName, side: side, notParsedP: notParsedP
        }
    },

    getEnemyGoal(p) {
        const find_gl = p[GOAL_ENEMY[0]]
        const find_flt = p[GOAL_ENEMY[1]]
        const find_flb = p[GOAL_ENEMY[2]]
        if (find_gl) return find_gl
        if (find_flt) return find_flt
        if (find_flb) return find_flb
        return null
    },

    getTeamOwn(p, teamName) {
        let teamOwn = []
        for (let i in p) {
            if (i[0] === 'p' && i.split('"')[1] === teamName) {
                teamOwn.push(p[i])
            }
        }
        return teamOwn
    },

    getPlayerCoords(p) {
        const coords = coord.calculatePlayerCoord(p)
        if (coords) this.playerCoords = coords
        return this.playerCoords
    },

    getBallCoords(p) {
        if (!this.playerCoords) return null
        let ball = coord.calculateObjCoord(p, this.playerCoords.x, this.playerCoords.y, BALL[0])
        if (!ball) {
            ball = coord.calculateObjCoord(p, this.playerCoords.x, this.playerCoords.y, BALL[1])
        }
        return ball
    },

    getPredictedPoint() {
        const playerCoords = this.playerCoords
        const ballCoords = this.ballCoords
        if (!ballCoords || !this.ballPrevCoords) return null
        const eps = 1
        if (Math.abs(ballCoords.x - this.ballPrevCoords.x) < eps &&
            Math.abs(ballCoords.y - this.ballPrevCoords.y) < eps) {
            return 1000
        }
        if (ballCoords.x > playerCoords.x - eps) {
            return 1000
        }
        const k = (ballCoords.y - this.ballPrevCoords.y) /
            (ballCoords.x - this.ballPrevCoords.x)
        const b = this.ballPrevCoords.y - k * this.ballPrevCoords.x
        return k * playerCoords.x + b
    },

    getDistClosestPlToBall(closestPlayer) {
        const ballCoords = this.ballCoords
        if (!closestPlayer || !ballCoords) return null
        const d = Math.sqrt((ballCoords.x - closestPlayer.x) ** 2 + (ballCoords.y - closestPlayer.y) ** 2)
        return {d: d}
    },

    getClosestPlayerToBall(p) {
        if (!this.playerCoords) return null
        return coord.calculateClosestPlayerToBall(p, this.playerCoords.x, this.playerCoords.y)
    },

    getGoalForScorer(p) {
        const gr = p[GOAL_ENEMY[0]]
        if (gr)
            return gr
        let v
        for (let i in p) {
            if (i.startsWith('p'))
                v = p[i]
        }
        return v
    }
}

module.exports = Taken