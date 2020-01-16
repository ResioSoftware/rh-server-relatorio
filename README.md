# rh-server-relatorio

Api que consome uma fila do rabbitMQ e processa eventos e atende algumas chamadas de RPC:

api principal, no qual consome mensagens por ela pelo rabitMQ:

https://github.com/daviresio/rh-server

cliente em react que consome a api:

https://github.com/daviresio/rh-client

static page que tambem consome a api para fazer o login e o cadastro:

https://github.com/daviresio/rh-page


caso queira rodar a aplicacao em sua maquina execute primeiro as 2 apis e os 2 clientes web

depois acesse a pagina statica do gatsby em http://localhost:8000 e faca um cadastro (ou logue, caso ja exista um) 
para ser redirecionado para o cliente web, pois `e necessario estar logado para acessa-lo visto que a api na api os registros
sao baseados nao apenas no usuario, mas tambem a empresa selecionada
