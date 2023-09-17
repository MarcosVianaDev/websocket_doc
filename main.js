import { createBoard, playMove } from "./connect4.js";

window.addEventListener("DOMContentLoaded", () => {
  // Initialize the UI.
  const board = document.querySelector(".board");
  createBoard(board);
  // Open the WebSocket connection and register event handlers.
  const websocket = new WebSocket("ws://192.168.1.32:8001/");
  initGame(websocket);
  receiveMoves(board, websocket);
  sendMoves(board, websocket);
  
  function sendMoves(board, websocket) {
    // When clicking a column, send a "play" event for a move in that column.
    board.addEventListener("click", ({ target }) => {
      const column = target.dataset.column;
      // Ignore clicks outside a column.
      if (column === undefined) {
        return;
      }
      const event = {
        type: "play",
        column: parseInt(column, 10),
      };
      websocket.send(JSON.stringify(event));
    });
  }

  websocket.addEventListener("message", ({ data }) => {
    const event = JSON.parse(data);
    // do something with event
  });

  function showMessage(message) {
    window.setTimeout(() => window.alert(message), 50);
  }
  
  function receiveMoves(board, websocket) {
    websocket.addEventListener("message", ({ data }) => {
      console.log();
      const event = JSON.parse(data);
      switch (event.type) {
        case "init":
          // Create link for inviting the second player.
          document.querySelector(".join").href = "?join=" + event.join;
          break;
        case "play":
          // Update the UI with the move.
          playMove(board, event.player, event.column, event.row);
          break;
        case "win":
          showMessage(`Player ${event.player} wins!`);
          // No further messages are expected; close the WebSocket connection.
          websocket.close(1000);
          break;
        case "error":
          showMessage(event.message);
          break;
        
        default:
          throw new Error(`Unsupported event type: ${event.type}.`);
      }
    });
  }

  function initGame(websocket) {
    websocket.addEventListener("open", () => {
      const params = new URLSearchParams(window.location.search)
      // Send an "init" for ecah player.
      let event = { type: "init" };
      if (params.has('join')) {
        //Second player enter an existent game
        event.join = params.get('join')
      }
      else {
        //Fisrt player init a game
      }
      websocket.send(JSON.stringify(event));
    });
  }

});