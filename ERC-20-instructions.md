# Arquivo 1 — ERC-20 (Token Fungível) — Requisitos, Tecnologias e Instruções
> Nome sugerido do arquivo: `01-erc20-token.md`

## 1) Objetivo
Implementar um token fungível compatível com **ERC-20**, usado como “moeda” para compra/cunhagem de um NFT (ERC-721) no outro contrato.

## 2) Requisitos funcionais (obrigatórios)
- Compatível com o padrão **ERC-20**.
- Nome e símbolo podem ser quaisquer.
- **18 casas decimais** (padrão).
- **Somente o dono do contrato (owner)** pode:
  - cunhar novos tokens; e
  - transferi-los para contas.
- A operação de “cunhar e transferir” deve poder ocorrer **na mesma função** (mint + transfer).

### Interações esperadas pelo DApp
- Admin chama `mintAndTransfer(to, amount)` para distribuir tokens a usuários.
- Usuário aprova o contrato ERC-721 a gastar tokens via `approve(nftAddress, amount)` (fluxo do front).

## 3) Requisitos não-funcionais
- Código em Solidity `^0.8.x`.
- Usar OpenZeppelin como base (recomendado).
- Emitir eventos relevantes:
  - evento de mint (OpenZeppelin já emite `Transfer(address(0), to, amount)`),
  - evento específico opcional `MintAndTransfer(owner, to, amount)` para facilitar logs no front/testes.

## 4) Tecnologias obrigatórias
- **Hardhat** (preferencial).
- **OpenZeppelin Contracts**.
- Testes com **Mocha/Chai** (padrão do Hardhat).
- Cobertura de testes **> 50%** (mínimo exigido).

## 5) Design do contrato (especificação)
### Contrato: `PaymentToken` (exemplo)
- Herda de:
  - `ERC20`
  - `Ownable`

### Funções
- `constructor()`
  - Define `name` e `symbol`.
  - Decimals padrão 18 (no OZ, o default do ERC20 é 18).
- `function mintAndTransfer(address to, uint256 amount) external onlyOwner`
  - Faz `_mint(owner(), amount)` ou `_mint(to, amount)` (ver nota abaixo)
  - Em seguida garante que `to` receba `amount` na mesma chamada.
  - Deve reverter se `to == address(0)`.

**Nota de implementação (importante):**
- Para simplificar e reduzir gas, pode-se **cunhar direto para `to`** (e ainda assim atende “mint + transfer” no mesmo ato lógico).  
  Porém, como o requisito menciona “mint e transfer na mesma função”, o fluxo mais “literal” é:
  1) `_mint(owner(), amount)`
  2) `_transfer(owner(), to, amount)`
- Em testes, deve-se validar o comportamento exato escolhido.

## 6) Critérios de teste (mínimos)
Criar `test/PaymentToken.test.js` cobrindo:
- Deploy:
  - `owner()` é o deployer.
  - `decimals()` é 18.
- `mintAndTransfer`:
  - Reverte se caller não for owner.
  - Reverte se `to` for `address(0)`.
  - Transfere a quantidade correta.
  - Atualiza `totalSupply` corretamente.
  - Emite eventos esperados (ao menos `Transfer`).
- Aprovação (fluxo do DApp):
  - Usuário chama `approve(spender, value)` e `allowance(owner, spender)` reflete o valor.

## 7) Estrutura recomendada do repositório (smart contracts)
- `contracts/PaymentToken.sol`
- `contracts/NFTMarketplace721.sol` (no outro arquivo, mas no mesmo repo pode existir)
- `test/PaymentToken.test.js`
- `scripts/deploy.js`
- `hardhat.config.js`
- `.env.example`

## 8) Scripts e comandos (Hardhat)
- Instalação:
  - `npm i`
  - `npm i --save-dev hardhat @nomicfoundation/hardhat-toolbox`
  - `npm i @openzeppelin/contracts`
- Testes:
  - `npx hardhat test`
- Cobertura:
  - `npx hardhat coverage`
- Deploy local:
  - `npx hardhat run scripts/deploy.js`
- Deploy testnet:
  - `npx hardhat run scripts/deploy.js --network <rede>`

## 9) Variáveis de ambiente
Criar `.env` a partir de `.env.example`:
- RPC URL da rede
- Private key do deployer
- (Opcional) Etherscan API key para verificação

Exemplo `.env.example`:
- `RPC_URL=`
- `DEPLOYER_PK=`
- `ETHERSCAN_API=`

## 10) Definição de pronto (DoD)
- Contrato compila.
- Testes passam.
- Coverage > 50%.
- `mintAndTransfer` acessível apenas por owner e funcional.
