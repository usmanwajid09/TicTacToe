import assert from "node:assert/strict";

import {
  applyMove,
  chooseBestMove,
  createInitialState,
  restartRound,
  setMode,
  shouldAiPlay
} from "../src/game.js";

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

test("applyMove places a mark and swaps players", () => {
  const state = createInitialState("pvp");
  const next = applyMove(state, 4);

  assert.equal(next.board[4], "X");
  assert.equal(next.currentPlayer, "O");
});

test("winning move records winner and increments score", () => {
  let state = createInitialState("pvp");
  state = { ...state, board: ["X", "X", null, null, "O", null, null, null, "O"] };
  const next = applyMove(state, 2);

  assert.equal(next.winner, "X");
  assert.deepEqual(next.winningLine, [0, 1, 2]);
  assert.equal(next.scores.X, 1);
});

test("draw increments draw score", () => {
  let state = createInitialState("pvp");
  state = {
    ...state,
    currentPlayer: "X",
    board: ["X", "O", "X", "X", "O", "O", "O", "X", null]
  };
  const next = applyMove(state, 8);

  assert.equal(next.isDraw, true);
  assert.equal(next.scores.draw, 1);
});

test("ai chooses an immediate winning move", () => {
  const move = chooseBestMove(["O", "O", null, "X", "X", null, null, null, null]);
  assert.equal(move, 2);
});

test("mode switch resets scores and round state", () => {
  let state = createInitialState("ai");
  state = applyMove(state, 0);
  state = {
    ...state,
    scores: { X: 2, O: 1, draw: 1 }
  };

  const next = setMode(state, "pvp");

  assert.equal(next.mode, "pvp");
  assert.deepEqual(next.scores, { X: 0, O: 0, draw: 0 });
  assert.deepEqual(next.board, Array(9).fill(null));
});

test("shouldAiPlay only returns true during ai turn", () => {
  let state = createInitialState("ai");
  assert.equal(shouldAiPlay(state), false);

  state = applyMove(state, 0);
  assert.equal(shouldAiPlay(state), true);

  state = restartRound(state);
  assert.equal(shouldAiPlay(state), false);
});

let passed = 0;

for (const { name, fn } of tests) {
  try {
    fn();
    console.log(`PASS ${name}`);
    passed += 1;
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

if (process.exitCode !== 1) {
  console.log(`All ${passed} tests passed.`);
}
