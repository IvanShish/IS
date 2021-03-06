const ScorerTA = {
    current: "start", // Текущее состояние автомата
    state: { // Описание состояния
        variables: { // Переменные
            distBall: null, angle: null, distGr: null,
            lastBallAngle: 60, lastGoalAngle: 60
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
                guard: [{s: "gt", l: {v: "distGr"}, r: 35}],
                synch: "powerKick!"
            },
            {
                guard: [{s: "lte", l: {v: "distGr"}, r: 35}],
                synch: "weakKick!"
            }
        ]
    },

    actions: {
        init(taken, state) { // Инициализация игрока
            state.local.goalie = false
        },
        beforeAction(taken, state) { // Действие перед каждым вычислением
            if (!state.local.ballTimer) state.local.ballTimer = 0
            if (!state.local.goalTimer) state.local.goalTimer = 0

            if (taken.ballForScorer) {
                state.variables.distBall = taken.ballForScorer.d
                state.variables.angle = taken.ballForScorer.a
                state.variables.lastBallAngle = taken.ballForScorer.a
                state.local.ballTimer = 0
            } else {
                state.local.ballTimer++
            }
            if (taken.goalForScorer) {
                state.variables.distGr = taken.goalForScorer.d
                state.variables.lastGoalAngle = taken.goalForScorer.a
                state.local.goalTimer = 0
            } else {
                state.local.goalTimer++
            }
        },

        ballVisible(taken, state) { // Виден ли мяч
            state.next = true
            return !!taken.ballForScorer
        },

        rotate(taken, state) { // Поворот, если не видно мяча
            state.next = true
            if (state.variables.lastBallAngle && state.variables.lastBallAngle < 0) {
                return {n: "turn", v: -60}
            }
            return {n: "turn", v: 60}
        },

        turnToBall(taken, state) { // Поворот к мячу
            state.next = true
            const angle = taken.ballForScorer.a
            return {n: "turn", v: angle}
        },

        runToBall(taken, state) {
            state.next = true
            return {n: "dash", v: 100}
        },

        grVisible(taken, state) {
            state.next = true
            return !!taken.goalForScorer
        },

        rotateKick(taken, state) {
            state.next = true
            if (state.variables.lastGoalAngle && state.variables.lastGoalAngle < 0) {
                return {n: "kick", v: `4 -45`}
            }
            return {n: "kick", v: `4 45`}
        },

        powerKick(taken, state) {
            state.next = true
            const angle = taken.goalForScorer.a
            return {n: "kick", v: `20 ${angle}`}
        },

        weakKick(taken, state) {
            state.next = true
            const angle = taken.goalForScorer.a
            if (taken.goalForScorer.d < 20) {
                return {n: "kick", v: `40 ${angle}`}
            } 
            return {n: "kick", v: `70 ${angle}`}
        },
    }
}

module.exports = ScorerTA