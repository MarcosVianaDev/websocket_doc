# websocket_doc

Clique [aqui](https://marcosvianadev.github.io/websocket_doc/) para acessar o jogo!
  
Desenvolvendo o jogo proposto na documentação: https://websockets.readthedocs.io/en/stable/intro/tutorial1.html

* Ligar Web Server (cliente): `python -m http.server`
* Ligar Socket Server (servidor): `python app.py`
    > Instale o **watchdog** para reinício automático do servidor ao salvar alterações: \
    `pip install 'watchdog[watchmedo]'`
    > * `watchmedo auto-restart --pattern "*.py" --recursive --signal SIGTERM \`
    > * `python app.py`
<!-- 
watchmedo auto-restart --pattern "*.py" --recursive --signal SIGTERM \
python app.py
-->
Crie e ative um ambiente virtual:
> `python -m venv venv` \
> `source venv/bin/activate`

