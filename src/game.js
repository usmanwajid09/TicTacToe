const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function evaluateBoard(board) {
  for (const line of winningLines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], winningLine: line };
    }
  }

  return { winner: null, winningLine: [] };
}

function boardFull(board) {
  return board.every((cell) => cell !== null);
}

function nextPlayer(currentPlayer) {
  return currentPlayer === "X" ? "O" : "X";
}

export function createInitialState(mode = "ai") {
  return {
    board: Array(9).fill(null),
    currentPlayer: "X",
    mode,
    winner: null,
    winningLine: [],
    isDraw: false,
    scores: { X: 0, O: 0, draw: 0 }
  };
}

export function restartRound(state) {
  return {
    ...state,
    board: Array(9).fill(null),
    currentPlayer: "X",
    winner: null,
    winningLine: [],
    isDraw: false
  };
}

export function resetScores(state) {
  return {
    ...restartRound(state),
    scores: { X: 0, O: 0, draw: 0 }
  };
}

export function setMode(state, mode) {
  return resetScores({
    ...state,
    mode
  });
}

export function getStatusMessage(state) {
  if (state.winner) {
    return state.mode === "ai" && state.winner === "O"
      ? "The AI takes the round."
      : `Player ${state.winner} wins the round.`;
  }

  if (state.isDraw) {
    return "Draw. The board is full.";
  }

  if (state.mode === "ai" && state.currentPlayer === "O") {
    return "AI is choosing the next move.";
  }

  return `Player ${state.currentPlayer} to move.`;
}

export function applyMove(state, index) {
  if (state.winner || state.isDraw || state.board[index] !== null) {
    return state;
  }

  const nextBoard = [...state.board];
  nextBoard[index] = state.currentPlayer;

  const evaluation = evaluateBoard(nextBoard);
  if (evaluation.winner) {
    return {
      ...state,
      board: nextBoard,
      winner: evaluation.winner,
      winningLine: evaluation.winningLine,
      scores: {
        ...state.scores,
        [evaluation.winner]: state.scores[evaluation.winner] + 1
      }
    };
  }

  if (boardFull(nextBoard)) {
    return {
      ...state,
      board: nextBoard,
      isDraw: true,
      scores: {
        ...state.scores,
        draw: state.scores.draw + 1
      }
    };
  }

  return {
    ...state,
    board: nextBoard,
    currentPlayer: nextPlayer(state.currentPlayer)
  };
}

function scoreTerminal(board, depth) {
  const evaluation = evaluateBoard(board);

  if (evaluation.winner === "O") {
    return 10 - depth;
  }

  if (evaluation.winner === "X") {
    return depth - 10;
  }

  if (boardFull(board)) {
    return 0;
  }

  return null;
}

function minimax(board, player, depth = 0) {
  const terminalScore = scoreTerminal(board, depth);
  if (terminalScore !== null) {
    return terminalScore;
  }

  const scores = [];
  for (let index = 0; index < board.length; index += 1) {
    if (board[index] !== null) {
      continue;
    }

    const nextBoard = [...board];
    nextBoard[index] = player;
    scores.push(minimax(nextBoard, nextPlayer(player), depth + 1));
  }

  return player === "O" ? Math.max(...scores) : Math.min(...scores);
}

export function chooseBestMove(board) {
  let bestMove = -1;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (let index = 0; index < board.length; index += 1) {
    if (board[index] !== null) {
      continue;
    }

    const nextBoard = [...board];
    nextBoard[index] = "O";
    const score = minimax(nextBoard, "X", 1);

    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  }

  return bestMove;
}

export function shouldAiPlay(state) {
  return state.mode === "ai" && !state.winner && !state.isDraw && state.currentPlayer === "O";
}
