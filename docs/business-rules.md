# Regras de Negocio

## Visao estrategica

O CRM BR-459 atende lojas de caminhoes com uma logica orientada a demanda. O sistema combina CRM, operacao, estoque, servicos e inteligencia de mercado.

Principio mestre:

> O negocio nasce da demanda do cliente, nao da existencia de um produto em estoque.

## Principios

- nem toda venda nasce de um caminhao em estoque
- cliente chega com demanda e a oportunidade passa a existir
- o produto pode existir antes, durante ou depois do negocio
- estoque parado custa dinheiro e precisa ser tratado como alerta
- o sistema deve lembrar, alertar e sugerir acoes

## Entidades centrais

### Pessoa

Pessoa e a identidade unica do ecossistema. Pode assumir varios papeis ao mesmo tempo:

- comprador
- decisor
- financeiro
- tecnico
- fornecedor
- parceiro
- prestador de servico

### Empresa

Representa clientes PJ, parceiros e fornecedores.

Regras:

- uma empresa pode ter varias pessoas
- uma empresa pode gerar varios negocios
- o historico deve ficar centralizado

### Negocio

Negocio representa a oportunidade comercial.

Pode nascer de:

- contato direto de uma pessoa
- solicitacao de uma empresa
- demanda futura
- prospeccao do vendedor

Regras:

- produto e opcional no inicio
- pessoa e empresa podem ser opcionais no cadastro inicial
- o foco inicial e registrar a demanda e mover a oportunidade no funil

Campos esperados:

- tipo de demanda
- descricao do que o cliente procura
- orcamento estimado
- prioridade
- status do funil
- pessoas envolvidas
- empresa envolvida

### Produto

Produto representa o caminhao ou veiculo fisico.

Regras:

- pode existir sem negocio
- pode ser comprado por causa de um negocio
- pode ser vendido sem passar por estoque tradicional

### Servico

Servico cobre manutencao, regularizacao, transporte, vistoria e outras prestacoes.

Regras:

- pode estar vinculado a produto, negocio ou prestador
- deve impactar a margem real

## Fluxos principais

### Demanda gera negocio

1. Cliente informa o que procura
2. Sistema cria o negocio
3. Vendedor busca no mercado
4. Produto e encontrado ou adquirido
5. Produto e associado ao negocio
6. Venda acontece

### Estoque gera oportunidade

1. Caminhao entra no estoque
2. Sistema identifica perfis aderentes
3. Negocio e criado
4. Time comercial aborda clientes
5. Venda acontece

## Modulos funcionais

### Negocios

- criacao sem produto
- registro de demanda
- funil comercial
- associacao progressiva com pessoa, empresa e produto

### Estoque

- cadastro de caminhoes
- status operacional
- custos, pendencias e historico
- apoio de IA para preco medio, estoque parado e sugestao de venda

### Pessoas

- cadastro unico
- multiplos papeis
- historico de negocios, produtos e servicos

### Servicos

- registro antes ou depois da compra
- vinculo opcional com produto e negocio
- impacto na margem

### IA

- busca de caminhoes conforme demanda ativa
- comparacao externa de precos
- sugestao de compra para atender demanda
- identificacao de padroes e estoque ideal

### Alertas

Exemplos:

- negocio ativo sem produto associado
- demanda recorrente sem estoque correspondente
- cliente procurando modelo ha varios dias
- produto encontrado aderente a demanda aberta

## Dashboard e indicadores

O dashboard deve permitir filtros por periodo, vendedor, tipo de negocio, categoria/modelo, cidade/regiao e status.

Indicadores esperados:

- vendas realizadas
- lucro real e margem real
- ticket medio
- descontos concedidos
- valor investido em estoque
- capital parado
- ROI
- giro de estoque
- tempo medio parado
- negocios criados
- negocios por etapa
- taxa de conversao
- tempo medio para fechar
- negocios sem produto associado
- top compradores
- fornecedores mais utilizados
- prestadores com maior custo ou atraso

Lucro real considera:

- custo de aquisicao
- custo de servicos
- despesas vinculadas

## Roadmap

1. Base relacional: pessoas, empresas e negocios por demanda
2. Operacao: estoque, servicos e associacoes dinamicas
3. Inteligencia: dashboards, IA de mercado e alertas
4. Automacao: sugestoes automaticas, bot multicanal e evolucao SaaS
