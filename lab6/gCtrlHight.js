const CTRL_HIGH = {
	execute(input) {
		const immediate = this.immidiateReaction(input)
		if (immediate) return immediate
		const defend = this.defendGoal(input)
		if (defend) return defend
		if (this.last == "defend") input.newAction = "return"
		this.last = "previous"
	},
	immidiateReaction(input) { // Немедленная реакция
		if (input.canKick) {
			this.last = "kick"
			if (input.goal)
				return {n: "kick", v: `110 ${input.goal.a}`}
			return {n: "kick", v: `10 45`}
		}
	},
	defendGoal(input) { // Защита ворот
		if (input.ball) {
			if (!input.playerCoords || Math.abs(input.playerCoords.x) < 30 ||
			 Math.abs(input.playerCoords.y) > 20 || input.ball.d > 20) {
				return null
			}
			const close = input.closestPlayerToBall
			if ((close && close.d + 1 > input.ball.d) || !close) {
				this.last = "defend"
				if (Math.abs(input.ball.a) > 5)
					return {n: "turn", v: input.ball.a}
				return {n: "dash", v: 110}
			}
		}
	},
}
module.exports = CTRL_HIGH