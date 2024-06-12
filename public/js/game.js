const socket = io();
const chess = new Chess();
const boardElement = document.getElementById("chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";
  board.forEach((row, rowIndex) => {
    row.forEach((square, squareIndex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add(
        "square",
        (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark"
      );

      squareElement.dataset.row = rowIndex;
      squareElement.dataset.col = squareIndex;
      //   console.log(square);
      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        pieceElement.innerHTML = getPiecesUnicode(square);
        pieceElement.draggable = playerRole === square.color;

        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = { row: rowIndex, column: squareIndex };
            e.dataTransfer.setData("text/plain", JSON.stringify(sourceSquare));
          }
        });

        pieceElement.addEventListener("dragend", (e) => {
          draggedPiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(pieceElement);
      }

      squareElement.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      squareElement.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedPiece) {
          const targetSquare = {
            row: parseInt(squareElement.dataset.row),
            column: parseInt(squareElement.dataset.col),
          };

          handleMove(sourceSquare, targetSquare);
        }
      });
      boardElement.appendChild(squareElement);
    });
  });

  if (playerRole == "b") {
    boardElement.classList.add("flipped");
  } else {
    boardElement.classList.remove("flipped");
  }
};

const handleMove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97 + source.column)}${8 - source.row}`,
    to: `${String.fromCharCode(97 + target.column)}${8 - target.row}`,
    promotion: "q", // Promote to queen
  };
  // console.log(String.fromCharCode(97))
  //   console.log(move)

  socket.emit("move", move);
};

const getPiecesUnicode = (piece) => {
  chess_pieces_unicode = {
    p: "&#9823;", // Black Pawn
    r: "\u265C", // Black Rook
    n: "\u265E", // Black Knight
    b: "\u265D", // Black Bishop
    q: "\u265B", // Black Queen
    k: "\u265A", // Black King
    P: "\u2659", // White Pawn
    R: "\u2656", // White Rook
    N: "\u2658", // White Knight
    B: "\u2657", // White Bishop
    Q: "\u2655", // White Queen
    K: "\u2654", // White King
  };

  //   console.log(piece.type);
  if (piece) {
    if (piece.color === "w") {
      return chess_pieces_unicode[piece.type.toUpperCase()];
    } else if (piece.color === "b") {
      return chess_pieces_unicode[piece.type.toLowerCase()];
    }
  }
};

socket.on("playerRole", (role) => {
//   console.log(role);
  playerRole = role;
  renderBoard();
});
socket.on("spectatorRole", () => {
  playerRole = null;
  renderBoard();
});
socket.on("boardState", (fen) => {
  chess.load(fen);
  renderBoard();
});

socket.on("move", (move) => {
//   console.log("MOVEDw");
  chess.move(move);
  renderBoard();
});

renderBoard();
