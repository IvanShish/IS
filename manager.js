const {calculateObjCoord} = require("./coord")

class Manager {
    constructor() {
        this.p = null
    }

    getAction(dt, p) {
        this.p = p

        function execute(dt, title, mgr) {
            const action = dt[title]
            if (typeof action.exec == "function") {
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
                console.log(action.command(mgr, dt.state))
                return action.command(mgr, dt.state)
            }
            throw new Error(`Unexpected node in DT: ${title}`)
        }

        return execute(dt, "root", this)
    }

    getVisible(fl) {
        const find_fl = this.p[fl]
        return !!find_fl;

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
            if (i[0] === 'p') num++;
        }
        return num
    }

    calculatePosition() {
        for (let i in this.p) {
            if (i[0] === 'p') {
                return {d: this.p[i].d, a: this.p[i].a}
            }
        }
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
        console.log(calculateObjCoord(this.p, 10, 10, "b"))
        return calculateObjCoord(this.p, 10, 10, "b")
    }
}

module.exports = Manager