# websocket_doc
Desenvolvendo o jogo proposto na documentação: https://websockets.readthedocs.io/en/stable/intro/tutorial1.html

//source venv/bin/activate
$ pip install 'watchdog[watchmedo]'
$ watchmedo auto-restart --pattern "*.py" --recursive --signal SIGTERM \
    python app.py

* Ligar Web Server (cliente): `python -m http.server`
* Ligar Socket Server (servidor): `python app.py`