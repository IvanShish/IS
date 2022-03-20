const coord = require("./coord")
let BALL = 'b', GOAL_OWN = 'gr', GOAL_ENEMY = ["gl", "flt", "flb"]

const Taken = {
    setSee(p, teamName, side) {
        const notParsedP = p;
        p = coord.parseNames(p)
        if (side === 'r') {
            GOAL_OWN = 'gl'
            GOAL_ENEMY = ["gr", "frt", "frb"]
        }

        const ball = p[BALL] ? p[BALL] : null
        const goalOwn = p[GOAL_OWN] ? p[GOAL_OWN] : null
        const goal = this.getEnemyGoal(p)
        return {ball: ball, goalOwn: goalOwn, goal: goal}
    },

    getEnemyGoal(p) {
        const find_gl = p[GOAL_ENEMY[0]]
        const find_flt = p[GOAL_ENEMY[1]]
        const find_flb = p[GOAL_ENEMY[2]]
        if (find_gl) return find_gl
        if (find_flt) return find_flt
        if (find_flb) return find_flb
        return null
    }
}

module.exports = Taken