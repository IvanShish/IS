module.exports = {
    checkPoint(d1, x1, y1, d2, x2, y2, x, y) { // Проверка возможности точки быть координатой
        const maxX = 57.5
        const maxY = 39
        const eps = 0.00001

        if (x >= -maxX - eps && x <= maxX + eps && y >= -maxY - eps && y <= maxY + eps) { // Проверка лежит ли точка внутри поля
            // Проверка на выполнение первоначальных условий системы
            b1 = Math.abs(d1 ** 2 - ((x - x1) ** 2 + (y - y1) ** 2)) < eps
            b2 = Math.abs(d2 ** 2 - ((x - x2) ** 2 + (y - y2) ** 2)) < eps
            return b1 && b2
        }
        return false
    },

    coord2flagsEqX(d1, x1, y1, d2, x2, y2) {
        let y = (y2 ** 2 - y1 ** 2 + d1 ** 2 - d2 ** 2) / (2 * (y2 - y1))

        let goodPoints = [] // Возможные координаты
        let x = x1 + Math.sqrt(d1 ** 2 - (y - y1) ** 2)
        if (this.checkPoint(d1, x1, y1, d2, x2, y2, x, y))
            goodPoints.push({x: x, y: y})

        x = x1 - Math.sqrt(d1 ** 2 - (y - y1) ** 2)
        if (this.checkPoint(d1, x1, y1, d2, x2, y2, x, y))
            goodPoints.push({x: x, y: y})

        return goodPoints
    },

    coord2flagsEqY(d1, x1, y1, d2, x2, y2) {
        let x = (x2 ** 2 - x1 ** 2 + d1 ** 2 - d2 ** 2) / (2 * (x2 - x1))

        let goodPoints = [] // Возможние координаты
        y = y1 + Math.sqrt(d1 ** 2 - (x - x1) ** 2)
        if (this.checkPoint(d1, x1, y1, d2, x2, y2, x, y))
            goodPoints.push({x: x, y: y})

        let y = y1 - Math.sqrt(d1 ** 2 - (x - x1) ** 2)
        if (this.checkPoint(d1, x1, y1, d2, x2, y2, x, y))
            goodPoints.push({x: x, y: y})

        return goodPoints
    },

    sqrtWithCheck(n) {
        let eps = 0.00001
        if (Math.abs(n) < eps)
            return 0
        return n
    },

    coord2flags(d1, x1, y1, d2, x2, y2) {
        if (x1 === x2)
            return this.coord2flagsEqX(d1, x1, y1, d2, x2, y2)

        if (y1 === y2)
            return this.coord2flagsEqY(d1, x1, y1, d2, x2, y2)

        alpha = (y1 - y2) / (x2 - x1)
        beta = (y2 ** 2 - y1 ** 2 + x2 ** 2 - x1 ** 2 + d1 ** 2 - d2 ** 2) / (2 * (x2 - x1))
        a = alpha ** 2 + 1
        b = -2 * (alpha * (x1 - beta) + y1)
        c = (x1 - beta) ** 2 + y1 ** 2 - d1 ** 2

        goodPoints = [] // Возможние координаты
        y = (-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a)
        x = x1 + this.sqrtWithCheck(d1 ** 2 - (y - y1) ** 2)
        if (this.checkPoint(d1, x1, y1, d2, x2, y2, x, y))
            goodPoints.push({x: x, y: y})
        x = x1 - this.sqrtWithCheck(d1 ** 2 - (y - y1) ** 2)
        if (this.checkPoint(d1, x1, y1, d2, x2, y2, x, y))
            goodPoints.push({x: x, y: y})

        y = (-b - Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a)
        x = x1 + this.sqrtWithCheck(d1 ** 2 - (y - y1) ** 2)
        if (this.checkPoint(d1, x1, y1, d2, x2, y2, x, y))
            goodPoints.push({x: x, y: y})
        x = x1 - this.sqrtWithCheck(d1 ** 2 - (y - y1) ** 2)
        if (this.checkPoint(d1, x1, y1, d2, x2, y2, x, y))
            goodPoints.push({x: x, y: y})

        return goodPoints
    },

    coord3flags(d1, x1, y1, d2, x2, y2, d3, x3, y3) {
        alpha1 = (y1 - y2) / (x2 - x1)
        beta1 = (y2 ** 2 - y1 ** 2 + x2 ** 2 - x1 ** 2 + d1 ** 2 - d2 ** 2) / (2 * (x2 - x1))
        alpha2 = (y1 - y3) / (x3 - x1)
        beta2 = (y3 ** 2 - y1 ** 2 + x3 ** 2 - x1 ** 2 + d1 ** 2 - d3 ** 2) / (2 * (x3 - x1))

        y = (beta1 - beta2) / (alpha2 - alpha1)
        x = alpha1 * (beta1 - beta2) / (alpha2 - alpha1) + beta1

        return {x: x, y: y}
    },

    coord3flagsEqCoord(d1, x1, y1, d2, x2, y2, d3, x3, y3) {
        goodPoints = this.coord2flags(d1, x1, y1, d2, x2, y2) // Вычисляем возможные координаты через 2 флага

        if (goodPoints.length === 0)
            return null

        // С помощью третьего флага находим правильные координаты
        minError = Infinity
        let indexMinError
        for (let i = 0; i < goodPoints.length; i++) {
            x = goodPoints[i].x
            y = goodPoints[i].y
            curError = Math.abs((x - x3) ** 2 + (y - y3) ** 2 - d3 ** 2)
            if (curError < minError) {
                minError = curError
                indexMinError = i
            }
        }
        return goodPoints[indexMinError]
    },

    toRad(a) {
        return Math.PI * a / 180
    },

    coordEnemy2flags(d1, x1, y1, alpha1, da, xa, ya, alphaa, d2, x2, y2, alpha2) {
        // Вычисление расстояний относительно противника
        da1 = Math.sqrt(d1 ** 2 + da ** 2 - 2 * d1 * da * Math.cos(this.toRad(Math.abs(alpha1 - alphaa))))
        da2 = Math.sqrt(d2 ** 2 + da ** 2 - 2 * d2 * da * Math.cos(this.toRad(Math.abs(alpha2 - alphaa))))

        p = this.coord3flags(da1, x1, y1, da, xa, ya, da2, x2, y2)
        if (p)
            return p
        p = this.coordEnemy1flags(d1, x1, y1, alpha1, da, xa, ya, alphaa)
        if (p.length === 1)
            return p[0]
        else
            return null
    },

    coordEnemy1flags(d1, x1, y1, alpha1, da, xa, ya, alphaa) {
        // Вычисление расстояний относительно противника
        da1 = Math.sqrt(d1 ** 2 + da ** 2 - 2 * d1 * da * Math.cos(this.toRad(Math.abs(alpha1 - alphaa))))

        return this.coord2flags(da1, x1, y1, da, xa, ya)
    },

    parseCoord(p) {
        // Координаты каждого флага
        const Flags = {
            ftl50: {x: -50, y: 39}, ftl40: {x: -40, y: 39},
            ftl30: {x: -30, y: 39}, ftl20: {x: -20, y: 39},
            ftl10: {x: -10, y: 39}, ft0: {x: 0, y: 39},
            ftr10: {x: 10, y: 39}, ftr20: {x: 20, y: 39},
            ftr30: {x: 30, y: 39}, ftr40: {x: 40, y: 39},
            ftr50: {x: 50, y: 39}, fbl50: {x: -50, y: -39},
            fbl40: {x: -40, y: -39}, fbl30: {x: -30, y: -39},
            fbl20: {x: -20, y: -39}, fbl10: {x: -10, y: -39},
            fb0: {x: 0, y: -39}, fbr10: {x: 10, y: -39},
            fbr20: {x: 20, y: -39}, fbr30: {x: 30, y: -39},
            fbr40: {x: 40, y: -39}, fbr50: {x: 50, y: -39},
            flt30: {x: -57.5, y: 30}, flt20: {x: -57.5, y: 20},
            flt10: {x: -57.5, y: 10}, fl0: {x: -57.5, y: 0},
            flb10: {x: -57.5, y: -10}, flb20: {x: -57.5, y: -20},
            flb30: {x: -57.5, y: -30}, frt30: {x: 57.5, y: 30},
            frt20: {x: 57.5, y: 20}, frt10: {x: 57.5, y: 10},
            fr0: {x: 57.5, y: 0}, frb10: {x: 57.5, y: -10},
            frb20: {x: 57.5, y: -20}, frb30: {x: 57.5, y: -30},
            fglt: {x: -52.5, y: 7.01}, fglb: {x: -52.5, y: -7.01},
            gl: {x: -52.5, y: 0}, gr: {x: 52.5, y: 0}, fc: {x: 0, y: 0},
            fplt: {x: -36, y: 20.15}, fplc: {x: -36, y: 0},
            fplb: {x: -36, y: -20.15}, fgrt: {x: 52.5, y: 7.01},
            fgrb: {x: 52.5, y: -7.01}, fprt: {x: 36, y: 20.15},
            fprc: {x: 36, y: 0}, fprb: {x: 36, y: -20.15},
            flt: {x: -52.5, y: 34}, fct: {x: 0, y: 34},
            frt: {x: 52.5, y: 34}, flb: {x: -52.5, y: -34},
            fcb: {x: 0, y: -34}, frb: {x: 52.5, y: -34}
        }

        p.shift()
        // Сохранияем в массив points координаты, расстояние и угол флагов в удобном виде
        let points = []
        // В массив players сохраняем расстояние и угол игроков
        let players = []
        for (let value of p) {
            if (value.cmd.p[0] === 'f' || value.cmd.p[0] === 'g') {
                flagName = ""
                for (let i of value.cmd.p)
                    flagName += i
                points.push({x: Flags[flagName].x, y: Flags[flagName].y, d: value.p[0], a: value.p[1]})
            } else if (value.cmd.p[0] === 'p') {
                players.push({d: value.p[0], a: value.p[1]})
            }
        }

        return {flags: points, players: players}
    },

    selectFlags(p) {
        let indexes
        forFlag = true

        for (let i = 0; i < p.length; i++) {
            if (forFlag) {
                for (let j = i + 1; j < p.length; j++) {
                    if (forFlag) {
                        for (let k = j + 1; k < p.length; k++) {
                            if (p[i].x !== p[j].x && p[i].y !== p[j].y && p[i].x !== p[k].x && p[i].y !== p[k].y) {
                                indexes = [i, j, k]
                                forFlag = false
                                break
                            }
                        }
                    }
                }
            }
        }

        if (forFlag)
            return null
        return indexes
    },

    calculateCoord(p) {
        p = this.parseCoord(p) // Преобразование в удобные значения
        pl = p.players
        p = p.flags

        if (p.length < 2) { // Недостаточно флагов
            return {flags: null, players: null}
        }

        if (p.length === 2) { // Вычисление координат через 2 флага
            flags = this.coord2flags(p[0].d, p[0].x, p[0].y, p[1].d, p[1].x, p[1].y)
            if (flags.length === 1) {
                flags = p[0]
                if (pl.length > 0) {
                    pl = this.coordEnemy2flags(p[0].d, p[0].x, p[0].y, p[0].a, pl[0].d, flags.x, flags.y,
                        pl[0].a, p[1].d, p[1].x, p[1].y, p[1].a)
                }
                return {flags: flags, players: pl}
            }
            return {flags: null, players: null}
        }

        // Есть минимум 3 флага
        let indexes = this.selectFlags(p) // Пытаемя найти 3 флага не на одной прямой

        if (!indexes) { // Если не получилось
            flags = this.coord3flagsEqCoord(p[0].d, p[0].x, p[0].y, p[1].d, p[1].x, p[1].y, p[2].d, p[2].x, p[2].y)
            if (pl.length > 0) {
                pl = this.coordEnemy2flags(p[0].d, p[0].x, p[0].y, p[0].a, pl[0].d, flags.x, flags.y,
                    pl[0].a, p[1].d, p[1].x, p[1].y, p[1].a)
            }
        } else {
            flags = this.coord3flags(p[indexes[0]].d, p[indexes[0]].x, p[indexes[0]].y, p[indexes[1]].d,
                p[indexes[1]].x, p[indexes[1]].y, p[indexes[2]].d, p[indexes[2]].x, p[indexes[2]].y)
            if (pl.length > 0) {
                pl = this.coordEnemy2flags(p[indexes[0]].d, p[indexes[0]].x, p[indexes[0]].y, p[indexes[0]].a, pl[0].d,
                    flags.x, flags.y, pl[0].a, p[indexes[1]].d, p[indexes[1]].x, p[indexes[1]].y, p[indexes[1]].a)
            }
        }

        return {flags: flags, players: pl}
    }
}