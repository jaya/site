# Sistema de Detecção de Idioma e Localização (i18n)

Este documento explica como o site da Jaya Tech lida com a detecção de idioma, geolocalização e as vantagens dessa estratégia para o SEO.

## 🚀 Como funciona o fluxo de decisão

Quando um usuário acessa o site, a lógica de detecção ocorre no arquivo `src/pages/index.astro`. O sistema decide qual versão mostrar seguindo esta ordem de prioridade:

### 1. Cookies (Escolha do Usuário)
Se o usuário já visitou o site e escolheu manualmente um idioma no seletor, um cookie chamado `lang` é salvo. O sistema sempre respeita essa escolha acima de qualquer detecção automática.

### 2. Geolocalização via IP (Prioridade Regional)
Para usuários novos, o sistema tenta identificar o país de origem.
- **Hospedagem**: Na DigitalOcean, capturamos o IP real do usuário através do header `do-connecting-ip`.
- **Serviço**: Usamos a API do **IPinfo.io** para validar o país.
- **Regra**: Se o IP for detectado como sendo do **Brasil (BR)**, o usuário é redirecionado para `/br/`, **mesmo que o navegador dele esteja em inglês**. Isso garante que o conteúdo seja relevante para o mercado local.

### 3. Idioma do Navegador (Padrão de Segurança)
Se a detecção por IP falhar ou o usuário estiver fora do Brasil, o sistema olha para o `Accept-Language` enviado pelo navegador.
- Se contiver `pt`, redireciona para `/br/`.
- Caso contrário, o padrão é `/en/`.

---

## 📈 Vantagens para o SEO

A implementação atual segue as melhores práticas recomendadas pelo Google e outros mecanismos de busca:

### 1. URLs Distintas (Subdiretórios)
Usamos `/br/` e `/en/` para cada versão. Isso é preferível a usar apenas cookies ou parâmetros de URL (`?lang=br`), pois:
- Permite que o Google indexe as duas versões de forma independente.
- Cada página tem sua própria URL "canônica".

### 2. Atributos Hreflang
O sistema está configurado para incluir tags `<link rel="alternate" hreflang="...">`. Isso informa aos motores de busca:
- Que o conteúdo existe em múltiplos idiomas.
- Qual versão deve ser exibida para usuários de diferentes regiões nos resultados de busca.

### 3. Redirecionamento 307 (Temporário)
O redirecionamento na página inicial (`/`) é feito com o status **307 (Temporary Redirect)**. Isso é vital para o SEO porque:
- O Google não "pula" a página raiz permanentemente.
- Ele continua visitando a página inicial para descobrir novas formas de detecção, mas entende que usuários devem ser levados para as pastas específicas de idioma.

### 4. Conteúdo Estático e Rastreável
Apesar da detecção inteligente na "portaria" (`index.astro`), todas as páginas internas (como `/br/culture` ou `/en/culture`) são estáticas e não dependem de cookies ou IPs para serem renderizadas. Isso garante que o robô do Google consiga ler todo o site sem obstáculos.

---

## 🛠 Configuração Técnica

### Variáveis de Ambiente
O token da API IPinfo deve ser configurado como uma variável de ambiente:
- **Local**: Arquivo `.env` como `IPINFO_TOKEN`.
- **Produção (DigitalOcean)**: Adicione `IPINFO_TOKEN` nas configurações do App Platform.

### Performance
Para garantir que a detecção por IP não atrase o carregamento para o usuário, o sistema possui:
- **Timeout**: Se a API IPinfo não responder em até 3 segundos, o sistema ignora o IP e usa o idioma do navegador como plano B.
- **Vary Headers**: Instruímos sistemas de cache a considerar o IP e o idioma do navegador para não entregar a versão errada para o usuário errado.
