const BALL = "b", FL = "flag", KI = "kick"

const GoalieDT = {
    state: {
        command: null,
        next: 0,
        sequence: [{act: FL, fl: "fplb"}, {act: FL, fl: "fgrb"},
            {act: KI, fl: BALL, goal: "gr"}],
        action: null,
        sign: 1
    },

    root: {
        exec(mgr, state) {
            state.action = state.sequence[state.next]
            state.command = null
        },
        next: "checkPlayOn"
    },

    checkPlayOn: {
        condition: (mgr, state) => mgr.isPlayOn(),
        trueCond: "checkCurrentAct",
        falseCond: "isGoalScored"
    },

    isGoalScored: {
        condition: (mgr, state) => mgr.wasGoalScored(),
        trueCond: "movePlayer",
        falseCond: "resetSequence"
    },

    movePlayer: {
        exec(mgr, state) {
            state.next = 0
            const coords = mgr.getAgentInitCoords()
            state.command = {n: 'move', v: `${coords.x} ${coords.y}`}
        },
        next: "sendCommand"
    },

    resetSequence: {
        exec(mgr, state) {
            state.next = 0
        },
        next: "sendCommand"
    },

    checkCurrentAct: {
        condition: (mgr, state) => state.action.act === FL,
        trueCond: "wasAudioMessageReceived",
        falseCond: "ballVisible"
    },

    wasAudioMessageReceived: {
        condition: (mgr, state) => mgr.wasAudioGoReceived(),
        trueCond: "changeCurrentActToKick",
        falseCond: "flagVisible"
    },

    changeCurrentActToKick: {
        exec(mgr, state) {
            state.next = state.sequence.length - 1
        },
        next: "sendCommand"
    },

    ballVisible: {
        condition: (mgr, state) => mgr.getVisible(BALL),
        trueCond: "checkDistToBallAndAngle",
        falseCond: "rotate"
    },

    flagVisible: {
        condition: (mgr, state) => mgr.getVisible(state.action.fl),
        trueCond: "checkFlagAngle",
        falseCond: "rotate"
    },

    checkFlagAngle: {
        condition: (mgr, state) => mgr.getAngle(state.action.fl) < 1,
        trueCond: "checkFlagDist",
        falseCond: "turnToFlag"
    },

    checkFlagDist: {
        condition: (mgr, state) => mgr.getDistance(state.action.fl) < 3,
        trueCond: "setNextAction",
        falseCond: "runToFlag"
    },

    turnToFlag: {
        exec(mgr, state) {
            state.command = {n: 'turn', v: mgr.getAngle(state.action.fl)}
        },
        next: "sendCommand"
    },

    setNextAction: {
        exec(mgr, state) {
            state.next++
        },
        next: "sendCommand"
    },

    runToFlag: {
        exec(mgr, state) {
            state.command = {n: 'dash', v: 100}
        },
        next: "sendCommand"
    },

    rotate: {
        exec(mgr, state) {
            state.command = {n: 'turn', v: 60}
        },
        next: "sendCommand"
    },

    checkDistToBallAndAngle: {
        condition: (mgr, state) => mgr.getDistance(BALL) <= 0.5 && mgr.getAngle(BALL) < 1,
        trueCond: "enemyGoalVisible",
        falseCond: "checkBallAngle"
    },

    enemyGoalVisible: {
        condition: (mgr, state) => {
            state.sign = mgr.getAngle(state.action.goal) > 0 ? -1 : 1
            return mgr.getVisible(state.action.goal)
        },
        trueCond: "kickToGoal",
        falseCond: "rotateToGoal"
    },

    kickToGoal: {
        exec(mgr, state) {
            state.command = {n: "kick", v: `100 ${mgr.getAngle(state.action.goal)}`}
        },
        next: "sendCommand"
    },

    rotateToGoal: {
        exec(mgr, state) {
            state.command = {n: "kick", v: `5 ${state.sign * 45}`}
        },
        next: "sendCommand"
    },

    checkBallAngle: {
        condition: (mgr, state) => mgr.getAngle(BALL) < 1,
        trueCond: "runToBall",
        falseCond: "turnToBall"
    },

    runToBall: {
        exec(mgr, state) {
            state.command = {n: "dash", v: 100}
        },
        next: "sendCommand"
    },

    turnToBall: {
        exec(mgr, state) {
            state.command = {n: "turn", v: mgr.getAngle(BALL)}
        },
        next: "sendCommand"
    },

    sendCommand: {
        command: (mgr, state) => state.command
    }
}

module.exports = GoalieDT