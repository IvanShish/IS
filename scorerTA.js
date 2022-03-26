const MIN_X = 35, MAX_X = 52, MAX_Y = 20, GOALIE_ZONE_X = 47, GOALIE_ZONE_Y = 7
const farDist = 12, closeDist = 2

const GoalieTA = {
    state: { // Описание состояния
        current: "start", // Текущее состояние автомата
        variables: { // Переменные
            dist: null, lastBallAngle: 60,
            lastGoalOwnAngle: 60, lastGoalAngle: 60
        },
        timers: {t: 0}, // Таймеры
        next: true, // Нужен переход на следующее состояние
        synch: undefined, // Текущее действие
        local: {}, // Внутренние переменные для методов
    },

    nodes: { /* Узлы автомата, в каждом узле: имя и узлы, на кото-
рые есть переходы */
        start: {n: "start", e: ["close", "near", "far"]},
        close: {n: "close", e: ["catch"]},
        catch: {n: "catch", e: ["kick"]},
        kick: {n: "kick", e: ["start"]},
        far: {n: "far", e: ["start"]},
        near: {n: "near", e: ["intercept", "start"]},
        intercept: {n: "intercept", e: ["start"]},
    },

    edges: { /* Ребра автомата (имя каждого ребра указывает на
узел-источник и узел-приемник) */
        start_close:
            [{guard: [{s: "lt", l: {v: "dist"}, r: closeDist}]}],
        /* Список guard описывает перечень условий, проверяемых
        * для перехода по ребру. Знак lt - меньше, lte - меньше
        * либо равно. В качестве параметров принимаются числа или
        * значения переменных "v" или таймеров "t" */
        start_near: [{
            guard: [{s: "lt", l: {v: "dist"}, r: farDist},
                {s: "lte", l: closeDist, r: {v: "dist"}}]
        }],
        start_far:
            [{guard: [{s: "lte", l: farDist, r: {v: "dist"}}]}],
        close_catch: [{synch: "catch!"}],
        /* Событие синхронизации synch вызывает на выполнение
        * соответствующую функцию */
        catch_kick: [{synch: "kick!"}],
        kick_start: [{
            synch: "goBack!", assign: [{
                n: "t", v: 0, type: "timer"
            }]
        }],
        /* Список assign перечисляет присваивания для переменных
        * "variable" и таймеров "timer" */
        far_start: [
            {
                guard: [{s: "lt", l: 10, r: {t: "t"}}],
                synch: "lookAround!",
                assign: [{n: "t", v: 0, type: "timer"}]
            },
            {
                guard: [{s: "lte", l: {t: "t"}, r: 10}],
                synch: "ok!"
            }
        ],
        near_start: [{
            synch: "predict!",
            assign: [{n: "t", v: 0, type: "timer"}]
        }],
        near_intercept: [{synch: "canIntercept?"}],
        /* Событие синхронизации synch может вызывать
        * соответствующую функцию для проверки возможности перехода
        * по ребру (заканчивается на знак "?") */
        intercept_start: [{
            synch: "runToBall!", assign: [{n: "t", v: 0, type: "timer"}]
        }]
    },

    actions: {
        init(taken, state) { // Инициализация игрока
            state.local.goalie = true
            state.local.catch = 0
        },
        beforeAction(taken, state) { // Действие перед каждым вычислением
            if (!state.local.ballTimer) state.local.ballTimer = 0
            if (!state.local.goalOwnTimer) state.local.goalOwnTimer = 0
            if (!state.local.goalTimer) state.local.goalTimer = 0

            if (taken.ball) {
                state.variables.dist = taken.ball.d
                state.variables.lastBallAngle = taken.ball.a
                state.local.ballTimer = 0
            } else {
                state.local.ballTimer++
            }
            if (taken.goalOwn) {
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

        catch(taken, state) { // Ловим мяч
            if (!taken.ball) {
                state.next = true
                return
            }
            let angle = taken.ball.a
            let dist = taken.ball.d
            state.next = false
            if (dist > 0.5) {
                if (state.local.goalie) {
                    if (state.local.catch < 3) {
                        state.local.catch++
                        return {n: "catch", v: angle}
                    } else state.local.catch = 0
                }
                if (Math.abs(angle) > 15) return {n: "turn", v: angle}
                return {n: "dash", v: 20}
            }
            state.next = true
        },

        kick(taken, state) { // Пинаем мяч
            state.next = true
            if (!taken.ball) return
            let dist = taken.ball.d
            if (dist > 0.5) return
            let goal = taken.goal
            let player = taken.teamOwn ? taken.teamOwn[0] : null
            let target
            if (goal && player)
                target = goal.d < player.d ? goal : player
            else if (goal) target = goal
            else if (player) target = player
            if (target)
                return {n: "kick", v: `${target.d * 2 + 40} ${target.a}`}
            let angle = 45
            if (state.local.goalTimer <= 3) {
                angle = state.variables.lastGoalAngle > 0 ? 45 : -45
            }
            return {n: "kick", v: `10 ${angle}`}
        },

        goBack(taken, state) { // Возврат к воротам
            state.next = false
            let goalOwn = taken.goalOwn
            if (!goalOwn) {
                if (state.timers.goalTimer <= 3)
                    return {n: "turn", v: state.variables.lastGoalOwnAngle > 0 ? 100 : -100}
                return {n: "turn", v: 60}
            }
            if (Math.abs(goalOwn.a) > 10)
                return {n: "turn", v: goalOwn.a}
            if (goalOwn.d < 2) {
                state.next = true
                return {n: "turn", v: 180}
            }
            return {n: "dash", v: goalOwn.d * 2 + 20}
        },

        lookAround(taken, state) { // Осматриваемся
            state.next = false
            state.synch = "lookAround!"
            if (!state.local.look)
                state.local.look = "left"
            switch (state.local.look) {
                case "left":
                    state.local.look = "center";
                    return {n: "turn", v: -60}
                case "center":
                    state.local.look = "right";
                    return {n: "turn", v: 60}
                case "right":
                    state.local.look = "back";
                    return {n: "turn", v: 60}
                case "back":
                    state.local.look = "left"
                    state.next = true
                    state.synch = undefined
                    return {n: "turn", v: -60}
                default:
                    state.next = true
            }
        },

        canIntercept(taken, state) { // Можем добежать первыми
            let ball = taken.ball
            let ballPrev = taken.ballPrev
            state.next = true
            if (!ball) return false
            if (!ballPrev) return true
            return ball.d <= ballPrev.d + 0.5;
        },

        runToBall(taken, state) { // Бежим к мячу
            state.next = false
            let ball = taken.ball
            if (!ball) return this.goBack(taken, state)
            if (ball.d < closeDist) {
                state.next = true
                return
            }
            if (Math.abs(ball.a) > 10)
                return {n: "turn", v: ball.a}
            return {n: "dash", v: 110}
        },

        ok(taken, state) { // Поворот к мячу, если его видно
            state.next = true;
            let ball = taken.ball
            if (!ball) return {n: "turn", v: 0}
            return {n: "turn", v: ball.a}
        },

        predict(taken, state) { // Предсказывание движения мяча
            state.next = false;
            if (!state.local.goalie || !taken.predictedPoint || !taken.playerCoords)
                return {n: "turn", v: 0}
            state.next = true;
            const predictedPoint = taken.predictedPoint
            const playerCoords = taken.playerCoords

            if (Math.abs(predictedPoint - playerCoords.y) < closeDist) {
                return this.runToBall(taken, state)
            }

            const angle = predictedPoint < playerCoords.y ? 90 : -90
            return {n: "dash", v: `100 ${angle}`}
        }
    }
}

module.exports = GoalieTA