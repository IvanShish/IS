const MIN_X = 35, MAX_X = 52, MAX_Y = 20, GOALIE_ZONE_X = 47, GOALIE_ZONE_Y = 7
const farDist = 12, closeDist = 2

const GoalieTA = {
    current: "start", // Текущее состояние автомата
    state: { // Описание состояния
        variables: { // Переменные
            distBall: null, angle: null, lastBallAngle: 60,
            lastGoalOwnAngle: 60, lastGoalAngle: 60
        },
        timers: {t: 0}, // Таймеры
        next: true, // Нужен переход на следующее состояние
        synch: undefined, // Текущее действие
        local: {}, // Внутренние переменные для методов
    },

    nodes: { /* Узлы автомата, в каждом узле: имя и узлы, на кото-
рые есть переходы */
        start: {n: "start", e: ["ballVisible", "rotate"]},
        rotate: {n: "rotate", e: ["start"]},
        ballVisible: {n: "ballVisible", e: ["start", "lowAngle"]},
        lowAngle: {n: "lowAngle", e: ["start", "ballClose"]},
        ballClose: {n: "ballClose", e: ["grVisible", "start"]},
        grVisible: {n: "grVisible", e: ["start"]},
    },

    edges: { /* Ребра автомата (имя каждого ребра указывает на
узел-источник и узел-приемник) */
        start_ballVisible: [{
            synch: "ballVisible?"
        }],
        start_rotate: [{
            synch: "rotate!"
        }],
        rotate_start: [{
            assign: [{n: "t", v: 0, type: "timer"}]
        }],
        ballVisible_start: [{
            guard: [{s: "gt", l: {v: "angle"}, r: 4}],
            synch: "turnToBall!"
        }],
        ballVisible_lowAngle: [{
            guard: [{s: "lte", l: {v: "angle"}, r: 4}]
        }],
        lowAngle_start: [{
            guard: [{s: "gt", l: {v: "distBall"}, r: 1}],
            synch: "runToBall!"
        }],
        lowAngle_ballClose: [{
            guard: [{s: "lte", l: {v: "distBall"}, r: 1}]
        }],
        ballClose_grVisible: [{
            synch: "grVisible?"
        }],
        ballClose_start: [{
            synch: "rotateKick!"
        }],
        grVisible_start: [
        {
            guard: [{s: "gt", l: {v: "distGr"}, r: 30}],
            synch: "powerKick!"
        },
        {
            guard: [{s: "lte", l: {v: "distGr"}, r: 30}],
            synch: "weakKick!"
        }]


    },

    actions: {
        init(taken, state) { // Инициализация игрока
            state.local.goalie = false
        },
        beforeAction(taken, state) { // Действие перед каждым вычислением
            if (!state.local.ballTimer) state.local.ballTimer = 0
            if (!state.local.goalOwnTimer) state.local.goalOwnTimer = 0
            if (!state.local.goalTimer) state.local.goalTimer = 0

            if (taken.ball) {
                state.variables.distBall = taken.ball.d
                state.variables.angle = taken.ball.a
                state.variables.lastBallAngle = taken.ball.a
                state.local.ballTimer = 0
            } else {
                state.local.ballTimer++
            }
            if (taken.goalOwn) {
                state.variables.distGr = taken.goalOwn.d
                state.variables.lastGoalOwnAngle = taken.goalOwn.a
                state.local.goalOwnTimer = 0
            } else {
                state.local.goalOwnTimer++
            }
            if (taken.goal) {
                state.variables.lastGoalAngle = taken.goal.a
                state.local.goalTimer = 0
            } else {
                state.local.goalTimer++
            }
        },

        ballVisible(taken, state) { // Виден ли мяч
            state.next = true
            return !!taken.ball
        },

        rotate(taken, state) { // Поворот, если не видно мяча
            state.next = true
            return {n: "turn", v: 60}
        },

        turnToBall(taken, state) { // Поворот к мячу
            state.next = true
            const angle = taken.ball.a
            return {n: "turn", v: angle}
        },

        runToBall(taken, state) {
            state.next = true
            return {n: "dash", v: 100}
        },

        grVisible(taken, state) {
            state.next = true
            return !!taken.goalOwn
        },

        rotateKick(taken, state) {
            state.next = true
            return {n: "kick", v: `10 45`}
        },

        powerKick(taken, state) {
            state.next = true
            const angle = taken.goalOwn.a
            return {n: "kick", v: `60 ${angle}`}
        },

        weakKick(taken, state) {
            state.next = true
            const angle = taken.goalOwn.a
            return {n: "kick", v: `40 ${angle}`}
        },
    }
}

module.exports = GoalieTA