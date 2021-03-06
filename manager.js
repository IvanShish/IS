const coord = require('./coord')

class Manager {
    constructor(controller) {
        this.p = null
        this.notParsedP = null
        this.teamName = null
        this.controller = controller
    }

    getAction(dt, p, teamName) {
        this.notParsedP = p
        this.p = coord.parseNames(p)
        this.teamName = teamName

        function execute(dt, title, mgr) {
            const action = dt[title]
            if (typeof action.exec == "function") {
                // console.log(title)
                action.exec(mgr, dt.state)
                return execute(dt, action.next, mgr)
            }
            if (typeof action.condition == "function") {
                const cond = action.condition(mgr, dt.state)
                if (cond)
                    return execute(dt, action.trueCond, mgr)
                return execute(dt, action.falseCond, mgr)
            }
            if (typeof action.command == "function") {
                return action.command(mgr, dt.state)
            }
            throw new Error(`Unexpected node in DT: ${title}`)
        }

        return execute(dt, "root", this)
    }

    getVisible(fl) {
        const find_fl = this.p[fl]
        if (find_fl)
            return true
        return false
    }

    getDistance(fl) {
        const find_fl = this.p[fl]
        if (find_fl)
            return find_fl.d
        return null
    }

    getAngle(fl) {
        const find_fl = this.p[fl]
        if (find_fl)
            return find_fl.a
        return null
    }

    numPlayers() {
        let num = 0
        for (let i in this.p) {
            if (i[0] === 'p' && i.split('"')[1] === this.teamName) num++;
        }
        return num
    }

    calculatePosition() {
        for (let i in this.p) {
            if (i[0] === 'p' && i.split('"')[1] === this.teamName) {
                return {d: this.p[i].d, a: this.p[i].a}
            }
        }
    }

    calculateMaxPosition() {
        let maxd = 0, maxa
        for (let i in this.p) {
            if (i[0] === 'p' && i.split('"')[1] === this.teamName) {
                if (this.p[i].d > maxd) {
                    maxd = this.p[i].d
                    maxa = this.p[i].a
                }
            }
        }
        return {d: maxd, a: maxa}
    }

    getEnemyGoalVisible() {
        const find_gl = this.p["gl"]
        const find_flt = this.p["flt"]
        const find_flb = this.p["flb"]
        return !!find_gl || !!find_flt || !!find_flb;
    }

    getEnemyGoalAngle() {
        const find_gl = this.p["gl"]
        const find_flt = this.p["flt"]
        const find_flb = this.p["flb"]
        if (find_gl) {
            return find_gl.a
        } else if (find_flt) {
            return find_flt.a
        } else if (find_flb) {
            return find_flb.a
        }
        return null
    }

    getBallCoordinates() {
        const playerCoords = coord.calculatePlayerCoord(this.notParsedP)
        if (!playerCoords) return {x: null, y: null}
        const ballCoords = coord.calculateObjCoord(this.notParsedP, playerCoords.x, playerCoords.y, "b")
        if (ballCoords) return ballCoords
        return {x: null, y: null}
    }

    getGoaliePos() {
        const coords = coord.calculatePlayerCoord(this.notParsedP)
        if (coords) this.goaliePos = coords
        return this.goaliePos
    }

    isGoalieCloserToBall() {
        const goalieCoords = coord.calculatePlayerCoord(this.notParsedP)
        return coord.isPlayerCloserToBallThanAnyoneElse(this.notParsedP, goalieCoords.x, goalieCoords.y)
    }

    getClosestPlayerToBallDist() {
        const goalieCoords = coord.calculatePlayerCoord(this.notParsedP)
        const closestPlayer = coord.calculateClosestPlayerToBall(this.notParsedP, goalieCoords.x, goalieCoords.y)
        if (closestPlayer) return closestPlayer
        return 1000
    }

    isPlayOn() {
        return this.controller.agent.run
    }

    wasAudioGoReceived() {
        return this.controller.agent.audioGo
    }

    wasGoalScored() {
        return this.controller.agent.goalScored
    }

    getAgentInitCoords() {
        return {x: this.controller.agent.xCoord, y: this.controller.agent.yCoord}
    }
}

module.exports = Manager