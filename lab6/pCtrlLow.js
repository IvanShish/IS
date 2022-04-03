const Taken = require('./taken')
const CTRL_LOW = {
    execute(input, controllers, team, side, zone) {
        this.taken = Taken.setSee(input, team, side) // Выделение объектов

        // В зоне ли игрок
        if (this.taken.playerCoords && this.taken.playerCoords.x >= zone.xl && this.taken.playerCoords.x <= zone.xr &&
            this.taken.playerCoords.y >= zone.yl && this.taken.playerCoords.y <= zone.yu) {
            this.taken.inZone = true
        } else {
            this.taken.centerZoneX = (zone.xl + zone.xr) / 2
            this.taken.centerZoneY = (zone.yu + zone.yd) / 2
            this.taken.inZone = false
        }

        // В зоне ли мяч
        this.taken.ballInZone = this.taken.ball && this.taken.ballCoords &&
            this.taken.ballCoords.x >= zone.xl && this.taken.ballCoords.x <= zone.xr &&
            this.taken.ballCoords.y >= zone.yl && this.taken.ballCoords.y <= zone.yu;

        // Мяч рядом
        this.taken.canKick = this.taken.ball && this.taken.ball.d < 0.5;

        const nextControllers = controllers["1"]
        if (!nextControllers) return null
        if (nextControllers.length === 2) {
            const next = nextControllers[0].execute(this.taken, controllers, "2", "L")
            if (next) return next
            else {
                const next = nextControllers[1].execute(this.taken, controllers, "2", "R")
                console.log(31, next)
                return next
            }
        }
        return nextControllers[0].execute(this.taken, controllers, "2", "L")
    }
}
module.exports = CTRL_LOW