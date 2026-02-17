

# Proxy PHP para Preview de Compartilhamento do Blog

## Problema
O servidor da Hostinger (plano compartilhado) bloqueia o `mod_proxy`, então a flag `[P]` no `.htaccess` nao funciona. O fallback `302` nao permite que os robos do WhatsApp/Facebook leiam as tags OG, quebrando o preview rico.

## Solucao
Criar um arquivo PHP que atua como proxy local, buscando o HTML da Edge Function e entregando com status 200 no dominio `barbersoft.com.br`.

## Alteracoes

### 1. Criar `public/share.php`
- Recebe o parametro `slug` via `$_GET`
- Faz requisicao HTTP para a Edge Function `blog-share` no Supabase
- Retorna o HTML completo (com tags OG) com status 200
- Inclui tratamento de erro com redirect para `/blog` caso falhe

### 2. Atualizar `public/.htaccess`
- Remover as regras antigas de proxy (`[P]`) e redirect 302
- Adicionar regra simples de rewrite interno: `/share/blog/{slug}` aponta para `share.php?slug={slug}` com flags `[L,QSA]`

### 3. Manter `src/pages/institucional/BlogPost.tsx`
- Sem alteracoes - ja usa a URL `barbersoft.com.br/share/blog/{slug}`

## Fluxo

```text
WhatsApp/Usuario acessa: barbersoft.com.br/share/blog/{slug}
        |
   .htaccess reescreve internamente para share.php?slug={slug}
        |
   share.php faz requisicao HTTP para Edge Function blog-share
        |
   Edge Function retorna HTML com tags OG
        |
   share.php retorna esse HTML com status 200
        |
   Robo le as tags OG / Usuario e redirecionado via meta refresh
```

## Detalhes Tecnicos

**share.php** usara `file_get_contents` com fallback para `cURL` caso o primeiro falhe (compatibilidade com diferentes configuracoes da Hostinger).

**URL da Edge Function**: `https://lgrugpsyewvinlkgmeve.supabase.co/functions/v1/blog-share?slug={slug}`

