# Arquivo 2 — ERC-721 (NFT) — Requisitos, Tecnologias e Instruções
> Nome sugerido do arquivo: `02-erc721-nft.md`

## 1) Objetivo
Implementar um NFT compatível com **ERC-721** cuja cunhagem exige o pagamento em **tokens ERC-20** (do contrato do Arquivo 1), via `transferFrom`.

## 2) Requisitos funcionais (obrigatórios)
- Compatível com o padrão **ERC-721**.
- Nome e símbolo podem ser quaisquer.
- `constructor` com **dois parâmetros**:
  - `tokenAddress` (endereço do contrato ERC-20)
  - `price` (preço do NFT em unidades do ERC-20, respeitando decimais)
- `price` deve ser **variável de estado pública**, para consulta do front.
- Deve existir a função `tokenURI(uint256 tokenId)` retornando a URI de metadados do token.

### Cunhagem (mint) com pagamento em ERC-20
- `mint()` pode ser chamada por **qualquer pessoa**.
- Ao cunhar, deve transferir `price` tokens do chamador (`msg.sender`) para o **dono do contrato ERC-721** (`owner()`).
- Deve usar preferencialmente `transferFrom` do ERC-20.
- Para isso funcionar, o usuário precisa antes chamar `approve(erc721Address, price)` no ERC-20.
- **O dono do contrato ERC-721 não tem privilégio de cunhar NFT sem pagar**. Ou seja: owner também deve cumprir o mesmo fluxo (approve + mint), se quiser cunhar.

### Atualização de preço
- Deve existir `setPrice(uint256 newPrice)`:
  - Apenas `owner` pode chamar.
  - Atenção às casas decimais (ERC-20 tem 18).

## 3) Metadados (OpenSea)
O JSON deve seguir o padrão sugerido pela OpenSea. Guardar um exemplo em `metadata/1.json` e apontar a baseURI/URI para ele.

**Link (referência) — colocar em código para facilitar cópia:**
