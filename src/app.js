import {
  applyMove,
  chooseBestMove,
  createInitialState,
  getStatusMessage,
  resetScores,
  restartRound,
  setMode,
  shouldAiPlay
} from "./game.js";

const boardEl = document.querySelector("#board");
const statusEl = document.querySelector("#status");
const restartButton = document.querySelector("#restart-round");
const resetScoreButton = document.querySelector("#reset-score");
const modeButtons = document.querySelectorAll("[data-mode]");
const scoreX = document.querySelector("#score-x");
const scoreO = document.querySelector("#score-o");
const scoreDraw = document.querySelector("#score-draw");

let state = createInitialState("ai");

function renderBoard() {
  boardEl.innerHTML = "";

  state.board.forEach((cell, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cell";
    button.setAttribute("role", "gridcell");
    button.setAttribute("aria-label", `Cell ${index + 1}${cell ? `, ${cell}` : ""}`);
    button.disabled = Boolean(cell) || Boolean(state.winner) || state.isDraw || shouldAiPlay(state);

    if (state.winningLine.includes(index)) {
      button.classList.add("cell--winner");
    }

    if (cell) {
      const mark = document.createElement("span");
      mark.className = `cell__mark cell__mark--${cell.toLowerCase()}`;
      mark.textContent = cell;
      button.append(mark);
    }

    button.addEventListener("click", () => handlePlayerMove(index));
    boardEl.append(button);
  });
}

function renderHud() {
  statusEl.textContent = getStatusMessage(state);
  scoreX.textContent = String(state.scores.X);
  scoreO.textContent = String(state.scores.O);
  scoreDraw.textContent = String(state.scores.draw);

  modeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === state.mode);
  });
}

function render() {
  renderBoard();
  renderHud();
}

function runAiTurn() {
  if (!shouldAiPlay(state)) {
    return;
  }

  window.setTimeout(() => {
    const move = chooseBestMove(state.board);
    state = applyMove(state, move);
    render();
  }, 240);
}

function handlePlayerMove(index) {
  if (shouldAiPlay(state)) {
    return;
  }

  const nextState = applyMove(state, index);
  if (nextState === state) {
    return;
  }

  state = nextState;
  render();
  runAiTurn();
}

restartButton.addEventListener("click", () => {
  state = restartRound(state);
  render();
});

resetScoreButton.addEventListener("click", () => {
  state = resetScores(state);
  render();
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state = setMode(state, button.dataset.mode);
    render();
  });
});

render();
