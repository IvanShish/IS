const BALL = "b", GOAL_FLAG = "gr", MAX_X = 35, MAX_Y = 20,
    GOALIE_ZONE_X = 40, GOALIE_ZONE_Y = 9

const GoalieDT = {
    state: {
        command: null,
        isBallCaught: false,
        sign: -1
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
        condition: (mgr, state) => mgr.getDistance(BALL) < 9 || mgr.isGoalieCloserToBall(),
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
        condition: (mgr, state) => mgr.getEnemyGoalVisible() && mgr.getDistance(BALL) <= 0.5,
        trueCond: "kickBall",
        falseCond: "checkRotateToEnemyGoal"
    },

    kickBall: {
        exec(mgr, state) {
            state.command = {n: "kick", v: `100 ${mgr.getEnemyGoalAngle()}`}
        },
        next: "sendCommand"
    },

    checkRotateToEnemyGoal: {
        condition: (mgr, state) => mgr.getDistance(BALL) <= 0.5,
        trueCond: "rotateToEnemyGoal",
        falseCond: "run"
    },

    rotateToEnemyGoal: {
        exec(mgr, state) {
            if (this.isBallCaught) {
                this.isBallCaught = false
                state.command = {n: 'turn', v: state.sign * 45}
            }
            else {
                state.command = {n: "kick", v: "5 45"}
            }
        },
        next: "sendCommand"
    },

    checkCatch: {
        condition: (mgr, state) => mgr.getDistance(BALL) <= 1 && !this.isBallCaught,
        trueCond: "checkGoalZone",
        falseCond: "checkIsBallAlreadyCaught"
    },

    checkIsBallAlreadyCaught: {
        condition: (mgr, state) => this.isBallCaught,
        trueCond: "enemyGoalVisible",
        falseCond: "turnToBall"
    },

    turnToBall: {
        exec(mgr, state) {
            state.sign = mgr.getAngle(BALL) >= 0 ? 1 : -1
            state.command = {
                n: 'turn',
                v: mgr.getAngle(BALL)
            }
        },
        next: "sendCommand"
    },

    checkGoalZone: {
        condition: (mgr, state) => mgr.getBallCoordinates().x > MAX_X &&
            mgr.getBallCoordinates().y < MAX_Y && mgr.getBallCoordinates().y > -MAX_Y,
        trueCond: "catchBall",
        falseCond: "enemyGoalVisible"
    },

    catchBall: {
        exec(mgr, state) {
            // console.log('catch ', mgr.getAngle(BALL))
            this.isBallCaught = true
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
        falseCond: "checkGoaliePos"
    },

    checkDistanceToGoal: {
        condition: (mgr, state) => mgr.getDistance(GOAL_FLAG) > 5,
        trueCond: "checkGoalAngle",
        falseCond: "closeGoal"
    },

    checkGoaliePos: {
        condition: (mgr, state) => mgr.getGoaliePos().x > GOALIE_ZONE_X &&
            -GOALIE_ZONE_Y < mgr.getGoaliePos().y < GOALIE_ZONE_X,
        trueCond: "closeGoal",
        falseCond: "rotate"
    },

    rotate: {
        exec(mgr, state) {
            state.command = {
                n: 'turn',
                v: state.sign * 60
            }
        },
        next: "sendCommand"
    },

    checkGoalAngle: {
        condition: (mgr, state) => mgr.getAngle(GOAL_FLAG) < 4,
        trueCond: "run",
        falseCond: "turnToGoal"
    },

    run: {
        exec(mgr, state) {
            state.command = {n: 'dash', v: 100}
        },
        next: "sendCommand"
    },

    turnToGoal: {
        exec(mgr, state) {
            state.sign = mgr.getAngle(GOAL_FLAG) >= 0 ? 1 : -1
            state.command = {
                n: 'turn',
                v: mgr.getAngle(GOAL_FLAG)
            }
        },
        next: "sendCommand"
    },

    closeGoal: {
        condition: (mgr, state) => mgr.getVisible(BALL),
        trueCond: "turnToBall",
        falseCond: "rotate"
    },

    sendCommand: {
        command: (mgr, state) => state.command
    }
}

module.exports = GoalieDT