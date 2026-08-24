# Brota Tickets

[🇺🇸 English](./README.md) | 🇧🇷 Português

Plataforma de eventos e ingressos: organizadores publicam eventos, clientes navegam e reservam, pagam e recebem um ingresso com QR code; a portaria valida os ingressos na entrada. **[Clique aqui para o demo ao vivo.](https://brota-tickets.vercel.app/)**

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-database-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://brota-tickets.vercel.app/)
[![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://brota-tickets.onrender.com/)

Construído para o desafio Elite Dev da Verzel. Veja [`AI_USAGE.md`](./AI_USAGE.md) para saber quais ferramentas de IA foram usadas, onde, e o que foi feito manualmente.

## Demo ao vivo

- Front-end: https://brota-tickets.vercel.app/
- API back-end: https://brota-tickets.onrender.com/

O back-end roda no plano gratuito do Render, que hiberna após um período de inatividade. Se a primeira requisição depois de um tempo demorar de 30 a 50s, é a instância acordando, não é um bug, ela responde normalmente depois disso.

## Funcionalidades

- Os dois fluxos de reserva foram implementados, mapa de assentos (estilo cinema/teatro) e quantidade (pista/entrada geral).
- Ingressos em QR assinados com HMAC-SHA256 e verificados no servidor com comparação em tempo constante (`server/utils/qr.js`), não podem ser forjados adivinhando ou incrementando um ID.
- A validação do ingresso é uma única atualização condicional atômica (`updateMany({ where: { validated: false } })`), então duas leituras quase simultâneas do mesmo ingresso não podem ambas ter sucesso.
- Garantias de concorrência no nível do banco de dados: uma constraint única em `(eventId, seatCode)` impede que o mesmo assento seja vendido duas vezes, e um lock de linha `SELECT ... FOR UPDATE` impede que um evento por quantidade venda além da capacidade no último ingresso, ambos encontrados e corrigidos após testes ao vivo revelarem a condição de corrida, não assumidos como seguros só por estarem dentro de uma transação.
- Disponibilidade de assentos/estoque quase em tempo real: a tela de reserva busca atualizações a cada 5s e remove da seleção qualquer assento que outro cliente acabou de reservar, para que uma seleção desatualizada não possa ser enviada.
- Cancelamento com devolução ao estoque: o cliente pode cancelar uma reserva confirmada e o assento/estoque volta a ficar disponível imediatamente, bloqueado quando o ingresso já foi validado na portaria.
- A portaria valida por leitura de QR pela câmera ou digitação manual do código, com o mesmo código também exibido para o cliente em Meus Ingressos como alternativa caso a leitura falhe.
- Painel do organizador: ingressos vendidos, receita bruta e ocupação por evento.
- PWA instalável, com ícone de aba e ícone de instalação próprios, testado em hardware Android/iOS real.

## Papéis e fluxos

- **Organizador**: cria e gerencia eventos (a partir de data/local/capacidade/preço, sem exigir um catálogo externo para publicar), vê um painel com ingressos vendidos, receita e ocupação.
- **Cliente**: navega e busca eventos publicados, reserva através de um mapa de assentos (estilo cinema/teatro) ou de um seletor de quantidade (pista), paga através de um fluxo simulado de confirmação/recusa, recebe um ingresso com QR code, pode cancelar uma reserva confirmada, e pode compartilhar um ingresso por link público.
- **Portaria**: escolhe um evento, depois valida ingressos por leitura de QR pela câmera ou digitação manual do código, com um retorno claro: válido, inválido, já utilizado ou evento errado.

## Stack técnica

- **Front-end**: React 19 (Vite), SPA simples com React Router.
- **Back-end**: Node.js, Express, autenticação JWT.
- **Banco de dados**: PostgreSQL via Prisma ORM.
- **API externa**: Ticketmaster Discovery, para o catálogo de eventos do organizador.

## Requisitos do desafio

Construído para o desafio Elite Dev da Verzel, um conjunto fixo de restrições moldou cada decisão abaixo:

- Stack: front-end em React (qualquer ferramenta de build), back-end em Node/Python/Java, qualquer banco de dados. Escolhido Node/Express + PostgreSQL via Prisma.
- Autenticação com três papéis distintos: Organizador, Cliente, Portaria.
- Uma API de catálogo externa para o organizador publicar a partir dela, Ticketmaster Discovery ou TMDb. Escolhido Ticketmaster.
- Implementar ao menos uma UI de reserva, mapa de assentos ou seletor de quantidade. Os dois foram implementados.
- Pagamento apenas simulado, sem transação real.
- Geração de ingresso em QR que não possa ser forjado.
- Garantir que o mesmo assento não seja vendido duas vezes, nem o mesmo ingresso validado duas vezes.
- Dados de teste: 1 organizador, 2 clientes, 1 usuário de portaria, ao menos 1 evento publicado com ingressos disponíveis.
- Prazo de 7 dias corridos a partir do recebimento do desafio.
- Deploy opcional; README com instruções de setup e problemas conhecidos; uma seção dedicada de uso de IA.

## Decisões de arquitetura

### Ticketmaster Discovery em vez de TMDb
O desafio permite qualquer uma das duas APIs de catálogo externo. Os shows ao vivo do Ticketmaster combinam melhor com a narrativa de "o organizador publica um evento real" do que os filmes em cartaz do TMDb, e é a API que está de fato conectada no endpoint `/catalog` de `server/routes/events.js`.

### Vite (SPA simples) em vez de Next.js
Mantém a separação entre front-end e back-end clara. Um meta-framework como o Next.js pode funcionar como seu próprio back-end via API routes, o que confundiria o pedido do desafio por um back-end em um framework separado. O Vite empacota apenas um app React client-side, nada além disso.

### Os dois fluxos de reserva implementados, não só um
O desafio pede um mapa de assentos ou um seletor de quantidade. Os dois foram construídos, `client/src/pages/Reservar.jsx` decide qual renderizar a partir de `event.type`, definido no back-end pela capacidade em `server/utils/seatMap.js`, mapa de assentos para locais menores/com lugares marcados, quantidade para entrada geral, um aumento de escopo deliberado além do mínimo pedido.

### Uma reserva, um ingresso QR, por unidade comprada
Mesmo uma compra por quantidade/entrada geral cria uma linha de `Reservation`, e um QR, por ingresso (`server/routes/reservations.js`), em vez de uma única linha com `quantity: 3`. Isso permite que cada ingresso seja validado e compartilhado de forma independente, do jeito que um grupo de fato entraria no evento.

### Tokens de QR assinados com HMAC, não IDs aleatórios
O código do ingresso é `reservationId.signature` (`server/utils/qr.js`), verificado no servidor com `crypto.timingSafeEqual`, então um código não pode ser forjado adivinhando ou incrementando um ID.

### Garantias no nível do banco de dados em vez de confiar só na lógica da aplicação para concorrência
Duas condições de corrida reais surgiram durante testes: o mesmo assento podia ser reservado duas vezes, e um evento por quantidade podia vender além da capacidade no último ingresso, porque uma verificação seguida de escrita dentro de uma transação ainda deixa uma brecha para duas requisições simultâneas passarem pela verificação antes que qualquer uma delas seja commitada. Corrigido com uma constraint única em `(eventId, seatCode)` para assentos, e um lock de linha `SELECT ... FOR UPDATE` para o estoque por quantidade, colocando a garantia no banco de dados em vez de confiar que o handler da requisição rode sozinho.

### Polling em vez de websocket para disponibilidade de assentos quase em tempo real
Alguns segundos de atraso contra montar e verificar uma nova infraestrutura de back-end tão perto do prazo final. Uma escolha deliberada, não um padrão assumido por conveniência.

### Deploy como meta assumida, não um extra opcional
Vercel para o front-end, Render para o back-end e o Postgres. Vale o tempo de configuração porque ver o projeto no ar muda toda a leitura antes mesmo de alguém abrir o código.

## Como rodar o projeto

### Pré-requisitos

- Node.js 18+
- Um banco PostgreSQL (uma instância gratuita do [Render](https://render.com), do [Supabase](https://supabase.com), ou um Postgres local, todos funcionam)
- Uma chave gratuita da API Ticketmaster Discovery em [developer.ticketmaster.com](https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/)

### Back-end

```bash
git clone git@github.com:yasminsuellen/brota-tickets.git
cd brota-tickets/server
npm install
```

Crie o arquivo `server/.env`:

```
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="qualquer-string-longa-e-aleatoria"
QR_SECRET="qualquer-string-longa-e-aleatoria"
TICKETMASTER_API_KEY="sua-chave-ticketmaster"
PORT=3333
```

`JWT_SECRET` assina as sessões de login, `QR_SECRET` assina os QR codes dos ingressos para que não possam ser forjados. Use strings aleatórias longas e diferentes para cada uma. `PORT` é opcional, o padrão é 3333.

```bash
npx prisma generate
npx prisma db push
node prisma/seed.js
npm run dev
```

`prisma db push` cria o schema no seu banco de dados. O script de seed cria as contas de teste e os eventos listados abaixo, rode uma vez após o primeiro push.

### Front-end

```bash
cd ../client
npm install
```

Crie o arquivo `client/.env`:

```
VITE_API_BASE_URL=http://localhost:3333
```

Sem barra no final, precisa bater com o `PORT` do back-end.

```bash
npm run dev
```

Abra a URL que o Vite mostrar no terminal (geralmente http://localhost:5173).

## Contas de teste

Criadas por `server/prisma/seed.js`, todas usam a senha `senha123`:

| Papel | Email |
|---|---|
| Organizador | organizador@brotatickets.com |
| Cliente | cliente1@brotatickets.com |
| Cliente | cliente2@brotatickets.com |
| Portaria | portaria@brotatickets.com |

O seed também publica 6 eventos sem nenhuma reserva, então sempre há ingressos disponíveis para comprar.

## Estrutura do projeto

```
client/src/
├── pages/             # Um arquivo por rota: Login, Home, Cliente, 
│                        EventDetail, Reservar, Pagamento, MeusIngressos,  
│                        TicketGroup, TicketDetail, Portaria,Organizador,   
│                        Catalogo, CriarEvento, GerenciarEvento
├── components/        # UI compartilhada: TopNav, Layout, 
│                        PageHeader, LoginModal, LogoutButton, 
│                        ProtectedRoute, ScrollToTop, SkeletonCard
├── context/           # AuthContext (estado da sessão/JWT)
├── utils/             # formatDateTime, createReservation, helpers compartilhados
├── styles/            # Design tokens: cores, tipografia, espaçamento
└── assets/            # Imagens, ícones

server/
├── routes/            # auth.js, events.js, reservations.js
├── middleware/        # auth.js (verificação de JWT, controle de papel)
├── lib/               # prisma.js (instância do client do Prisma)
├── utils/             # auth.js (assinar/verificar JWT), 
│                        qr.js (assinar/verificar HMAC), seatMap.js
├── prisma/            # schema.prisma, seed.js
└── scripts/           # check-ticketmaster.js (teste manual de fumaça da API)
```

## Problemas conhecidos

- **Cold start do Render**: veja a nota do demo ao vivo acima, o back-end no plano gratuito hiberna após inatividade.
- **Reservas por quantidade, janela de corrida no último ingresso**: o fluxo de mapa de assentos é protegido por uma constraint única no banco, e o fluxo por quantidade usa um lock de linha no evento antes de contar o estoque, então duas compras simultâneas não conseguem ambas ter sucesso além da capacidade. Verificado ao vivo, mas sob carga concorrente real (não apenas duas requisições manuais de teste), isso não foi testado sob estresse.

## Fora de escopo

Conforme o desafio: nota fiscal, revenda entre usuários, aplicativo nativo, recuperação de senha e envio de ingresso por e-mail foram intencionalmente não implementados.

---

**Yasmin Suellen** - [GitHub](https://github.com/yasminsuellen) · [LinkedIn](https://www.linkedin.com/in/yasminsuellen/) · [Portfolio](https://yasminsuellendev.vercel.app/)
