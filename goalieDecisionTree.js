const BALL = "b", GOAL_FLAG = "gr", MIN_X = 35, MAX_X = 52, MAX_Y = 20,
    GOALIE_ZONE_X = 40, GOALIE_ZONE_Y = 9, CENTER_FLAG = "fc", eps = 0.5,
    epsBall = 2.0

const GoalieDT = {
    state: {
        command: null,
        sign: -1,
        prevBallCoords: null,
        predictBall: true,
        predictedPoint: null
    },

    root: {
        exec(mgr, state) {
            state.command = null
            state.predictedPoint = null
        },
        next: "checkBall"
    },

    checkBall: {
        condition: (mgr, state) => mgr.getVisible(BALL),
        trueCond: "checkDistanceToBall",
        falseCond: "farBall"
    },

    checkDistanceToBall: {
        condition: (mgr, state) => mgr.getDistance(BALL) < 20,
        trueCond: "checkBallPredict",
        falseCond: "farBall"
    },

    checkBallPredict: {
        condition: (mgr, state) => {
            const predict = state.predictBall
            state.predictBall = true
            return predict
        },
        trueCond: "needToPredictBall",
        falseCond: "closeBall"
    },

    needToPredictBall: {
        condition: (mgr, state) => {
            if (!state.prevBallCoords) {
                state.prevBallCoords = mgr.getBallCoordinates()
                state.predictBall = false
                return false
            }
            const ballCoords = mgr.getBallCoordinates()
            const goalieCoords = mgr.getGoaliePos()
            if (!ballCoords.x || !state.prevBallCoords.x || !goalieCoords) {
                state.predictBall = false
                return false
            }

            if (goalieCoords.x < MIN_X || goalieCoords.x > MAX_X ||
            goalieCoords.y > MAX_Y || goalieCoords.y < -MAX_Y) {
                state.predictBall = false
                return false
            }

            if (ballCoords.x - eps >= goalieCoords.x) {
                state.predictBall = false
                return false
            }

            if (Math.abs(ballCoords.x - state.prevBallCoords.x) < epsBall &&
                Math.abs(ballCoords.y - state.prevBallCoords.y) < epsBall) {
                // console.log(ballCoords.x, state.prevBallCoords.x,
                //     ballCoords.y, state.prevBallCoords.y)
                state.predictBall = false
                return false
            }
            const k = (ballCoords.y - state.prevBallCoords.y) /
                (ballCoords.x - state.prevBallCoords.x)
            const b = state.prevBallCoords.y - k * state.prevBallCoords.x
            state.predictedPoint = k * goalieCoords.x + b

            if (state.predictedPoint - eps <= goalieCoords.y &&
                goalieCoords.y <= state.predictedPoint + eps) {
                state.predictBall = false
                return false
            } else {
                // console.log(state.predictedPoint)
                if (state.predictedPoint < goalieCoords.y) {
                    state.predictedAngle = 90
                } else {
                    state.predictedAngle = -90
                }
            }
            return true
        },
        trueCond: "runToPredictedPoint",
        falseCond: "closeBall"
    },

    runToPredictedPoint: {
        exec(mgr, state) {
            state.command = {n: "dash", v: `100 ${state.predictedAngle}`}
        },
        next: "sendCommand"
    },

    closeBall: {
        condition: (mgr, state) => {
            return ((mgr.getDistance(BALL) > 1 && mgr.getDistance(BALL) < 10)) && mgr.getAngle(BALL) < 4
        },
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
            if (mgr.getAngle(CENTER_FLAG) > 0)
                state.command = {n: "kick", v: "5 -45"}
            else
                state.command = {n: "kick", v: "5 45"}
        },
        next: "sendCommand"
    },

    checkCatch: {
        condition: (mgr, state) => mgr.getDistance(BALL) <= 1,
        trueCond: "checkGoalZone",
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
        condition: (mgr, state) => mgr.getBallCoordinates().x < MAX_X &&
            mgr.getBallCoordinates().x > MIN_X &&
            mgr.getBallCoordinates().y < MAX_Y &&
            mgr.getBallCoordinates().y > -MAX_Y &&
            mgr.getClosestPlayerToBallDist() < 9,
        trueCond: "catchBall",
        falseCond: "enemyGoalVisible"
    },

    catchBall: {
        exec(mgr, state) {
            console.log('try to catch ', mgr.getAngle(BALL))
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
        condition: (mgr, state) => {
            const goalieCoords = mgr.getGoaliePos()
            return mgr.getDistance(GOAL_FLAG) > 5 &&
                goalieCoords.x > MIN_X && goalieCoords.x < MAX_X &&
                goalieCoords.y > -MAX_Y && goalieCoords.y < MAX_Y
        },
        trueCond: "checkGoalAngle",
        falseCond: "closeGoal"
    },

    checkGoaliePos: {
        condition: (mgr, state) => mgr.getGoaliePos().x > GOALIE_ZONE_X &&
            -GOALIE_ZONE_Y < mgr.getGoaliePos().y && mgr.getGoaliePos().y < GOALIE_ZONE_Y,
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