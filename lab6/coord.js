// Координаты каждого флага
const Flags = {
    ftl50: {x: -50, y: -39},
    ftl40: {x: -40, y: -39},
    ftl30: {x: -30, y: -39},
    ftl20: {x: -20, y: -39},
    ftl10: {x: -10, y: -39},
    ft0: {x: 0, y: -39},
    ftr10: {x: 10, y: -39},
    ftr20: {x: 20, y: -39},
    ftr30: {x: 30, y: -39},
    ftr40: {x: 40, y: -39},
    ftr50: {x: 50, y: -39},
    fbl50: {x: -50, y: 39},
    fbl40: {x: -40, y: 39},
    fbl30: {x: -30, y: 39},
    fbl20: {x: -20, y: 39},
    fbl10: {x: -10, y: 39},
    fb0: {x: 0, y: 39},
    fbr10: {x: 10, y: 39},
    fbr20: {x: 20, y: 39},
    fbr30: {x: 30, y: 39},
    fbr40: {x: 40, y: 39},
    fbr50: {x: 50, y: 39},
    flt30: {x: -57.5, y: -30},
    flt20: {x: -57.5, y: -20},
    flt10: {x: -57.5, y: -10},
    fl0: {x: -57.5, y: 0},
    flb10: {x: -57.5, y: 10},
    flb20: {x: -57.5, y: 20},
    flb30: {x: -57.7, y: 30},
    frt30: {x: 57.5, y: -30},
    frt20: {x: 57.5, y: -20},
    frt10: {x: 57.5, y: -10},
    fr0: {x: 57.5, y: 0},
    frb10: {x: 57.5, y: 10},
    frb20: {x: 57.5, y: 20},
    frb30: {x: 57.5, y: 30},
    fglt: {x: -52.5, y: -7.01},
    gl: {x: -52.5, y: 0},
    fglb: {x: -52.5, y: 7.01},
    fgrt: {x: 52.5, y: -7.01},
    gr: {x: 52.5, y: 0},
    fgrb: {x: 52.5, y: 7.01},
    fct: {x: 0, y: -34},
    fc: {x: 0, y: 0},
    fcb: {x: 0, y: 34},
    fplt: {x: -36, y: -20.15},
    fplc: {x: -36, y: 0},
    fplb: {x: -36, y: 20.15},
    fprt: {x: 36, y: -20.15},
    fprc: {x: 36, y: 0},
    fprb: {x: 36, y: 20.15},
    flb: {x: -52.5, y: 34},
    flt: {x: -52.5, y: -34},
    frb: {x: 52.5, y: 34},
    frt: {x: 52.5, y: -34}
}

module.exports = {
    Flags,

    checkPoint(d1, x1, y1, d2, x2, y2, x, y) { // Проверка возможности точки быть координатой
        const maxX = 57.5
        const maxY = 39
        const eps = 0.00001

        // Проверка лежит ли точка внутри поля
        if (x >= -maxX - eps && x <= maxX + eps && y >= -maxY - eps && y <= maxY + eps) {
            // Проверка на выполнение первоначальных условий системы
            b1 = Math.abs(d1 ** 2 - ((x - x1) ** 2 + (y - y1) ** 2)) < eps
            b2 = Math.abs(d2 ** 2 - ((x - x2) ** 2 + (y - y2) ** 2)) < eps
            return b1 && b2
        }
        return false
    },

    coord2flagsEqX(d1, x1, y1, d2, x2, y2) {
        y = (y2 ** 2 - y1 ** 2 + d1 ** 2 - d2 ** 2) / (2 * (y2 - y1))

        goodPoints = [] // Возможние координаты
        x = x1 + Math.sqrt(d1 ** 2 - (y - y1) ** 2)
        if (this.checkPoint(d1, x1, y1, d2, x2, y2, x, y))
            goodPoints.push({x: x, y: y})

        x = x1 - Math.sqrt(d1 ** 2 - (y - y1) ** 2)
        if (this.checkPoint(d1, x1, y1, d2, x2, y2, x, y))
            goodPoints.push({x: x, y: y})

        return goodPoints
    },

    coord2flagsEqY(d1, x1, y1, d2, x2, y2) {
        x = (x2 ** 2 - x1 ** 2 + d1 ** 2 - d2 ** 2) / (2 * (x2 - x1))

        goodPoints = [] // Возможние координаты
        y = y1 + Math.sqrt(d1 ** 2 - (x - x1) ** 2)
        if (this.checkPoint(d1, x1, y1, d2, x2, y2, x, y))
            goodPoints.push({x: x, y: y})

        y = y1 - Math.sqrt(d1 ** 2 - (x - x1) ** 2)
        if (this.checkPoint(d1, x1, y1, d2, x2, y2, x, y))
            goodPoints.push({x: x, y: y})

        return goodPoints
    },

    coord2flagsEqXgetY(d1, x1, y1, d2, x2, y2) {
        y = (y2 ** 2 - y1 ** 2 + d1 ** 2 - d2 ** 2) / (2 * (y2 - y1))
        return y
    },

    coord2flagsEqYgetX(d1, x1, y1, d2, x2, y2) {
        x = (x2 ** 2 - x1 ** 2 + d1 ** 2 - d2 ** 2) / (2 * (x2 - x1))
        return x
    },

    sqrtWithCheck(n) {
        eps = 0.00001
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

    toGrad(a) {
        return a * 180 / Math.PI
    },

    coordObj2flags(d1, x1, y1, alpha1, da, xa, ya, alphaa, d2, x2, y2, alpha2) {
        // Вычисление расстояний относительно противника
        da1 = Math.sqrt(d1 ** 2 + da ** 2 - 2 * d1 * da * Math.cos(this.toRad(Math.abs(alpha1 - alphaa))))
        da2 = Math.sqrt(d2 ** 2 + da ** 2 - 2 * d2 * da * Math.cos(this.toRad(Math.abs(alpha2 - alphaa))))

        p = this.coord3flags(da1, x1, y1, da, xa, ya, da2, x2, y2)
        if (p.x && p.y)
            return p
        p = this.coordObj1flags(d1, x1, y1, alpha1, da, xa, ya, alphaa)
        if (p.length === 1)
            return p[0]
        else
            return null
    },

    coordObj1flags(d1, x1, y1, alpha1, da, xa, ya, alphaa) {
        // Вычисление расстояний относительно противника
        da1 = Math.sqrt(d1 ** 2 + da ** 2 - 2 * d1 * da * Math.cos(this.toRad(Math.abs(alpha1 - alphaa))))

        return this.coord2flags(da1, x1, y1, da, xa, ya)
    },

    parseNames(p) {
        let objectsByName = {}
        for (let i = 1; i < p.length; i++) {
            value = p[i]
            name = ""
            for (let i of value.cmd.p)
                name += i
            objectsByName[name] = {d: value.p[0], a: value.p[1]}
        }
        return objectsByName
    },

    parseCoord(p) {
        // Сохранияем в массив points координаты, расстояние и угол флагов в удобном виде
        let points = []
        let obj = []
        for (let i = 1; i < p.length; i++) {
            value = p[i]
            if (value.cmd.p[0] === 'f' || value.cmd.p[0] === 'g') {
                flagName = ""
                for (let i of value.cmd.p)
                    flagName += i
                points.push({
                    x: Flags[flagName].x,
                    y: Flags[flagName].y,
                    d: value.p[0],
                    a: value.p[1],
                    flagName: flagName
                })
            } else {
                objName = ""
                for (let i of value.cmd.p)
                    objName += i
                obj.push({d: value.p[0], a: value.p[1], name: objName})
            }
        }

        return {flags: points, obj: obj}
    },

    selectFlags(p) {
        let indexes = null
        let minDist = Infinity

        // Перебираем флаги и находим 3 флага не на одной прямой и с минимальным расстоянием от игрока
        for (let i = 0; i < p.length; i++) {
            for (let j = i + 1; j < p.length; j++) {
                for (let k = j + 1; k < p.length; k++) {
                    if (p[i].x != p[j].x && p[i].y != p[j].y && p[i].x != p[k].x && p[i].y != p[k].y &&
                        p[j].x != p[k].x && p[j].y != p[j].k) {
                        currentSum = p[i].d + p[j].d + p[k].d
                        if (currentSum < minDist) {
                            minDist = currentSum
                            indexes = [i, j, k]
                        }
                    }
                }
            }
        }

        if (!indexes)
            return null
        return indexes
    },

    selectFlagsWithEq(p) {
        let indexes = {eqX: null, eqY: null}
        minDistX = Infinity
        minDistY = Infinity

        for (let i = 0; i < p.length; i++) {
            if (p[i].d > 40) continue
            for (let j = i + 1; j < p.length; j++) {
                if (p[j].d > 40) continue
                if (p[i].x === p[j].x && p[i].y !== p[j].y) {
                    currentSum = p[i].d + p[j].d
                    if (currentSum < minDistX) {
                        minDistX = currentSum
                        indexes.eqX = [i, j]
                    }
                } else if (p[i].y === p[j].y && p[i].x !== p[j].x) {
                    currentSum = p[i].d + p[j].d
                    if (currentSum < minDistY) {
                        minDistY = currentSum
                        indexes.eqY = [i, j]
                    }
                }
            }
        }
        return indexes
    },

    calculatePlayerCoord(notParsedP) {
        p = this.parseCoord(notParsedP) // Преобразование в удобные значения
        p = p.flags

        if (p.length < 2) { // Недостаточно флагов
            return null
        }

        if (p.length === 2) { // Вычисление координат через 2 флага
            flags = this.coord2flags(p[0].d, p[0].x, p[0].y, p[1].d, p[1].x, p[1].y)
            if (flags.length === 1) {
                flags = p[0]
                return flags
            }
            return null
        }

        // Есть минимум 3 флага
        let resX, resY

        let indexes = this.selectFlagsWithEq(p)
        if (indexes.eqX) {
            resY = this.coord2flagsEqXgetY(p[indexes.eqX[0]].d, p[indexes.eqX[0]].x, p[indexes.eqX[0]].y,
                p[indexes.eqX[1]].d, p[indexes.eqX[1]].x, p[indexes.eqX[1]].y)
        }
        if (indexes.eqY) {
            resX = this.coord2flagsEqYgetX(p[indexes.eqY[0]].d, p[indexes.eqY[0]].x, p[indexes.eqY[0]].y,
                p[indexes.eqY[1]].d, p[indexes.eqY[1]].x, p[indexes.eqY[1]].y)
        }

        if (!resX || !resY) {
            indexes = this.selectFlags(p)
            if (!indexes) { // Если не получилось
                coord = this.coord3flagsEqCoord(p[0].d, p[0].x, p[0].y, p[1].d, p[1].x, p[1].y, p[2].d, p[2].x, p[2].y)
                if (coord) {
                    if (!resX) resX = coord.x
                    if (!resY) resY = coord.y
                }
            } else {
                coord = this.coord3flags(p[indexes[0]].d, p[indexes[0]].x, p[indexes[0]].y, p[indexes[1]].d,
                    p[indexes[1]].x, p[indexes[1]].y, p[indexes[2]].d, p[indexes[2]].x, p[indexes[2]].y)
                if (coord) {
                    if (!resX) resX = coord.x
                    if (!resY) resY = coord.y
                }
            }
        }

        return {x: resX, y: resY}
    },

    calculateObjCoord(notParsedP, playerX, playerY, objName) {
        p = this.parseCoord(notParsedP) // Преобразование в удобные значения
        let objects = p.obj
        let obj = null
        for (let v of objects) {
            if (v.name === objName) {
                obj = v
                break
            }
        }
        if (!obj) {
            return null
        }

        p = p.flags
        let coord = null

        if (p.length < 1) {
            return null
        } else if (p.length === 1) { // Недостаточно флагов
            coord = this.coordObj1flags(p[0].d, p[0].x, p[0].y, p[0].a, obj.d, playerX, playerY, obj.a)
            return coord
        } else {
            p.sort((x, y) => {
                return x.d > y.d
            })
            coord = this.coordObj2flags(p[0].d, p[0].x, p[0].y, p[0].a, obj.d, playerX, playerY, obj.a,
                p[1].d, p[1].x, p[1].y, p[1].a)
            return coord
        }
    },

    calculateClosestPlayerToBall(notParsedP, playerX, playerY) {
        p = this.parseCoord(notParsedP) // Преобразование в удобные значения
        let objects = p.obj
        let objs = []
        for (let v of objects) {
            if (v.name.startsWith("p")) {
                objs.push(v)
            }
        }
        if (objs.length === 0) {
            return null
        }
        p = p.flags
        let coords = []

        if (p.length < 1) {
            return null
        }

        if (p.length === 1) { // Вычисление координат через 2 флага
            for (let obj of objs) {
                coord = this.coordObj1flags(p[0].d, p[0].x, p[0].y, p[0].a,
                    obj.d, playerX, playerY, obj.a)
                if (coord) {
                    coord.d = obj.d
                    coord.a = obj.a
                    coords.push(coord)
                }
            }
        } else {
            p.sort((x, y) => {
                return x.d > y.d
            })
            for (let obj of objs) {
                if (p[0] && p[1]) {
                    coord = this.coordObj2flags(p[0].d, p[0].x, p[0].y, p[0].a, obj.d,
                        playerX, playerY, obj.a, p[1].d, p[1].x, p[1].y, p[1].a)
                }
                if (coord) {
                    coord.d = obj.d
                    coord.a = obj.a
                    coords.push(coord)
                }
            }
        }

        if (!coords || coords.length === 0) return null

        ballCoord = this.calculateObjCoord(notParsedP, playerX, playerY, 'b')
        if (!ballCoord)
            ballCoord = this.calculateObjCoord(notParsedP, playerX, playerY, 'B')
        if (!ballCoord)
            return null
        coords.sort((x, y) => {
            return (x.x - ballCoord.x) ** 2 + (x.y - ballCoord.y) ** 2 > (y.x - ballCoord.x) ** 2 + (y.y - ballCoord.y) ** 2
        })
        return coords[0]
    },

    calculateAngleToPoint(notParsedP, playerX, playerY, pointX, pointY) {
        p = this.parseCoord(notParsedP)
        p = p.flags
        if (p.length === 0) {
            return null
        }
        flag = p[0]

        dist = Math.sqrt((pointX - playerX) ** 2 + (pointY - playerY) ** 2)
        anglePart = Math.acos(((pointX - playerX) * (flag.x - playerX) + (pointY - playerY) * (flag.y - playerY)) / (flag.d * dist))

        k = (flag.y - playerY) / (flag.x - playerX)
        b = flag.y - k * flag.x
        let isUp = pointY > k * pointX + b
        if (k > 0) isUp = !isUp
        if (!isUp) {
            anglePart *= -1
        }

        return flag.a + this.toGrad(anglePart)

    }
}