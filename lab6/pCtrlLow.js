const Taken = require('./taken')
const CTRL_LOW = {
    execute(input, controllers, team, side, zone) {
        this.taken = Taken.setSee(input, team, side) // Выделение объектов

        // В зоне ли игрок
        if (this.taken.playerCoords && this.taken.playerCoords.x >= zone.xl && this.taken.playerCoords.x <= zone.xr &&
            this.taken.playerCoords.y >= zone.yu && this.taken.playerCoords.y <= zone.yd) {
            this.taken.inZone = true
        } else {
            this.taken.centerZoneX = zone.xc
            this.taken.centerZoneY = zone.yc
            this.taken.inZone = false
        }

        // В зоне ли мяч
        if (this.taken.ball) console.log(this.taken.ballCoords)
        this.taken.ballInZone = this.taken.ball && this.taken.ballCoords &&
            this.taken.ballCoords.x >= zone.xl && this.taken.ballCoords.x <= zone.xr &&
            this.taken.ballCoords.y >= zone.yu && this.taken.ballCoords.y <= zone.yd

        // Мяч рядом
        this.taken.canKick = this.taken.ball && this.taken.ball.d < 0.5
        if (this.taken.ballInZone) console.log(this.taken.ballCoords, zone, this.taken.canKick)

        const nextControllers = controllers["1"]
        if (!nextControllers) return null
        if (nextControllers.length === 2) {
            const next = nextControllers[0].execute(this.taken, controllers, "2", "L")
            if (next) return next
            else return nextControllers[1].execute(this.taken, controllers, "2", "R")
        }
        return nextControllers[0].execute(this.taken, controllers, "2", "L")
    }
}
module.exports = CTRL_LOW