const FL = "flag", KI = "kick"
const epsd = 3, epsa = 20
const DT = {
	state: {
		next: 0,
		// sequence: [{act: FL, fl: "frb"},
		// 	{act: KI, fl: "b", goal: "gr"}],
		sequence: [{act: FL, fl: "frb"}, {act: KI, fl: "b", goal: "gr"}],
		leaderPos: null,
		canBeLeader: true,
		defLeader: false,
		sign: -1,
		command: null,
	},
	root: {
		exec(mgr, state) { state.action =
			state.sequence[state.next]; state.command = null},
		next: "checkDefLeader",
	},
	checkDefLeader: {
		condition: (mgr, state) => state.defLeader,
		trueCond: "goalVisible",
		falseCond: "checkNumPlayers",
	},
	checkNumPlayers: {
		condition: (mgr, state) => mgr.numPlayers() === 0,
		trueCond: "checkCanBeLeader",
		falseCond: "calculateLeaderPosition",
	},
	checkCanBeLeader: {
		condition: (mgr, state) => state.canBeLeader,
		trueCond: "goalVisible",
		falseCond: "rotate",
	},

	goalVisible: {
		condition: (mgr, state) => mgr.getVisible(state.action.fl),
		trueCond: "rootNext",
		falseCond: "rotate",
	},
	rotate: {
		exec(mgr, state) { state.command = {n: "turn", v: "90"} },
		next: "sendCommand",
	},
	rootNext: {
		condition: (mgr, state) => state.action.act == FL,
		trueCond: "flagSeek",
		falseCond: "ballSeek",
	},
	flagSeek: {
		condition: (mgr, state) => 2 >
			mgr.getDistance(state.action.fl),
		trueCond: "closeFlag",
		falseCond: "farGoal",
	},
	closeFlag: {
		exec(mgr, state)
		{if (state.canBeLeader) state.defLeader = true;
			state.next++; state.action = state.sequence[state.next]},
		next: "goalVisible",
	},
	farGoal: {
		condition:
			(mgr, state) => Math.abs(mgr.getAngle(state.action.fl)) > 4,
		trueCond: "rotateToGoal",
		falseCond: "runToGoal",
	},
	rotateToGoal: {
		exec(mgr, state) { state.command = {n: "turn", v:
				mgr.getAngle(state.action.fl)} },
		next: "sendCommand",
	},
	runToGoal: {
		exec(mgr, state) { state.command = {n: "dash", v: 100} },
		next: "sendCommand",
	},
	sendCommand: {
		command: (mgr, state) => state.command
	},
	ballSeek: {
		condition:
			(mgr, state) => 0.5 > mgr.getDistance(state.action.fl),
		trueCond: "closeBall",
		falseCond: "farGoal",
	},
	closeBall: {
		condition:
			(mgr, state) => mgr.getVisible(state.action.goal),
		trueCond: "ballGoalVisible",
		falseCond: "ballGoalInvisible",
	},
	ballGoalVisible: {
		exec(mgr, state) { state.command =
			{n: "kick", v: `100 ${mgr.getAngle(state.action.goal)}`}},
		next: "sendCommand",
	},
	ballGoalInvisible: {
		exec(mgr, state) {state.command = {n: "kick", v: "10 45"}},
		next: "sendCommand",
	},


	calculateLeaderPosition: {
		exec(mgr, state) {state.leaderPos = mgr.calculateMaxPosition()},
		next: "checkLeaderNearFlag",
	},
	checkLeaderNearFlag: {
		condition: (mgr, state) =>
			Math.abs(mgr.getDistance(state.action.fl) - state.leaderPos.d) < epsd &&
			Math.abs(mgr.getAngle(state.action.fl.a) - state.leaderPos.a) < epsa,
		trueCond: "changeCanBeLeader",
		falseCond: "leftOrRight",
	},
	changeCanBeLeader: {
		exec(mgr, state) {state.canBeLeader = false},
		next: "leftOrRight",
	},
	leftOrRight: {
		condition: (mgr, state) => state.leaderPos.a < 0,
		trueCond: "ChangeSignPlus",
		falseCond: "ChangeSignMinus",
	},
	ChangeSignPlus: {
		exec(mgr, state) {state.sign = 1},
		next: "checkTooClose",
	},
	ChangeSignMinus: {
		exec(mgr, state) {state.sign = -1},
		next: "checkTooClose",
	},
	checkTooClose: {
		condition: (mgr, state) => state.leaderPos.d < 1 &&
			Math.abs(state.leaderPos.a) < 40,
		trueCond: "closeRotate",
		falseCond: "checkTooFar",
	},
	closeRotate: {
		exec(mgr, state) {state.command = {n: 'turn', v: "30"}},
		next: "sendCommand",
	},
	checkTooFar: {
		condition: (mgr, state) => state.leaderPos.d > 10,
		trueCond: "checkAngleFar",
		falseCond: "checkAngle",
	},
	checkAngleFar: {
		condition: (mgr, state) => Math.abs(state.leaderPos.a) > 15 || 
		Math.abs(state.leaderPos.a) < 7,
		trueCond: "farRotate",
		falseCond: "farDash",
	},
	farRotate: {
		exec(mgr, state) {state.command = {n: 'turn',
			v: state.leaderPos.a + state.sign*10}},
		next: "sendCommand",
	},
	farDash: {
		exec(mgr, state) {state.command = {n: 'dash', v: 80}},
		next: "sendCommand",
	},
	checkAngle: {
		condition: (mgr, state) => Math.abs(state.leaderPos.a) > 40 ||
			Math.abs(state.leaderPos.a) < 25,
		trueCond: "normalRotate",
		falseCond: "checkMiddle",
	},
	normalRotate: {
		exec(mgr, state) {state.command = {n: 'turn', v: state.leaderPos.a + state.sign * 30}},
		next: "sendCommand",
	},
	checkMiddle: {
		condition: (mgr, state) => state.leaderPos.d < 7,
		trueCond: "middleDash",
		falseCond: "normalDash",
	},
	middleDash: {
		exec(mgr, state) {state.command = {n: 'dash', v: 20}},
		next: "sendCommand",
	},
	normalDash: {
		exec(mgr, state) {state.command = {n: 'dash', v: 40}},
		next: "sendCommand",
	},
}

module.exports = DT