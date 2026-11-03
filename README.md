# SubscriptionCheckoutFrontend

Frontend de checkout de assinatura, desenvolvido com [Angular CLI](https://github.com/angular/angular-cli) versão 22.2.5, [Tailwind CSS](https://tailwindcss.com/) 4 e [Vitest](https://vitest.dev/) para testes unitários.

A aplicação consome uma API de backend para montar o carrinho (pre-checkout), processar o pagamento (checkout) e exibir o resultado (sucesso ou erro).

---

## 🚀 Forma mais fácil de testar (Docker, sem instalar nada)

Se você quer avaliar o fluxo completo (Frontend + BFF) **sem instalar Node.js, npm, Java, Maven ou Angular CLI**, use o repositório de avaliação:

**https://github.com/BrunoMonteiroGomes/subscription-checkout-evaluation**

Ele contém um `docker-compose.yml` que baixa automaticamente este frontend e o BFF diretamente do GitHub, constrói as imagens e sobe os dois containers conectados.

### Como rodar

```bash
git clone https://github.com/BrunoMonteiroGomes/subscription-checkout-evaluation.git
cd subscription-checkout-evaluation
docker compose up --build
```

Depois de alguns minutos (o primeiro build baixa dependências npm e Maven), acesse:

**http://localhost:4200**

O frontend estará na porta `4200` e o BFF na porta `8080`. Para parar:

```bash
docker compose down
```

> Requisitos: apenas **Docker** instalado e em execução. Nada mais.

Se preferir rodar o frontend isoladamente (por exemplo, para desenvolver ou rodar testes), siga as instruções de **Pré-requisitos** e **Instalação** abaixo.

---

## Pré-requisitos (para rodar sem Docker)

- **Node.js**: `^22.22.3`, `^24.15.0` ou `>=26.0.0` (requisito do Angular CLI 22)
- **npm**: 11.x (o projeto declara `npm@11.19.1` em `packageManager`)
- **Backend** da API de checkout em execução em `http://localhost:8080` (veja [Backend](#backend))

Para conferir as versões instaladas:

```bash
node -v
npm -v
```

## Instalação

1. Clone o repositório e entre na pasta do projeto:

   ```bash
   git clone <url-do-repositorio>
   cd subscription-checkout-frontend
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

   Opcionalmente, instale o Angular CLI globalmente para usar o comando `ng` diretamente (os scripts do npm já funcionam sem isso):

   ```bash
   npm install -g @angular/cli
   ```

## Backend

O frontend espera uma API disponível em `http://localhost:8080/operations`, com os endpoints:

| Método | Endpoint                         | Descrição                                           |
| ------ | -------------------------------- | --------------------------------------------------- |
| POST   | `/operations/pre-checkout`       | Cria o carrinho para o produto (slug `premium`)     |
| POST   | `/operations/checkout`           | Processa o pagamento do carrinho                    |

A URL base está definida em `src/app/core/services/checkout-api.service.ts` (`baseUrl`). Se o backend rodar em outro endereço ou porta, altere esse valor.

> Certifique-se de que o backend permite requisições (CORS) a partir de `http://localhost:4200`.

Se você não tiver o backend rodando localmente, use o repositório de avaliação (seção acima), que sobe os dois juntos.

## Rodando o projeto (servidor de desenvolvimento)

```bash
npm start
```

ou, equivalentemente:

```bash
ng serve
```

Depois acesse `http://localhost:4200/` no navegador. A aplicação recarrega automaticamente sempre que um arquivo de código-fonte é alterado.

Para abrir o navegador automaticamente ou usar outra porta:

```bash
ng serve --open
ng serve --port 4300
```

### Rotas da aplicação

| Rota         | Descrição                                                              |
| ------------ | ---------------------------------------------------------------------- |
| `/pagamento` | Resumo do pedido e escolha do meio de pagamento (rota padrão)          |
| `/sucesso`   | Confirmação do pagamento (acessível apenas após um pagamento aprovado) |
| `/erro`      | Tela de erro retornada pela API                                        |

### Como simular sucesso e recusa

| Cenário               | Como fazer                                                       | Resultado                          |
| --------------------- | ---------------------------------------------------------------- | ---------------------------------- |
| Sucesso com cartão    | Número de cartão **não** terminado em `0002` (ex.: `4111111111111111`) | Redireciona para `/sucesso`        |
| Recusa com cartão     | Número de cartão terminado em `0002` (ex.: `4000000000000002`)   | Redireciona para `/erro`           |
| Sucesso com Pix       | Selecionar **Pix**, gerar o código e concluir                    | Redireciona para `/sucesso`        |
| Acesso direto a `/sucesso` | Recarregar a URL `/sucesso` sem ter pago antes              | Redireciona para `/pagamento`      |

## Scripts disponíveis

| Comando         | Descrição                                                           |
| --------------- | ------------------------------------------------------------------- |
| `npm start`     | Inicia o servidor de desenvolvimento (`ng serve`)                   |
| `npm run build` | Gera o build de produção na pasta `dist/`                           |
| `npm run watch` | Build em modo de desenvolvimento, recompilando a cada alteração     |
| `npm test`      | Executa os testes unitários com Vitest (`ng test`)                  |

## Build

Para gerar o build do projeto:

```bash
npm run build
```

Os artefatos são gerados no diretório `dist/`. Por padrão, o build de produção é otimizado para desempenho e velocidade.

## Testes unitários

Para executar os testes unitários com o [Vitest](https://vitest.dev/):

```bash
npm test
```

## Testes end-to-end

Para testes end-to-end (e2e), execute:

```bash
ng e2e
```

O Angular CLI não inclui um framework de testes e2e por padrão. Você pode escolher o que melhor se adequa ao seu projeto.

## Geração de código (scaffolding)

Para gerar um novo componente:

```bash
ng generate component nome-do-componente
```

Para ver a lista completa de schematics disponíveis (como `components`, `directives` ou `pipes`):

```bash
ng generate --help
```

## Estrutura do projeto

```
src/app/
├── core/
│   ├── guards/      # Guard que protege a rota /sucesso
│   ├── models/      # Interfaces (carrinho, checkout, erros)
│   └── services/    # Chamadas à API e estado do checkout
└── features/
    ├── payment/     # Tela de pagamento
    ├── success/     # Tela de sucesso
    └── error/       # Tela de erro
```

## Problemas comuns

- **Erro de versão do Node ao executar `ng`/`npm start`**: atualize o Node para uma versão listada em [Pré-requisitos](#pré-requisitos).
- **Tela de erro ao abrir `/pagamento`**: verifique se o backend está rodando em `http://localhost:8080` e se o CORS está liberado para `http://localhost:4200`. Se estiver usando o repositório de avaliação, o backend já sobe junto.
- **Porta 4200 em uso**: execute `ng serve --port <outra-porta>`.
- **Build Docker falha ao baixar dependências**: verifique a conexão com a internet e se o repositório de avaliação está público.

## Recursos adicionais

Para mais informações sobre o Angular CLI, incluindo referências detalhadas de comandos, acesse a página [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli).
