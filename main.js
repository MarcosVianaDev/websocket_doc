import { createBoard, playMove } from "./connect4.js";

var urlJoin, urlWatch;


function initGame(websocket) {
  websocket.addEventListener("open", () => {
    document.getElementById('conn').style.display = 'none'
    // Send an "init" event according to who is connecting.
    const params = new URLSearchParams(window.location.search);
    let event = { type: "init" };
    if (params.has("join")) {
      // Second player joins an existing game.
      event.join = params.get("join");
    } else if (params.has("watch")) {
      // Spectator watches an existing game.
      event.watch = params.get("watch");
    } else {
      // First player starts a new game.
    }
    websocket.send(JSON.stringify(event));
  });
}

function showMessage(message) {
  window.setTimeout(() => window.alert(message), 50);
}

function receiveMoves(board, websocket) {
  websocket.addEventListener("message", ({ data }) => {
    const event = JSON.parse(data);
    switch (event.type) {
      case "init":
        // Create links for inviting the second player and spectators.
        document.querySelector(".new").href = window.location.href;
        document.querySelector(".join").href = "?join=" + event.join;
        urlJoin = window.location.href + "?join=" + event.join;
        document.querySelector(".watch").href = "?watch=" + event.watch;
        urlWatch = window.location.href + "?watch=" + event.watch;

        //QR Code
        var qrJoin = new QRCode(document.getElementById("qrJoin"), {
          width: 150,
          height: 150
        });
        var qrWatch = new QRCode(document.getElementById("qrWatch"), {
            width: 150,
            height: 150
        });
        function makeCode() {
          console.log('URL to join the game: ' + urlJoin + '\nURL to watch the game: ' + urlWatch);
          qrJoin.makeCode(urlJoin);
          qrWatch.makeCode(urlWatch)
        }
        makeCode();
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

function sendMoves(board, websocket) {
  // Don't send moves for a spectator watching a game.
  const params = new URLSearchParams(window.location.search);
  if (params.has("watch")) {
    return;
  }

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

function getWebSocketServer() {
  // (window.location.host === "marcosvianadev.github.io") {
  if (window.location.host === "localhost:8000") {
    return "ws://localhost:8001/";
  } else {
    console.log(window.location.host);
    return "wss://websocketdoc.marcosviana2.repl.co/";
  }
}

var cont = 0
function wsConnect(board) {
  cont++
  var ws = new WebSocket(getWebSocketServer());
  ws.addEventListener('error', ()=>{
    if (cont < 10) {
      setTimeout(wsConnect(board), 750)
    } else {
      console.log('timeout...');
      showMessage('Não foi possível conectar ao servidor.\nRecarregue a página para tentar novamente.')
    }
  });
  initGame(ws);
  receiveMoves(board, ws);
  sendMoves(board, ws);
}

window.addEventListener("DOMContentLoaded", () => {
  // Initialize the UI.
  const board = document.querySelector(".board");
  createBoard(board);
  // Open the WebSocket connection and register event handlers.
  wsConnect(board);
});