

## Corrigir o botao "Cancelar Conexao" do WhatsApp

### Problema identificado

Quando o usuario clica em "Cancelar Conexao" durante o processo de conexao (QR Code visivel), acontece o seguinte ciclo:

1. O `disconnect()` e chamado, que define o estado como `"disconnected"`
2. A interface continua mostrando a area de conexao porque a condicao de renderizacao inclui o estado `"disconnected"` (linha 187 do componente)
3. O efeito `autoConnect` detecta que o estado voltou para `"disconnected"` e cria uma nova instancia automaticamente
4. Resultado: o modal nunca fecha e fica em loop

### Solucao

Duas alteracoes serao feitas:

**1. `UnitWhatsAppIntegration.tsx` - Usar `cleanup()` e fechar o modal ao cancelar**

- Criar uma nova funcao `handleCancelConnection` que:
  - Chama `cleanup()` (que deleta a instancia da Evolution API) em vez de `disconnect()` (que e para instancias ja conectadas)
  - Notifica o componente pai para fechar o modal via um novo callback `onClose`
- Substituir todas as chamadas de `handleDisconnect` nos botoes "Cancelar Conexao" por `handleCancelConnection`
- Adicionar `onClose` como prop opcional do componente

**2. `UnitWhatsAppModal.tsx` - Passar callback de fechamento**

- Passar a funcao `onClose` do modal como prop para `UnitWhatsAppIntegration`, permitindo que o componente feche o modal apos o cancelamento

### Detalhes tecnicos

```text
Fluxo atual (com bug):
  Cancelar -> disconnect() -> state="disconnected" -> UI mostra loading -> autoConnect recria instancia

Fluxo corrigido:
  Cancelar -> cleanup() -> state="disconnected" -> onClose() fecha o modal -> autoConnect nao dispara (modal fechado)
```

Arquivos a modificar:
- `src/components/units/UnitWhatsAppIntegration.tsx` - Adicionar prop `onClose`, criar `handleCancelConnection`
- `src/components/units/UnitWhatsAppModal.tsx` - Passar `onClose` para o componente filho

