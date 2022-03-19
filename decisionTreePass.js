const FL = "flag", KI = "kick", N = 10
const DT = {
	state: {
		next: 0,
		n: 0,
		sequence: [{act: FL, fl: "fplc"},
		{act: KI, fl: "b", goal: "gr"},
		{act: "pass"},
		{act: "say"},
		{act: "wait"}],
		command: null
	},
	root: {
		exec(mgr, state) { state.action =
		state.sequence[state.next]; state.command = null},
		next: "isPass",
	},
	isPass: {
		condition: (mgr, state) => state.action.act === "pass",
		trueCond: "doPass",
		falseCond: "isSay",
	},
	isSay: {
		condition: (mgr, state) => state.action.act === "say",
		trueCond: "doSay",
		falseCond: "isWait",
	},
	isWait: {
		condition: (mgr, state) => state.action.act === "wait",
		trueCond: "doWait",
		falseCond: "goalVisible",
	},
	doPass: {
		condition: (mgr, state) => !!mgr.calculatePosition(),
		trueCond: "playerVisible",
		falseCond: "playerInvisible",
	},
	playerVisible: {
		exec(mgr, state) { state.command =
		{n: "kick", v: `40 ${mgr.calculatePosition().a}`};
		state.next++; state.action = state.sequence[state.next];
		state.n = 0},
		next: "sendCommand",
	},
	playerInvisible: {
		condition: (mgr, state) => state.n++ < N,
		trueCond: "sendCommand",
		falseCond: "rotateInvisible",
	},
	rotateInvisible: {
		exec(mgr, state) {state.command = {n: "kick", v: "10 45"};
		state.next--; state.action = state.sequence[state.next]},
		next: "sendCommand",
	},
	doSay: {
		exec(mgr, state) {state.command = {n: "say", v: "go"};
		state.next++; state.action = state.sequence[state.next]},
		next: "sendCommand",
	},
	doWait: {
		condition: (mgr, state) => mgr.wasGoalScored(),
		trueCond: "movePlayer",
		falseCond: "sendCommand",
	},
	movePlayer: {
        exec(mgr, state) {
        	console.log(mgr.getAgentInitCoords());
            state.next = 0;
            const coords = mgr.getAgentInitCoords();
            state.command = {n: 'move', v: `${coords.x} ${coords.y}`}
        },
        next: "sendCommand"
    },
	goalVisible: {
		condition: (mgr, state) => mgr.getVisible(state.action.fl),
		trueCond: "rootNext",
		falseCond: "rotate",
	},
	rotate: {
		exec(mgr, state) { state.command = {n: "turn", v: "90"}},
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
		{state.next++; state.action = state.sequence[state.next]},
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
		exec(mgr, state)
		{state.next++; state.action = state.sequence[state.next]},
		next: "isPass",
	},
}

module.exports = DT