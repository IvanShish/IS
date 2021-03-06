const farDist = 20, closeDist = 1.5, nearDist = 10,
    GOALIE_ZONE_X = 49, GOALIE_ZONE_Y = 7

const GoalieTA = {
    current: "start", // Текущее состояние автомата
    state: { // Описание состояния
        variables: {
            dist: null, lastBallAngle: 60, // Переменные
            lastGoalOwnAngle: 60, lastGoalAngle: 60
        },
        timers: {t: 0}, // Таймеры
        next: true, // Нужен переход на следующее состояние
        synch: undefined, // Текущее действие
        local: {goalie: true, catch: 0}, // Внутренние переменные для методов
    },

    nodes: { /* Узлы автомата, в каждом узле: имя и узлы, на кото-
рые есть переходы */
        start: {n: "start", e: ["close", "near", "far"]},
        close: {n: "close", e: ["catch"]},
        catch: {n: "catch", e: ["kick"]},
        kick: {n: "kick", e: ["start"]},
        far: {n: "far", e: ["start"]},
        near: {n: "near", e: ["intercept", "start"]},
        predict: {n: "predict", e: ["start"]},
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
            synch: "goBack!", assign: [{n: "t", v: 0, type: "timer"}]
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
                synch: "farTurn!"
            }
        ],
        near_intercept: [{synch: "canIntercept?"}],
        near_start: [{
            synch: "predict!",
            assign: [{n: "t", v: 0, type: "timer"}]
        }],
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
                state.variables.dist = Math.abs(taken.ball.d)
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
                // console.log('catch !taken.ball')
                return
            }
            let angle = taken.ball.a
            let dist = taken.ball.d
            state.next = false
            if (dist > 0.5 && dist <= closeDist) {
                if (state.local.catch < 3) {
                    console.log('catch', angle, dist)
                    state.local.catch++
                    return {n: "catch", v: angle}
                } else state.local.catch = 0
                if (Math.abs(angle) > 15) return {n: "turn", v: angle}
                console.log('dash to ball')
                return {n: "dash", v: 5}
            }
            // console.log("catch dist <= 0.5")
            state.next = true
        },

        kick(taken, state) { // Пинаем мяч
            state.next = true
            if (!taken.ball) {
                // console.log("kick !taken.ball ", state.local.ballTimer)
                if (state.local.ballTimer <= 3) {
                    const angle = state.variables.lastGoalAngle > 0 ? 45 : -45
                    return {n: "turn", v: angle}
                }
                return
            }
            let dist = taken.ball.d
            if (dist > 0.5) return
            let goal = taken.goal
            let player = taken.teamOwn ? taken.teamOwn[0] : null
            let closestPlayerToBall = taken.closestPlayerToBall
            let target
            if (goal && player)
                target = goal.d < player.d ? goal : player
            else if (goal) target = goal
            else if (player) target = player
            if (closestPlayerToBall && closestPlayerToBall.d < 5)
                target = {d: 25, a: 0}
            console.log('kick')
            if (target)
                return {n: "kick", v: `${target.d * 2 + 40} ${target.a}`}
            // let angle = 45
            // if (state.local.goalTimer <= 3) {
            //     angle = state.variables.lastGoalAngle > 0 ? 45 : -45
            // }
            // return {n: "kick", v: `10 ${angle}`}
            return {n: "kick", v: `100 0`}
        },

        goBack(taken, state) { // Возврат к воротам
            state.next = false
            let goalOwn = taken.goalOwn
            console.log("goBack")
            if (!goalOwn) {
                if (state.timers.goalOwnTimer <= 3)
                    return {n: "turn", v: state.variables.lastGoalOwnAngle > 0 ? 100 : -100}
                return {n: "turn", v: 60}
            }
            if (Math.abs(goalOwn.a) > 10)
                return {n: "turn", v: goalOwn.a}
            if (goalOwn.d < 1) {
                state.next = true
                return {n: "turn", v: 180}
            }
            return {n: "dash", v: 100}
        },

        lookAround(taken, state) { // Осматриваемся
            state.next = false
            state.synch = "lookAround!"
            console.log("lookAround ", state.local.look)
            state.next = true
            // return {n: "turn", v: 60}
            if (!state.local.look)
                state.local.look = "left"
            switch (state.local.look) {
                case "left":
                    state.local.look = "center";
                    return {n: "turn", v: 90}
                case "center":
                    state.local.look = "right";
                    return {n: "turn", v: 90}
                case "right":
                    state.local.look = "back";
                    return {n: "turn", v: 90}
                case "back":
                    state.local.look = "left"
                    state.next = true
                    state.synch = undefined
                    return {n: "turn", v: 90}
                default:
                    state.next = true
            }
        },

        canIntercept(taken, state) { // Можем добежать первыми
            let ball = taken.ball
            let closestPlayerToBall = taken.closestPlayerToBall
            let predictedPoint = taken.predictedPoint
            let playerCoords = taken.playerCoords
            state.next = true
            if (!ball || !closestPlayerToBall ||
                !predictedPoint || !playerCoords || ball.d > nearDist)
                return false
            if (predictedPoint === 1000 ||
                Math.abs(predictedPoint - playerCoords.y) < closeDist) {
                return true
            }
            return ball.d <= closestPlayerToBall.d + 0.5;
        },

        runToBall(taken, state) { // Бежим к мячу
            state.next = false
            let ball = taken.ball
            if (!ball) {
                if (state.local.ballTimer <= 3) {
                    const angle = state.variables.lastGoalAngle > 0 ? 45 : -45
                    return {n: "turn", v: angle}
                }
                return this.goBack(taken, state)
            }
            if (ball.d < closeDist) {
                state.next = true
                console.log("runToBall next")
                return
            }
            if (Math.abs(ball.a) > 10) {
                return {n: "turn", v: ball.a}
            }
            return {n: "dash", v: 110}
        },

        farTurn(taken, state) { // Поворот к мячу, если его He видно
            state.next = false
            const playerCoords = taken.playerCoords
            if (!playerCoords) {
                // console.log('252 lookAround')
                return this.lookAround(taken, state)
            }
            if (playerCoords.x < GOALIE_ZONE_X ||
                playerCoords.x > 53 ||
                playerCoords.y < -GOALIE_ZONE_Y ||
                playerCoords.y > GOALIE_ZONE_Y) {
                return this.goBack(taken, state)
            }
            const ball = taken.ball
            if (!ball) {
                if (state.local.ballTimer <= 3) {
                    state.next = true
                    const angle = state.variables.lastGoalAngle > 0 ? 45 : -45
                    return {n: "turn", v: angle}
                }
                // console.log("267 lookAround")
                return this.lookAround(taken, state)
            }
            state.next = true
            console.log("turn to ball")
            return {n: "turn", v: ball.a}
        },

        predict(taken, state) { // Предсказывание движения мяча
            state.next = true
            const predictedPoint = taken.predictedPoint
            console.log("predict: ", predictedPoint)
            if (!predictedPoint || !taken.playerCoords) {
                const ball = taken.ball
                if (!ball) return {n: "turn", v: 60}
                return {n: "turn", v: ball.a}
            }
            const playerCoords = taken.playerCoords

            if (predictedPoint === 1000 || Math.abs(predictedPoint - playerCoords.y) < closeDist) {
                const ball = taken.ball
                if (!ball) return {n: "turn", v: 60}
                return {n: "turn", v: ball.a}
            }

            const angle = predictedPoint < playerCoords.y ? 90 : -90
            return {n: "dash", v: `100 ${angle}`}
        }
    }
}

module.exports = GoalieTA