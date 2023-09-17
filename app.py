#!/usr/bin/env python
import asyncio
import websockets
import json
from connect4 import Connect4

import secrets #gerador de chave


JOIN = {}

async def error(websocket:websockets, message:str):
    websocket.send(json.dumps({'type':'error', 'message': message}))

async def join(websocket, join_key:str):
    try: #Try find tha game
        game, connected = JOIN[join_key]
    except KeyError:
        await error(websocket, 'Game not found')
        return
    connected.add(websocket)
    try: #Second player has connected
        print('Second player has connected ', id(game))
        async for message in websocket:
            print('Second Palyer sends: ', message)
    finally:
        connected.remove(websocket)

async def start(websocket:websockets):
    game = Connect4()
    connected = {websocket}


    # join_key = secrets.token_urlsafe(12)
    join_key = 'marcoswebsocketserver'
    JOIN[join_key] = game, connected

    try:
        event = {
            'type': 'init',
            'join': join_key
        }
        await websocket.send(json.dumps(event))
        print('First player has connected', id(game))
        async for message in websocket:
            print('First player send: ', message)
    finally:
        del JOIN[join_key]

async def handler(websocket):
    while True:
        try:
            incoming = await websocket.recv()
            incoming = json.loads(incoming)
            assert incoming['type'] == 'init', 'type must be init'

            if 'join' in incoming:
                await join(websocket, incoming['join'])
            else:
                await start(websocket)
                

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
                    ...
                    
        except websockets.ConnectionClosedOK:
            break


vez_do_jogador1 = True
def logicaDoJogo(column:int):
    global vez_do_jogador1, game
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