const Taken = require('./taken')
const CTRL_LOW = {
    execute(input, controllers, team, side) {
        const next = controllers[0] // Следующий уровень
        this.taken = Taken.setSee(input, team, side) // Выделение объектов
        this.taken.canKick = this.taken.ball && this.taken.ball.d < 0.5
        this.taken.canCatch = this.taken.ball && this.taken.ball.d < 1.5
        if (next) // Вызов следующего уровня
            return next.execute(this.taken, controllers.slice(1))
    }
}
module.exports = CTRL_LOW