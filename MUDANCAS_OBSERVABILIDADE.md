# Melhorias de observabilidade e métricas operacionais

## Objetivo da entrega

Nesta entrega eu trabalhei na observabilidade do backend do QShift. A ideia foi
deixar mais fácil identificar falhas, acompanhar se os serviços estão
respondendo e entender como está o fluxo de geração de escalas.

Antes disso, o sistema já tinha endpoints básicos de saúde, mas eles só
informavam se a aplicação estava respondendo. Agora existem sinais mais úteis
para operação, como tempo de resposta, erros HTTP, estado das dependências e
quantidade de jobs de geração por status.

## O que foi implementado

### 1. Logs estruturados e identificação das requisições

Foi criado um módulo compartilhado de observabilidade em
`backend/shared/observability.py`.

Os logs do backend agora são emitidos em JSON, com campos que facilitam busca e
análise:

- data e hora;
- nível do log;
- mensagem;
- `request_id`;
- rota acessada;
- método HTTP;
- status da resposta;
- duração da requisição em milissegundos.

Cada requisição recebe um identificador próprio. Se o cliente já enviar o
header `X-Request-ID`, esse valor é mantido. Caso contrário, a API cria um
identificador novo e o devolve no header da resposta.

Com isso, se uma operação der problema, é possível procurar pelo mesmo
`request_id` nos logs e acompanhar tudo que aconteceu naquela chamada.

### 2. Métricas HTTP para monitoramento

Também foi criado um coletor de métricas em memória para as duas APIs:

- `core_api`;
- `schedule_generator_api`.

As métricas expostas incluem:

- tempo de execução da aplicação;
- quantidade de requisições por rota, método e status;
- quantidade de respostas com erro;
- histograma de latência das requisições.

As métricas seguem o formato compatível com Prometheus e podem ser consultadas
em:

```text
GET /metrics
```

Isso permite futuramente conectar Prometheus e Grafana sem precisar alterar a
lógica principal da aplicação.

### 3. Endpoints de saúde mais completos

No `core_api`, os endpoints operacionais passaram a ser:

```text
GET /healthz
GET /healthz/ready
GET /healthz/db
GET /metrics
```

O `/healthz` informa se o processo da API está ativo e retorna o tempo desde a
inicialização.

O `/healthz/ready` verifica se o serviço realmente está pronto para operar. Ele
consulta:

- conexão com o banco de dados;
- comunicação com o serviço gerador de escalas.

Se alguma dependência não estiver disponível, a resposta passa a indicar
estado degradado e retorna HTTP `503`.

O `/healthz/db` agora também devolve a latência da verificação do banco e passa
a retornar erro HTTP adequado caso a conexão não esteja funcionando.

No `schedule_generator_api`, foram adicionados:

```text
GET /healthz
GET /healthz/ready
GET /metrics
```

Assim, os dois serviços podem ser monitorados separadamente.

### 4. Resumo operacional do sistema

Foi adicionada a rota:

```text
GET /api/v1/operations/summary
```

Essa rota devolve um resumo em JSON com:

- estado geral do `core_api`;
- ambiente atual;
- tempo de atividade;
- estado do banco;
- estado do gerador de escalas;
- quantidade total de requisições observadas;
- quantidade de erros internos;
- latência média;
- métricas por rota;
- quantidade de jobs de geração em `pending`, `processing`, `done` e `failed`;
- idade do job ativo mais antigo;
- data da falha de geração mais recente.

A rota usa a autenticação já existente no sistema. Neste momento o projeto
ainda não possui distinção de permissão entre usuário comum e administrador,
então o controle específico de perfil administrativo pode ser evoluído em uma
próxima etapa.

### 5. Rastreamento do fluxo de geração de escalas

O fluxo de geração de escala também recebeu logs mais úteis.

No `core_api`, agora é registrado quando:

- um job de geração é criado;
- o job é enviado para o gerador;
- o envio falha;
- o callback com o resultado é aceito.

No `schedule_generator_api`, agora é registrado quando:

- um job é recebido;
- a geração termina;
- a geração falha.

Esses logs incluem informações como `job_id`, `user_id`, quantidade de turnos,
quantidade de funcionários e se foi possível gerar uma escala.

### 6. Configuração e documentação

Foi adicionada a configuração:

```text
SCHEDULE_GENERATOR_HEALTH_TIMEOUT_SECONDS=5
```

Ela controla quanto tempo o `core_api` espera pela resposta do gerador durante
a verificação de prontidão.

O `README.md` também foi atualizado com os endpoints de monitoramento e a
explicação do uso do `request_id`.

## Arquivos envolvidos

Os principais arquivos criados foram:

| Arquivo | Finalidade |
| --- | --- |
| `backend/shared/observability.py` | Middleware, logs estruturados e métricas HTTP |
| `backend/core_api/core/metrics.py` | Registro de métricas do serviço principal |
| `backend/schedule_generator_api/core/metrics.py` | Registro de métricas do gerador |
| `backend/core_api/schemas/operations.py` | Modelos das respostas operacionais |
| `backend/core_api/services/operations.py` | Consultas de saúde e métricas de jobs |
| `backend/core_api/api/routes/operations.py` | Endpoint de resumo operacional |
| `backend/tests/unit/test_observability.py` | Testes do coletor de métricas |

Também foram alterados os arquivos de inicialização das duas APIs, o fluxo de
geração de escalas, a configuração do backend, os testes e o README.

## Testes e validação

Para validar as mudanças, foi criado um ambiente Python local com as
dependências do backend e um banco PostgreSQL temporário separado, usado apenas
durante os testes.

As migrations foram aplicadas nesse banco e a suíte completa foi executada.

Resultado final:

```text
139 passed in 39.93s
```

Durante a execução foi corrigida uma asserção de teste que comparava um UUID do
payload interno com uma string retornada pelo JSON da API. A comparação passou
a usar o mesmo formato textual, sem mudar a regra funcional do sistema.

## Resultado

Com essas mudanças, o backend passa a oferecer informações suficientes para
detectar rapidamente indisponibilidade do banco ou do gerador, acompanhar
falhas na geração de escalas e integrar o sistema a uma ferramenta de
monitoramento no futuro.
