#!/usr/bin/env python

import asyncio

import websockets

import json

# from connect4 import PLAYER1, PLAYER2
from connect4 import Connect4

game = Connect4()
async def handler(websocket):
    global game
    while True:
        try:
            incoming = await websocket.recv()
            incoming = json.loads(incoming)
            match (incoming['type']):
                case 'play':
                    await websocket.send(json.dumps(logicaDoJogo(incoming['column'])))
                    if game.winner is not None:
                        await websocket.send(json.dumps({
                            "type": "win",
                            "player": game.winner,
                        }))
                    continue
                case '_':
                    print('Entrada inválida')
                    
        except websockets.ConnectionClosedOK:
            break


vez_do_jogador1 = True
def logicaDoJogo(column:int):
    global vez_do_jogador1, game
    print('aplicando as regras do jogo')
    
    try:
        row = game.play('red' if vez_do_jogador1 else 'yellow', column)
    except RuntimeError as error:
        return {
            'type': 'error',
            'message': str(error)
        }

    response = {
        'type': "play", # "win" "error"
        'player': 'red' if vez_do_jogador1 else 'yellow',
        'column': column,
        'row': row,
        'message': None
    }
    vez_do_jogador1 = not vez_do_jogador1
    return response


async def main():
    async with websockets.serve(handler, "", 8001):
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    print('Socket server running on PORT 8001...')
    asyncio.run(main())