import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { ArrowRight, BarChart3, Building2, Check, CheckCircle2, ChevronRight, Clock3, FileCheck2, Layers3, LifeBuoy, LockKeyhole, Menu, MessageCircle, PlugZap, ScanLine, ShieldCheck, Sparkles, X } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "reembolsa aí — Reembolso corporativo Enterprise" },
    { name: "description", content: "Reembolso corporativo para grandes operações. Comprovantes pelo WhatsApp, controle financeiro e compliance. Conheça a proposta Enterprise sob consulta." },
    { property: "og:title", content: "reembolsa aí — Reembolso corporativo em escala" },
    { property: "og:description", content: "Controle, compliance e eficiência financeira para operações com centenas de colaboradores em campo. Fale com vendas." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "reembolsa aí — Reembolso corporativo Enterprise" },
    { name: "twitter:description", content: "Controle e compliance para grandes operações. Plano Enterprise sob consulta." },
  ] }),
  component: LandingPage,
});

const navigation = [
  { href: "#plataforma", label: "Plataforma" },
  { href: "#integracoes", label: "Integrações" },
  { href: "#resultados", label: "Resultados" },
  { href: "#enterprise", label: "Enterprise" },
];

function SalesLink({ demo = false, outline = false, dark = false }: { demo?: boolean; outline?: boolean; dark?: boolean }) {
  return <Button asChild size="lg" variant={outline ? "outline" : "default"} className={outline && dark ? "border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground" : ""}>
    <a href={demo ? "#demonstracao" : "#vendas"}>{demo ? "Agendar demonstração" : "Falar com vendas"}{demo ? <ChevronRight className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}</a>
  </Button>;
}

function LandingPage() {
  return <div className="enterprise-home min-h-screen bg-background">
    <LandingNav />
    <Hero />
    <div className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-5 py-6 text-xs font-medium text-muted-foreground sm:px-6">
        <span className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-brand" /> WhatsApp na origem</span>
        <span className="flex items-center gap-2"><FileCheck2 className="h-4 w-4 text-brand" /> Política no centro da decisão</span>
        <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand" /> Rastreabilidade para auditoria</span>
        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand" /> Aprovação humana</span>
      </div>
    </div>
    <Platform />
    <Integrations />
    <Results />
    <EnterprisePlan />
    <SalesContact />
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-5 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-center gap-3"><Logo className="h-7" /><span className="border-l border-border pl-3 font-semibold text-foreground">reembolsa aí</span></div>
        <p>© {new Date().getFullYear()} · Reembolso corporativo com decisão humana.</p>
        <Link to="/login" className="hover:text-foreground">Acesso de clientes <span aria-hidden="true">↗</span></Link>
      </div>
    </footer>
  </div>;
}

function LandingNav() {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
    <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-3 px-5 sm:px-6">
      <Link to="/" aria-label="reembolsa aí — Início"><Logo className="h-7 sm:h-8" /></Link>
      <nav aria-label="Navegação principal" className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
        {navigation.map(item => <a key={item.href} href={item.href} className="hover:text-brand">{item.label}</a>)}
      </nav>
      <div className="flex items-center gap-1 sm:gap-3">
        <Button asChild variant="ghost" size="sm"><Link to="/login">Entrar</Link></Button>
        <Button asChild size="sm" className="hidden sm:inline-flex"><a href="#vendas">Falar com vendas <ArrowRight className="h-3.5 w-3.5" /></a></Button>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
      </div>
    </div>
    {open && <nav id="mobile-navigation" aria-label="Navegação móvel" className="space-y-1 border-t border-border px-5 py-3 lg:hidden">
      {navigation.map(item => <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="block py-2 text-sm font-medium">{item.label}</a>)}
      <a href="#vendas" onClick={() => setOpen(false)} className="block py-2 text-sm font-semibold text-brand">Falar com vendas</a>
    </nav>}
  </header>;
}

function Hero() {
  return <section className="bg-sidebar text-sidebar-foreground">
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12 lg:py-18">
      <div className="motion-safe:animate-fade-rise">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sidebar-primary"><span className="h-px w-6 bg-sidebar-primary" /> reembolsa aí · Enterprise</p>
        <h1 className="mt-5 text-4xl font-semibold leading-[1.13] sm:text-5xl">Reembolso corporativo.<br /><span className="text-sidebar-primary">Controle em escala.</span></h1>
        <p className="mt-6 max-w-xl text-xl font-medium leading-snug">A infraestrutura de reembolso para operações com centenas de colaboradores em campo.</p>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-sidebar-foreground/75">Do comprovante à aprovação, conecte controle, compliance e eficiência financeira. Menos trabalho operacional para o financeiro. Mais governança para a empresa.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row"><SalesLink /><SalesLink demo outline dark /></div>
        <p className="mt-6 text-xs text-sidebar-foreground/65">Proposta sob consulta · Implantação dimensionada para sua operação</p>
      </div>
      <HeroMock />
    </div>
  </section>;
}

function HeroMock() {
  return <div className="mx-auto w-full max-w-md motion-safe:animate-fade-rise">
    <div className="mb-3 flex items-center justify-between text-xs text-sidebar-foreground/65"><span>DO CAMPO AO FINANCEIRO</span><span>Exemplo ilustrativo</span></div>
    <div className="overflow-hidden rounded-lg border border-sidebar-border bg-card text-card-foreground shadow-elevated">
      <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold"><ScanLine className="h-5 w-5 text-brand" /> Comprovante recebido</div>
        <span className="flex items-center gap-1 text-xs text-brand"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</span>
      </div>
      <dl className="space-y-4 px-5 py-5 text-sm">
        <MockRow label="Estabelecimento" value="Restaurante Bom Prato" />
        <MockRow label="Categoria" value="Alimentação / Refeição" />
        <MockRow label="Valor do comprovante" value="R$ 87,50" strong />
      </dl>
      <div className="mx-5 border-l-2 border-success bg-success/10 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-success"><Sparkles className="h-4 w-4" /> Recomendação da IA: aprovar</p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Valor dentro da política de alimentação do exemplo. A decisão final permanece com o aprovador.</p>
      </div>
      <div className="mx-5 mt-4 flex items-center justify-between gap-3 border-y border-border py-3 text-xs"><span className="text-muted-foreground">Chave Pix para pagamento</span><span className="break-all font-medium">colaborador@empresa.com.br</span></div>
      <div className="flex items-center gap-2 px-5 py-4 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-brand" /> Comprovante, análise e decisão rastreáveis</div>
    </div>
    <div className="mt-3 flex items-center justify-end gap-2 text-xs text-sidebar-foreground/70"><CheckCircle2 className="h-4 w-4 text-sidebar-primary" /> Evidência na origem. Controle na aprovação.</div>
  </div>;
}
function MockRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className="grid grid-cols-[1fr_1fr] items-start gap-3"><dt className="text-muted-foreground">{label}</dt><dd className={`text-right ${strong ? "text-xl font-semibold text-brand" : "font-medium"}`}>{value}</dd></div>;
}

function Platform() {
  const areas = [
    { icon: ShieldCheck, title: "Segurança & compliance", text: "Evidências e decisões no mesmo fluxo, com visibilidade para quem aprova e para quem audita.", points: ["LGPD e acesso aos dados por empresa", "Trilha de auditoria de análises e decisões", "Verificação de NF-e e indícios de fraude", "Controle de duplicidade no recebimento"] },
    { icon: Layers3, title: "Escala & governança", text: "Uma operação mais organizada, sem depender de planilhas dispersas ou de conversas para cada aprovação.", points: ["Política de reembolso versionada", "Perfis de administrador, aprovador e colaborador", "Visão geral e relatórios financeiros", "Comprovantes vinculados à empresa"] },
  ];
  return <section id="plataforma" className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-20">
    <p className="text-xs font-semibold uppercase tracking-wider text-brand">Plataforma corporativa</p>
    <div className="mt-3 grid gap-5 lg:grid-cols-2 lg:gap-16"><h2 className="text-3xl font-semibold leading-tight sm:text-4xl">A simplicidade do WhatsApp.<br />O controle que a operação exige.</h2><p className="text-base leading-relaxed text-muted-foreground">A equipe envia o comprovante onde já trabalha. O financeiro recebe informações organizadas, análise da política e evidências para decidir com segurança.</p></div>
    <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-16">
      {areas.map(area => <div key={area.title} className="border-t border-border pt-6"><area.icon className="h-7 w-7 text-brand" /><h3 className="mt-4 text-xl font-semibold">{area.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{area.text}</p><ul className="mt-5 space-y-3">{area.points.map(point => <li key={point} className="flex items-start gap-2.5 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{point}</li>)}</ul></div>)}
    </div>
    <div className="mt-10 border-t border-border pt-6 text-sm leading-relaxed text-muted-foreground"><span className="font-semibold text-foreground">Governança avançada sob consulta.</span> SSO/SAML, multi-CNPJ, múltiplas equipes, políticas e alçadas por cargo, equipe ou unidade de negócio são requisitos a dimensionar na proposta Enterprise.</div>
  </section>;
}

function Integrations() {
  return <section id="integracoes" className="border-y border-border bg-secondary/50">
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:py-20">
      <div><p className="text-xs font-semibold uppercase tracking-wider text-brand">Integrações</p><h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">Reembolso conectado à sua operação financeira.</h2><p className="mt-5 text-base leading-relaxed text-muted-foreground">Da entrada do documento ao fechamento: um fluxo de informação que reduz retrabalho e mantém a origem de cada despesa.</p><div className="mt-7"><SalesLink outline /></div></div>
      <div className="divide-y divide-border">
        <IntegrationRow icon={MessageCircle} title="WhatsApp e documentos" description="Recebimento de comprovantes e leitura por IA, com evidências vinculadas à despesa." />
        <IntegrationRow icon={PlugZap} title="ERP, API e exportação contábil" description="Integrações e formatos de exportação definidos sob consulta, de acordo com os sistemas e requisitos da sua empresa." />
        <IntegrationRow icon={Building2} title="Pix pela conta da empresa" description="A chave Pix acompanha o reembolso. Execução de pagamentos e conexão à conta corporativa dependem de escopo e viabilidade, sob consulta." />
      </div>
    </div>
  </section>;
}
function IntegrationRow({ icon: Icon, title, description }: { icon: typeof MessageCircle; title: string; description: string }) {
  return <div className="flex items-start gap-4 py-6 first:pt-0 last:pb-0"><Icon className="mt-1 h-5 w-5 shrink-0 text-brand" /><div><h3 className="text-base font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p></div></div>;
}

function Results() {
  return <section id="resultados" className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-20">
    <p className="text-xs font-semibold uppercase tracking-wider text-brand">Eficiência mensurável</p>
    <h2 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">Resultados que o financeiro consegue acompanhar.</h2>
    <div className="mt-10 grid gap-8 border-y border-border py-8 sm:grid-cols-3">
      <div><p className="text-4xl font-semibold text-brand">&lt; 24h</p><h3 className="mt-3 text-sm font-semibold">Tempo de aprovação</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Meta já definida para o piloto, a validar com o volume e as alçadas da operação.</p></div>
      <div><ShieldCheck className="h-10 w-10 text-brand" /><h3 className="mt-3 text-sm font-semibold">Fraude e duplicidade</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Acompanhe alertas e ocorrências para medir a evolução dos controles.</p></div>
      <div><Clock3 className="h-10 w-10 text-brand" /><h3 className="mt-3 text-sm font-semibold">Horas do financeiro</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Compare o esforço de conferência antes e depois da implantação.</p></div>
    </div>
    <p className="mt-4 text-xs text-muted-foreground">Indicadores e metas são definidos com cada empresa. Não representam resultados garantidos.</p>
  </section>;
}

function EnterprisePlan() {
  return <section id="enterprise" className="bg-sidebar text-sidebar-foreground">
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:py-20">
      <div><p className="text-xs font-semibold uppercase tracking-wider text-sidebar-primary">Plano Enterprise</p><h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Uma proposta para a dimensão da sua empresa.</h2><p className="mt-5 text-base leading-relaxed text-sidebar-foreground/75">Condições por volume de usuários ativos, onboarding dedicado e contrato corporativo. Escopo, integrações e níveis de serviço acordados com a sua operação.</p><p className="mt-6 text-2xl font-semibold text-sidebar-primary">Sob consulta</p><div className="mt-7"><SalesLink /></div></div>
      <div className="divide-y divide-sidebar-border">
        <div className="pb-6"><LifeBuoy className="h-6 w-6 text-sidebar-primary" /><h3 className="mt-3 text-lg font-semibold">Suporte & SLA</h3><p className="mt-3 text-sm leading-relaxed text-sidebar-foreground/75">Implantação assistida, CSM dedicado e SLA de atendimento previstos na negociação do contrato Enterprise.</p></div>
        <div className="py-6"><LockKeyhole className="h-6 w-6 text-sidebar-primary" /><h3 className="mt-3 text-lg font-semibold">Segurança no escopo certo</h3><p className="mt-3 text-sm leading-relaxed text-sidebar-foreground/75">Avaliação de requisitos de identidade corporativa, governança e compliance com as áreas de TI e financeiro.</p></div>
        <div className="pt-6"><BarChart3 className="h-6 w-6 text-sidebar-primary" /><h3 className="mt-3 text-lg font-semibold">Gestão executiva</h3><p className="mt-3 text-sm leading-relaxed text-sidebar-foreground/75">Indicadores e necessidades por unidade de negócio dimensionados na implantação.</p></div>
      </div>
    </div>
  </section>;
}

type SalesChatWindow = Window & { $chatwoot?: { toggle: (state: string) => void; setCustomAttributes?: (attributes: Record<string, string>) => void } };
function SalesContact() {
  const [unavailable, setUnavailable] = useState(false);
  function openSales(demo: boolean) {
    const chat = (window as SalesChatWindow).$chatwoot;
    if (!chat) { setUnavailable(true); return; }
    setUnavailable(false);
    chat.setCustomAttributes?.({ interesse: demo ? "Demonstração Enterprise" : "Vendas Enterprise" });
    chat.toggle("open");
  }
  return <section id="vendas" className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-20">
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-16">
      <div><p className="text-xs font-semibold uppercase tracking-wider text-brand">Próximo passo</p><h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Fale com vendas.</h2><p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">Vamos entender sua estrutura, o número de colaboradores em campo e os requisitos do financeiro para construir uma proposta Enterprise.</p></div>
      <div id="demonstracao" className="space-y-4"><Button size="lg" className="w-full" onClick={() => openSales(false)}>Falar com vendas <ArrowRight className="h-4 w-4" /></Button><Button size="lg" variant="outline" className="w-full" onClick={() => openSales(true)}>Agendar demonstração <MessageCircle className="h-4 w-4" /></Button><p className="text-xs leading-relaxed text-muted-foreground">Converse com nossa equipe para conhecer o fluxo de reembolso e alinhar o escopo da sua operação.</p>{unavailable && <p role="status" className="text-sm text-destructive">O canal de atendimento está indisponível no momento. Não foi possível iniciar a conversa ou solicitar o agendamento.</p>}</div>
    </div>
  </section>;
}
