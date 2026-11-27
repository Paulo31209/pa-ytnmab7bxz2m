/* Conteúdo inicial do plano. O que você editar no site fica salvo no navegador;
   este arquivo só é usado na primeira abertura ou ao "Restaurar plano original". */

window.STATUS = [
  { id: "todo",    label: "A fazer",      badge: "badge-outline" },
  { id: "doing",   label: "Em andamento", badge: "badge-info" },
  { id: "blocked", label: "Bloqueado",    badge: "badge-warning" },
  { id: "done",    label: "Concluído",    badge: "badge-success" },
];
window.PRIORIDADES = ["Crítica", "Alta", "Média", "Baixa"];

window.DEFAULT_DEMANDAS = [
  {
    key: "rede", num: "0", icon: "🌐",
    title: "Rede dedicada full duplex / IP dedicado (2 a 5 Gbps)",
    summary: "Link simétrico com banda garantida e IP fixo para a origem das lives e os servidores.",
    priority: "Crítica", status: "todo", area: "Infraestrutura", depends: "2",
    tasks: [
      "Medir o consumo de banda atual (pico durante uma live)",
      "Calcular a banda necessária (bitrate × espectadores × margem de 40%)",
      "Cotar link dedicado com pelo menos 3 operadoras",
      "Exigir na proposta: SLA, bloco de IP fixo (/29) e IPv6",
      "Conferir se roteador, switch e placas de rede suportam 10 GbE (SFP+)",
      "Contratar 2º link de outra operadora (backup)",
      "Configurar failover automático entre os dois links",
      "Teste de aceite com iperf3 (upload e download por 24h)",
    ],
  },
  {
    key: "apple", num: "1", icon: "🍎",
    title: "Ligar para a Apple e verificar o status da conta",
    summary: "Confirmar se a conta Apple Developer está ativa, sem pendências e pronta para publicar.",
    priority: "Alta", status: "todo", area: "Contas", depends: "",
    tasks: [
      "Juntar Apple ID, Team ID, CNPJ e número D-U-N-S",
      "Abrir contato em developer.apple.com/contact e pedir ligação",
      "Verificar status e data de renovação da assinatura (anual)",
      "Conferir Agreements, Tax and Banking (aceitar contratos pendentes)",
      "Confirmar quem é o Account Holder e dar acesso Admin à equipe",
      "Conferir certificados e perfis de provisionamento vencidos",
      "Registrar o número do caso e a resposta no Diário",
    ],
  },
  {
    key: "inventario", num: "2", icon: "🗂️",
    title: "Levantamento de tudo que tem nos servidores",
    summary: "Inventário completo: máquinas, serviços, portas, domínios, SSL, backups, custos e acessos.",
    priority: "Crítica", status: "todo", area: "Infraestrutura", depends: "",
    tasks: [
      "Listar todas as máquinas (cloud, VPS e servidor local)",
      "Coletar hardware, sistema, IP e forma de acesso de cada uma",
      "Mapear serviços, portas e containers rodando",
      "Mapear domínios, onde está o DNS e validade dos certificados SSL",
      "Mapear backups (onde ficam, frequência, último teste de restauração)",
      "Mapear custos mensais e vencimento dos contratos",
      "Guardar as credenciais num cofre de senhas (Bitwarden/Vaultwarden)",
      "Desenhar o diagrama da arquitetura atual",
    ],
  },
  {
    key: "live", num: "3", icon: "📡",
    title: "Servidor local redundante da live com buffer (DVR)",
    summary: "Servidor local recebe a live em paralelo, guarda o buffer e o player deixa voltar, adiantar 15 s ou ir AO VIVO.",
    priority: "Alta", status: "todo", area: "Streaming", depends: "0, 2",
    tasks: [
      "Escolher o software do servidor local (SRS ou MediaMTX)",
      "Configurar a entrada RTMP/SRT no servidor local",
      "Configurar o encoder (OBS/vMix) para enviar a 2 destinos ao mesmo tempo",
      "Configurar HLS com janela de DVR (ex.: 2 horas)",
      "Player: botões −15 s / +15 s e botão AO VIVO",
      "Player: ao reconectar, perguntar “continuar de onde parou ou ir ao vivo?”",
      "Player: troca automática do servidor principal para o local",
      "Teste: derrubar o servidor principal durante uma live de teste",
      "Teste: cortar a internet do espectador por 1 min e voltar",
    ],
  },
  {
    key: "lojas", num: "4", icon: "📱",
    title: "Lançar os apps IAVE e META na Google Play e na App Store",
    summary: "Publicar os dois aplicativos nas duas lojas, com fichas, políticas e testes prontos.",
    priority: "Alta", status: "todo", area: "Aplicativos", depends: "1",
    tasks: [
      "Confirmar contas ativas: Play Console (Organização) e Apple Developer",
      "Publicar política de privacidade e página de exclusão de conta",
      "Criar conta demo para os revisores das lojas",
      "IAVE — gerar build Android (AAB) e iOS",
      "IAVE — preparar ícone, screenshots e textos da loja",
      "IAVE — teste fechado (Play) e TestFlight (Apple)",
      "IAVE — enviar para revisão nas duas lojas",
      "META — gerar build Android (AAB) e iOS",
      "META — preparar ícone, screenshots e textos da loja",
      "META — teste fechado (Play) e TestFlight (Apple)",
      "META — enviar para revisão nas duas lojas",
    ],
  },
  {
    key: "redundancia", num: "5", icon: "🛡️",
    title: "Plano de redundância: apps e domínio redundante em máquinas diferentes",
    summary: "Se uma máquina, provedor ou domínio cair, outro assume sozinho e os apps continuam funcionando.",
    priority: "Alta", status: "todo", area: "Infraestrutura", depends: "2",
    tasks: [
      "Definir metas: RTO (tempo para voltar) e RPO (perda máxima de dados)",
      "Registrar domínio reserva em outro registrador",
      "Ativar renovação automática e trava de transferência nos domínios",
      "Subir 2ª máquina em provedor diferente com o mesmo deploy",
      "DNS com health check e failover automático (TTL 60 s)",
      "Replicação/backup do banco + teste de restauração",
      "Apps: lista de endereços reserva via configuração remota",
      "Escrever o runbook de failover e testar a cada 3 meses",
    ],
  },
  {
    key: "ia", num: "6", icon: "🤖",
    title: "Adicionar modelos de IA: chat, transcrição, voz e assistente",
    summary: "Colocar IA nos apps e serviços: chat inteligente, transcrição e legendas, voz (fala ↔ texto) e um assistente que executa tarefas.",
    priority: "Média", status: "todo", area: "Inteligência Artificial", depends: "2, 4",
    tasks: [
      "Definir os casos de uso e a prioridade de cada um (chat, transcrição, voz, assistente)",
      "Criar as contas e chaves de API e guardar no cofre de senhas",
      "Montar o “gateway de IA” no servidor (as chaves NUNCA ficam dentro do app)",
      "Chat: integrar o modelo de linguagem com resposta em tempo real (streaming)",
      "Transcrição: legendas automáticas da live e transcrição de áudios/vídeos",
      "Voz: texto → fala (TTS) e fala → texto no app",
      "Assistente: base de conhecimento (FAQ/documentos) + ações (ferramentas)",
      "Assistente no WhatsApp para atendimento",
      "Limites de custo por usuário/dia e alerta de gasto (ligar à demanda 8)",
      "LGPD: avisar o uso de IA e de gravação de voz na política de privacidade",
      "Teste piloto com usuários reais e medir qualidade × custo",
    ],
  },
  {
    key: "alertas", num: "8", icon: "🚨",
    title: "Automação de contingência, alarmes e alertas no WhatsApp",
    summary: "Monitorar servidores e serviços, corrigir sozinho o que der e avisar nos grupos de WhatsApp.",
    priority: "Crítica", status: "todo", area: "Monitoramento", depends: "2",
    tasks: [
      "Instalar o Uptime Kuma numa máquina FORA da infraestrutura monitorada",
      "Cadastrar checagens de sites, APIs, live e portas",
      "Instalar Netdata ou Prometheus para CPU, RAM e disco",
      "Configurar gateway de WhatsApp com chip dedicado",
      "Criar grupos: Críticos, Avisos e Relatório diário",
      "Mensagem de RESOLVIDO e escalonamento por ligação",
      "Auto-recuperação: reinício automático de serviços e containers",
      "Escrever runbook para cada alerta crítico",
      "Teste: derrubar um serviço e conferir o alerta em menos de 2 min",
    ],
  },
];

window.ROTEIRO = [
  { fase: "Semana 1", titulo: "Saber o que temos", itens: ["1 · Ligar para a Apple (rápido, destrava o 4)", "2 · Levantamento dos servidores", "0 · Pedir cotações de link"] },
  { fase: "Semanas 2–3", titulo: "Enxergar e proteger", itens: ["8 · Monitoramento e alertas no WhatsApp", "0 · Instalar link dedicado + backup", "4 · Preparar fichas das lojas"] },
  { fase: "Semanas 3–5", titulo: "Redundância", itens: ["3 · Servidor local com DVR da live", "5 · Domínio e máquinas redundantes", "4 · Enviar apps para revisão"] },
  { fase: "Semanas 5–8", titulo: "Inteligência Artificial", itens: ["6 · Gateway de IA no servidor", "6 · Chat e transcrição (legendas da live)", "6 · Voz e assistente (app + WhatsApp)"] },
  { fase: "Contínuo", titulo: "Testar sempre", itens: ["Simular queda a cada 3 meses", "Revisar inventário todo mês", "Teste de restauração de backup"] },
];

window.DEFAULT_SERVERS = [
  { nome: "Servidor local", funcao: "Live redundante / DVR", ip: "", provedor: "Local", so: "", servicos: "", dominios: "", ssl: "", backup: "", custo: "", obs: "" },
  { nome: "Servidor principal", funcao: "", ip: "", provedor: "", so: "", servicos: "", dominios: "", ssl: "", backup: "", custo: "", obs: "" },
];

/* Guias "como fazer" de cada demanda (fixos, não são salvos no navegador). */
window.GUIDES = {
rede: `
<h3>Por que link dedicado</h3>
<p>Internet comum é “até X Mbps”, compartilhada e com upload baixo. Link dedicado é <b>simétrico</b> (mesma velocidade para subir e descer), com banda garantida, IP fixo e <b>SLA</b> (multa se cair).</p>
<h3>Quanto de banda você precisa</h3>
<div class="callout"><b>Regra:</b> se o servidor local vai entregar vídeo direto aos espectadores, a banda é <code>espectadores × bitrate</code>. Ex.: 1.000 pessoas × 4 Mbps = <b>4 Gbps</b>. Se a entrega for por CDN, o local só precisa enviar alguns streams (dezenas de Mbps).</div>
<h3>O que exigir na cotação</h3>
<ul>
  <li>Velocidade simétrica (ex.: 2 Gbps ↑ / 2 Gbps ↓), entrega em fibra.</li>
  <li>Bloco de IPs fixos (/29 = 5 IPs úteis) + IPv6.</li>
  <li>SLA de disponibilidade ≥ 99,7% e tempo de reparo ≤ 4 h, suporte 24×7.</li>
  <li>Porta de entrega 10 GbE (acima de 1 Gbps, porta gigabit não serve).</li>
</ul>
<h3>Equipamento</h3>
<p>Roteador/firewall, switch e placa do servidor com portas <b>10 GbE (SFP+)</b>. Ex.: MikroTik CCR, pfSense/OPNsense em hardware com SFP+.</p>
<h3>Redundância</h3>
<p>2º link de <b>outra operadora</b> (de preferência entrando por outro caminho físico), com failover automático no roteador.</p>
<h3>Teste de aceite</h3>
<pre><code># no servidor de teste (fora da rede)
iperf3 -s
# no servidor local: upload, download e bidirecional
iperf3 -c IP_DO_TESTE -t 60 -P 8
iperf3 -c IP_DO_TESTE -t 60 -P 8 -R
iperf3 -c IP_DO_TESTE -t 60 --bidir</code></pre>`,

apple: `
<h3>Antes de ligar, tenha em mãos</h3>
<ul>
  <li>Apple ID (e-mail) do dono da conta e acesso ao celular dele (código 2FA).</li>
  <li><b>Team ID</b> — developer.apple.com → Account → Membership details.</li>
  <li>CNPJ, razão social exata e número <b>D-U-N-S</b>.</li>
</ul>
<h3>Como pedir a ligação</h3>
<p>Entre em <code>developer.apple.com/contact</code> logado na conta → <i>Membership and Account</i> → escolha a opção de telefone. A Apple liga de volta.</p>
<h3>Perguntas para fazer</h3>
<ol>
  <li>A assinatura está ativa? Quando vence? Está como <b>Organização</b>?</li>
  <li>Existe algum contrato pendente em <i>Agreements, Tax and Banking</i>?</li>
  <li>Existe alguma restrição, bloqueio ou análise na conta?</li>
  <li>Quem é o Account Holder? (só ele aceita contratos)</li>
  <li>Algo impede publicar os apps IAVE e META?</li>
</ol>
<div class="callout"><b>Anote o número do caso</b> e o nome do atendente no Diário deste site.</div>`,

inventario: `
<h3>O que coletar de cada máquina</h3>
<p>Use a página <b>Inventário de servidores</b> (menu ao lado) para preencher a tabela.</p>
<h3>Comandos — Linux</h3>
<pre><code>hostnamectl                 # nome e sistema
lscpu | head -15; free -h   # CPU e memória
df -h                       # discos
ip -br a                    # IPs
ss -tulpn                   # portas abertas e quem usa
systemctl list-units --type=service --state=running
docker ps -a                # containers
crontab -l; ls /etc/cron.d  # tarefas agendadas
ls /etc/nginx/sites-enabled # sites no nginx
certbot certificates        # SSL e validade</code></pre>
<h3>Comandos — Windows (PowerShell)</h3>
<pre><code>systeminfo
Get-Service | Where-Object Status -eq Running
Get-NetTCPConnection -State Listen | Sort-Object LocalPort
Get-ScheduledTask | Where-Object State -ne Disabled</code></pre>
<h3>Não esqueça</h3>
<ul>
  <li><b>Domínios:</b> registrador, quem controla o DNS, data de vencimento.</li>
  <li><b>Contas de nuvem</b> e de serviços (CDN, e-mail, lojas, gateways).</li>
  <li><b>Backups:</b> quando foi o último teste de restauração?</li>
</ul>
<div class="callout warn"><b>Senhas não vão nesta tabela.</b> Guarde em um cofre (Bitwarden/Vaultwarden) e anote aqui só “onde está”.</div>`,

live: `
<h3>Como fica a arquitetura</h3>
<pre class="diagram">  Encoder (OBS / vMix)
        │  envia o mesmo sinal para 2 lugares
   ┌────┴─────────────┐
   ▼                  ▼
[A] Servidor        [B] Servidor LOCAL
    principal           SRS ou MediaMTX
    (nuvem/CDN)         HLS + janela DVR 2h
   │                  │
   └──────┬───────────┘
          ▼
   Player (hls.js): usa A; se A falhar → B</pre>
<h3>Comportamento do player</h3>
<ul>
  <li><b>Internet do espectador caiu e voltou:</b> o player continua de onde parou (o servidor guardou o buffer) e mostra: <i>“Você está 2:35 atrás — Continuar ou Ir AO VIVO?”</i></li>
  <li>Botões <b>−15 s</b> e <b>+15 s</b> para voltar e adiantar.</li>
  <li>Botão <b>AO VIVO</b> pulsando quando está atrasado; cinza quando já está ao vivo.</li>
</ul>
<h3>Servidor local</h3>
<ul>
  <li><b>SRS</b> ou <b>MediaMTX</b> (código aberto) recebendo RTMP ou SRT. SRT aguenta melhor redes instáveis.</li>
  <li>Janela de DVR = nº de segmentos × duração do segmento. Ex.: segmentos de 4 s × 1.800 = 2 horas.</li>
  <li>Precisa do <b>IP fixo</b> da demanda 0 + HTTPS (proxy reverso com certificado).</li>
</ul>
<h3>Trecho do player (hls.js)</h3>
<pre><code>const FONTES = ["https://live.principal.com/stream.m3u8",
                "https://live-local.seudominio.com/stream.m3u8"];
let fonte = 0;
const hls = new Hls({ liveSyncDurationCount: 3 }); // não pula sozinho para o ao vivo
hls.loadSource(FONTES[fonte]); hls.attachMedia(video);

hls.on(Hls.Events.ERROR, (_, d) => {
  if (!d.fatal) return;
  if (d.type === Hls.ErrorTypes.NETWORK_ERROR && navigator.onLine) {
    fonte = (fonte + 1) % FONTES.length;      // troca para o servidor reserva
    hls.loadSource(FONTES[fonte]);
  } else hls.recoverMediaError();
});

const atraso = () => (hls.liveSyncPosition ?? video.currentTime) - video.currentTime;
btnVoltar.onclick  = () => video.currentTime -= 15;
btnAvancar.onclick = () => video.currentTime = Math.min(video.currentTime + 15, hls.liveSyncPosition);
btnAoVivo.onclick  = () => video.currentTime = hls.liveSyncPosition;

window.addEventListener("online", () => {
  hls.startLoad();
  if (atraso() > 20) mostrarPergunta("Continuar de onde parou ou ir AO VIVO?");
});</code></pre>`,

lojas: `
<h3>Google Play</h3>
<ul>
  <li>Conta no Play Console como <b>Organização</b> (pede D-U-N-S). Conta pessoal nova exige teste fechado com 12 testadores por 14 dias antes de publicar.</li>
  <li>Build em <b>AAB</b> assinado (Play App Signing) e <code>targetSdk</code> no nível que o Play Console exigir no momento.</li>
  <li>Ficha: ícone 512×512, imagem de destaque 1024×500, mínimo 2 screenshots, descrição curta (80 caracteres) e completa.</li>
  <li>Formulários: <b>Segurança dos dados</b>, classificação de conteúdo, público-alvo, acesso ao app (login de teste), URL de exclusão de conta.</li>
</ul>
<h3>Apple App Store</h3>
<ul>
  <li>Bundle ID, certificado de distribuição e perfil → build pelo Xcode, EAS (Expo) ou Codemagic → <b>TestFlight</b>.</li>
  <li>App Store Connect: screenshots de iPhone (e iPad, se suportar), rótulos de privacidade, URL de privacidade e de suporte.</li>
  <li><b>Conta demo</b> para o revisor e <b>exclusão de conta dentro do app</b> (obrigatório se o app tem cadastro).</li>
  <li>Login com Google/Facebook? Ofereça também “Entrar com Apple” (ou opção equivalente).</li>
</ul>
<div class="callout warn"><b>Motivos comuns de rejeição:</b> app que é só um site dentro de WebView (diretriz 4.2), falta de conta demo, links quebrados, travamentos, textos/imagens de exemplo.</div>
<h3>Checklist por app</h3>
<table class="mini"><tr><th></th><th>IAVE</th><th>META</th></tr>
<tr><td>Nome e ícone</td><td>☐</td><td>☐</td></tr>
<tr><td>Screenshots</td><td>☐</td><td>☐</td></tr>
<tr><td>Política de privacidade</td><td>☐</td><td>☐</td></tr>
<tr><td>Conta demo</td><td>☐</td><td>☐</td></tr>
<tr><td>Build Android (AAB)</td><td>☐</td><td>☐</td></tr>
<tr><td>Build iOS (TestFlight)</td><td>☐</td><td>☐</td></tr></table>`,

redundancia: `
<h3>Camadas da redundância</h3>
<table class="mini">
<tr><th>Camada</th><th>Como proteger</th></tr>
<tr><td>Domínio</td><td>Renovação automática por 2+ anos, trava de transferência, domínio reserva em <b>outro registrador</b>.</td></tr>
<tr><td>DNS</td><td>Provedor com health check e failover (Cloudflare Load Balancing, AWS Route 53). TTL de 60 s nos registros críticos.</td></tr>
<tr><td>Servidores</td><td>Mínimo 2 máquinas em <b>provedores diferentes</b> (ou nuvem + servidor local), com o mesmo deploy (Docker Compose + Git).</td></tr>
<tr><td>Banco de dados</td><td>Réplica ou backup contínuo. Regra 3-2-1: 3 cópias, 2 mídias, 1 fora do local. Testar restauração todo mês.</td></tr>
<tr><td>Arquivos / mídia</td><td>Storage com replicação (S3, R2) ou sincronização entre as máquinas.</td></tr>
<tr><td>Apps</td><td>Não fixar um endereço só: o app lê uma lista de endereços (configuração remota) e tenta o próximo se o primeiro falhar. Assim não é preciso republicar na loja.</td></tr>
</table>
<h3>Exemplo: app com endereço reserva</h3>
<pre><code>const APIS = ["https://api.seudominio.com", "https://api.dominioreserva.com.br"];
async function chamar(caminho, opcoes) {
  for (const base of APIS) {
    try {
      const r = await fetch(base + caminho, { ...opcoes, signal: AbortSignal.timeout(5000) });
      if (r.ok) return r;
    } catch (_) { /* tenta o próximo */ }
  }
  throw new Error("Todos os servidores fora do ar");
}</code></pre>
<h3>Runbook de failover (modelo)</h3>
<ol><li>Alerta chega no WhatsApp (demanda 8).</li><li>Confirmar a queda pelo Uptime Kuma.</li><li>DNS troca sozinho; se não trocar em 2 min, trocar manualmente.</li><li>Avisar a equipe no grupo e registrar no Diário.</li><li>Depois de resolvido: voltar para o principal e escrever o que aconteceu.</li></ol>`,

ia: `
<h3>Os 4 tipos de IA e o que cada um faz</h3>
<table class="mini">
<tr><th>Tipo</th><th>O que faz</th><th>Uso nos seus projetos</th></tr>
<tr><td>💬 <b>Chat</b> (modelo de linguagem)</td><td>Entende e escreve texto, responde perguntas, resume.</td><td>Chat dentro dos apps IAVE/META, resumo da live, respostas a comentários.</td></tr>
<tr><td>📝 <b>Transcrição</b> (fala → texto)</td><td>Converte áudio em texto, ao vivo ou de arquivo.</td><td>Legendas automáticas da live, atas, busca dentro dos vídeos, áudios do WhatsApp.</td></tr>
<tr><td>🔊 <b>Voz</b> (texto → fala)</td><td>Lê texto em voz natural.</td><td>Leitura de conteúdos, avisos falados, respostas por áudio no WhatsApp.</td></tr>
<tr><td>🧠 <b>Assistente</b></td><td>Chat + memória + ferramentas: consulta dados e executa ações.</td><td>Atendimento 24h, “onde está minha live?”, assistente da equipe que lê os alertas e o inventário.</td></tr>
</table>

<h3>Modelos sugeridos</h3>
<p><b>Chat e assistente — Claude (Anthropic)</b>, preço por 1 milhão de tokens (entrada / saída):</p>
<table class="mini">
<tr><th>Modelo</th><th>ID na API</th><th>Quando usar</th><th>US$ / 1M tokens</th></tr>
<tr><td>Claude Opus 5.5</td><td><code>claude-opus-5-5</code></td><td>Padrão recomendado: assistente com ferramentas, tarefas complexas, respostas de alta qualidade.</td><td>4 / 20</td></tr>
<tr><td>Claude Sonnet 5.5</td><td><code>claude-sonnet-5-5</code></td><td>Equilíbrio entre velocidade e capacidade para o dia a dia.</td><td>2 / 10</td></tr>
<tr><td>Claude Haiku 5.5</td><td><code>claude-haiku-5-5</code></td><td>Muito volume e baixo custo: classificar mensagens, respostas curtas, triagem.</td><td>0,10 / 0,50</td></tr>
<tr><td>Claude Fable 5.2</td><td><code>claude-fable-5-2</code></td><td>O mais capaz; só para problemas muito difíceis (mais caro).</td><td>8 / 40</td></tr>
</table>
<p>Os modelos Claude trabalham com <b>texto e imagem</b>, não com áudio. Para transcrição e voz use serviços próprios de áudio:</p>
<ul>
  <li><b>Transcrição:</b> Whisper (código aberto — dá para rodar no <b>servidor local</b>, sem custo por minuto, ex.: <code>faster-whisper</code>) ou APIs como Deepgram e AssemblyAI (melhores para legenda ao vivo com baixa latência).</li>
  <li><b>Voz (TTS):</b> ElevenLabs (voz mais natural, permite voz personalizada), Azure ou Google Cloud TTS (muitas vozes em PT-BR), ou Piper (código aberto, roda local).</li>
</ul>
<div class="callout">Preços e modelos mudam com frequência. Confirme no site de cada fornecedor antes de fechar o orçamento e teste 2 opções de cada tipo com áudios reais seus.</div>

<h3>Arquitetura recomendada</h3>
<pre class="diagram">  App IAVE / META / WhatsApp / Site
                │  (nunca chama a IA direto)
                ▼
     ┌───────────────────────────┐
     │   GATEWAY DE IA (seu)     │  login do usuário, limite por dia,
     │   servidor / API própria  │  registro de custo, troca de fornecedor
     └───┬─────────┬─────────┬───┘
         ▼         ▼         ▼
      Chat /    Transcrição  Voz (TTS)
    Assistente  (Whisper ou  (ElevenLabs,
     (Claude)    API)         Azure, Piper)</pre>
<ul>
  <li><b>Chaves de API só no servidor.</b> Chave dentro do app é descoberta e usada por outros, e a conta vem para você.</li>
  <li>O gateway permite <b>trocar de modelo sem republicar o app</b> nas lojas (mesma ideia da demanda 5).</li>
  <li>Limite de uso por usuário e por dia + alerta no WhatsApp se o gasto do dia passar do previsto (demanda 8).</li>
</ul>

<h3>Legenda automática da live</h3>
<pre class="diagram">Servidor local (demanda 3) ── áudio da live ──▶ Transcrição em tempo real
                                                  │
                         legenda WebVTT ◀─────────┘ ──▶ player mostra a legenda</pre>

<h3>Assistente: o que ele precisa</h3>
<ol>
  <li><b>Instruções</b> (quem ele é, tom de voz, o que pode e não pode fazer).</li>
  <li><b>Base de conhecimento</b>: FAQ, regras, horários, documentos — para responder certo e não inventar.</li>
  <li><b>Ferramentas</b>: funções do seu sistema que ele pode chamar (ex.: “consultar status da live”, “abrir chamado”, “buscar pedido”). Ações que mexem em dinheiro ou dados pedem confirmação humana.</li>
  <li><b>Transferência para humano</b> quando não souber ou o cliente pedir.</li>
</ol>

<h3>Custos — como estimar</h3>
<p>1 token ≈ ¾ de uma palavra. Uma conversa curta de chat gasta poucos milhares de tokens. Faça o piloto, meça o gasto real por conversa e multiplique pelo volume esperado antes de liberar para todos.</p>`,

alertas: `
<h3>Ferramentas sugeridas</h3>
<ul>
  <li><b>Uptime Kuma</b> — checa sites, APIs, portas, ping e certificados; painel e página de status. Leve, roda em Docker.</li>
  <li><b>Netdata</b> (simples) ou <b>Prometheus + Grafana + Alertmanager</b> (completo) — CPU, RAM, disco, rede.</li>
  <li><b>WhatsApp</b> — webhook para um gateway (API oficial do WhatsApp Business ou gateway próprio como Evolution API/WAHA) enviando aos grupos.</li>
</ul>
<div class="callout warn"><b>O monitor não pode ficar no mesmo servidor que ele vigia.</b> Se o servidor cair, o alerta cai junto. Use uma VPS pequena separada. Use um chip só para os alertas.</div>
<h3>O que monitorar</h3>
<table class="mini">
<tr><th>Checagem</th><th>Dispara quando</th><th>Nível</th></tr>
<tr><td>Site / API responde</td><td>2 falhas seguidas</td><td>🔴 Crítico</td></tr>
<tr><td>Live no ar (playlist HLS atualizando)</td><td>sem segmento novo há 30 s</td><td>🔴 Crítico</td></tr>
<tr><td>Servidor responde (ping)</td><td>3 falhas seguidas</td><td>🔴 Crítico</td></tr>
<tr><td>Backup do dia</td><td>não rodou em 24 h</td><td>🔴 Crítico</td></tr>
<tr><td>Disco</td><td>&gt; 85% (aviso) / &gt; 95% (crítico)</td><td>🟠 / 🔴</td></tr>
<tr><td>CPU ou RAM</td><td>&gt; 90% por 5 min</td><td>🟠 Aviso</td></tr>
<tr><td>Link de internet</td><td>passou para o link reserva</td><td>🟠 Aviso</td></tr>
<tr><td>Certificado SSL</td><td>vence em menos de 15 dias</td><td>🟠 Aviso</td></tr>
<tr><td>Domínio</td><td>vence em menos de 30 dias</td><td>🟠 Aviso</td></tr>
</table>
<h3>Canais no WhatsApp</h3>
<ul>
  <li>🚨 <b>Críticos</b> — plantão. Sem resposta em 10 min → ligação para o 2º responsável.</li>
  <li>⚠️ <b>Avisos</b> — resolver no horário comercial.</li>
  <li>📊 <b>Relatório diário</b> — 08:00, resumo do que aconteceu nas últimas 24 h.</li>
</ul>
<h3>Modelo de mensagem</h3>
<pre><code>🔴 CRÍTICO — API IAVE fora do ar
Servidor: principal (IP 000.000.000.000)
Desde: 14:32 · 2 checagens falharam
Ação automática: reinício do container ✔ tentado
Runbook: plano › Redundância › passo 3
---
✅ RESOLVIDO — API IAVE voltou às 14:36 (4 min fora)</code></pre>
<h3>Contingência automática</h3>
<pre><code># systemd: reinicia o serviço se cair
[Service]
Restart=always
RestartSec=5

# docker compose: reinicia containers
restart: unless-stopped</code></pre>`,
};
