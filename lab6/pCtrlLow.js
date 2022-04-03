const Taken = require('./taken')
const CTRL_LOW = {
	execute(input, controllers, team, side, zone) {
		const next = controllers[0] // Следующий уровень
		this.taken = Taken.setSee(input, team, side) // Выделение объектов

		// В зоне ли игрок
		if (this.taken.playerCoords && this.taken.playerCoords.x >= zone.xl && this.taken.playerCoords.x <= zone.xr &&
			this.taken.playerCoords.y >= zone.yd && this.taken.playerCoords.y <= zone.yu)
			this.taken.inZone = true
		else
			this.taken.inZone = false

		// В зоне ли мяч
		if (this.taken.ball && this.taken.ballCoords.x >= zone.xl && this.taken.ballCoords.x <= zone.xr &&
			this.taken.ballCoords.y >= zone.yd && this.taken.ballCoords.y <= zone.yu)
			this.taken.ballInZone = true
		else
			this.taken.ballInZone = false

		// Мяч рядом
		if (this.taken.ball && this.taken.ball.d < 0.5)
			this.taken.canKick = true
		else
			this.taken.canKick = false
		if (next) // Вызов следующего уровня
			return next.execute(this.taken, controllers.slice(1))
	}
}
module.exports = CTRL_LOW