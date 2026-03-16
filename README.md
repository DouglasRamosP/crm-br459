# CRM BR-459

Sistema web para loja de caminhoes com foco em CRM, operacao, estoque, servicos e inteligencia de mercado.

## Regra de negocio central

O sistema e orientado a demanda:

- o negocio nasce quando o cliente informa o que precisa
- o produto pode entrar antes, durante ou depois do negocio
- estoque e resposta estrategica, nao o centro do sistema
- servicos e despesas impactam margem real
- a plataforma deve alertar, lembrar e sugerir proximos passos

Esse contexto agora e a fonte de verdade funcional do projeto.

Documento principal:

- [docs/business-rules.md](/home/drpimenta/projects/crm-br459/docs/business-rules.md)

## Modulos previstos

- Negocios: oportunidades criadas a partir da demanda
- Estoque: caminhoes, custo, giro e estoque parado
- Pessoas: identidade unica com papeis dinamicos
- Empresas: clientes PJ, parceiros e fornecedores
- Servicos: custos operacionais que afetam a margem
- IA e alertas: sugestoes de compra, precificacao e notificacoes
- Dashboard: indicadores gerenciais com filtros por periodo

## Stack atual

- Frontend: React + Vite + Tailwind CSS
- Mock API: JSON Server
- Backend planejado: Node.js + API REST
- Banco planejado: PostgreSQL ou MongoDB
- IA planejada: integracao com APIs externas

## Executando localmente

Instale as dependencias do projeto raiz e do frontend:

```bash
npm install
cd frontend
npm install
cd ..
```

Depois suba frontend + mock API em paralelo:

```bash
npm run dev
```

Servicos esperados:

- frontend Vite: `http://localhost:5173`
- json-server: `http://localhost:3001`
- endpoint de empresas: `http://localhost:3001/companies`

## Estado atual

O frontend inicial foi reorganizado para refletir o dominio de uma loja de caminhoes orientada a demanda, com:

- dashboard executivo
- navegacao por modulos de negocio
- KPIs e alertas estrategicos
- dados de exemplo alinhados ao novo dominio
- modulos de empresas, negocios, estoque, pessoas e servicos com persistencia via json-server

## Proximos passos sugeridos

- evoluir filtros e dashboard para consumir os recursos reais do json-server
- criar funil de negocios com CRUD
- conectar filtros do dashboard a dados reais do json-server
- adicionar autenticacao, perfis e trilha de auditoria
