const BALL = "b", GOAL_FLAG = "gr", MAX_X = 35, MAX_Y = 20,
    MIDFIELD_FLAG = "fprc"

const GoalieDT = {
    state: {
        command: null
    },

    root: {
        exec(mgr, state) {
            state.command = null
        },
        next: "checkBall"
    },

    checkBall: {
        condition: (mgr, state) => mgr.getVisible(BALL),
        trueCond: "checkDistanceToBall",
        falseCond: "farBall"
    },

    checkDistanceToBall: {
        condition: (mgr, state) => mgr.getDistance(BALL) < 7,
        trueCond: "closeBall",
        falseCond: "farBall"
    },

    closeBall: {
        condition: (mgr, state) => mgr.getDistance(BALL) >= 2 &&
            mgr.getAngle(BALL) < 4,
        trueCond: "enemyGoalVisible",
        falseCond: "checkCatch"
    },

    enemyGoalVisible: {
        condition: (mgr, state) => mgr.getEnemyGoalVisible(),
        trueCond: "kickBallToEnemyGoal",
        falseCond: "rotateToEnemyGoal"
    },

    kickBallToEnemyGoal: {
        exec(mgr, state) {
            state.command = {n: "kick", v: `100 ${mgr.getEnemyGoalAngle()}`}
        },
        next: "sendCommand"
    },

    rotateToEnemyGoal: {
        exec(mgr, state) {
            state.command = {n: "kick", v: "5 45"}
        },
        next: "sendCommand"
    },

    checkCatch: {
        condition: (mgr, state) => mgr.getVisible(BALL) < 2,
        trueCond: "checkGoalZone",
        falseCond: "turnToBall"
    },

    turnToBall: {
        exec(mgr, state) {
            state.command = {
                n: 'turn',
                v: mgr.getAngle(BALL)
            }
        },
        next: "sendCommand"
    },

    checkGoalZone: {
        condition: (mgr, state) => mgr.getBallCoordinates().x < MAX_X &&
            mgr.getBallCoordinates().y < MAX_Y && mgr.getBallCoordinates().y > -MAX_Y,
        trueCond: "catchBall",
        falseCond: "enemyGoalVisible"
    },

    catchBall: {
        exec(mgr, state) {
            state.command = {
                n: 'catch',
                v: mgr.getAngle(BALL)
            }
        },
        next: "sendCommand"
    },

    farBall: {
        condition: (mgr, state) => mgr.getVisible(GOAL_FLAG),
        trueCond: "checkDistanceToGoal",
        falseCond: "rotate"
    },

    checkDistanceToGoal: {
        condition: (mgr, state) => mgr.getDistance(GOAL_FLAG) > 5,
        trueCond: "checkGoalAngle",
        falseCond: "closeGoal"
    },

    rotate: {
        exec(mgr, state) {
            state.command = {
                n: 'turn',
                v: 90
            }
        },
        next: "sendCommand"
    },

    checkGoalAngle: {
        condition: (mgr, state) => mgr.getAngle(GOAL_FLAG) < 4,
        trueCond: "runToGoal",
        falseCond: "turnToGoal"
    },

    runToGoal: {
        exec(mgr, state) {
            state.command = {n: 'dash', v: 100}
        },
        next: "sendCommand"
    },

    turnToGoal: {
        exec(mgr, state) {
            state.command = {
                n: 'turn',
                v: mgr.getAngle(GOAL_FLAG)
            }
        },
        next: "sendCommand"
    },

    closeGoal: {
        condition: (mgr, state) => mgr.getVisible(MIDFIELD_FLAG),
        trueCond: "turnToMidfield",
        falseCond: "rotate"
    },

    turnToMidfield: {
        exec(mgr, state) {
            state.command = {
                n: 'turn',
                v: mgr.getAngle(MIDFIELD_FLAG)
            }
        },
        next: "sendCommand"
    },

    sendCommand: {
        command: (mgr, state) => state.command
    }
}

module.exports = GoalieDT