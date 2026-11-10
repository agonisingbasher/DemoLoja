import { ArrowLeft, ArrowRight, BadgeCheck, Briefcase, HelpCircle, Headphones, MessageCircle, PackageCheck, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';

type Props = { topic: string; onBack: () => void; onNavigate: (topic: string) => void };
type Section = { title: string; body: string; bullets?: string[] };

const contentByTopic: Record<string, { eyebrow: string; title: string; intro: string; icon: typeof ShoppingBag; sections: Section[]; note?: string }> = {
  'Sobre Nós': {
    eyebrow: 'Conheça a TechStore', title: 'Tecnologia para acompanhar suas ideias.',
    intro: 'A TechStore nasceu como uma experiência demonstrativa de comércio eletrônico, pensada para mostrar como uma loja digital pode unir descoberta de produtos, navegação simples e uma operação organizada.',
    icon: ShoppingBag,
    sections: [
      { title: 'Nossa proposta', body: 'Criar uma experiência de compra clara, agradável e intuitiva, com foco em tecnologia, games e acessórios para diferentes estilos de setup.' },
      { title: 'O que você encontra por aqui', body: 'Um catálogo navegável com páginas de detalhes, filtros por categoria, busca, favoritos, carrinho e finalização de pedidos simulada.', bullets: ['Produtos e especificações ilustrativas', 'Detalhes, preços e disponibilidade demonstrativos', 'Uma área administrativa para acompanhar pedidos e estoque'] },
      { title: 'Um projeto em evolução', body: 'Esta versão funciona no navegador e utiliza dados locais. A estrutura foi criada para demonstrar os principais fluxos de uma loja, sem processar pagamentos ou entregas reais.' },
    ],
  },
  'Trabalhe Conosco': {
    eyebrow: 'Carreiras', title: 'Boas ideias começam com pessoas.',
    intro: 'Gostamos de pessoas curiosas, colaborativas e que queiram construir experiências digitais melhores. Esta página representa a área de carreiras da loja demonstrativa.',
    icon: Briefcase,
    sections: [
      { title: 'Como é trabalhar na TechStore', body: 'Valorizamos comunicação transparente, aprendizado contínuo, responsabilidade e atenção à experiência de quem utiliza nossos produtos.' },
      { title: 'Áreas que fazem parte da operação', body: 'Em uma operação real, diferentes especialidades colaborariam para manter a loja funcionando.', bullets: ['Tecnologia e desenvolvimento', 'Experiência do cliente e atendimento', 'Operações, catálogo e logística', 'Marketing e conteúdo'] },
      { title: 'Oportunidades', body: 'Não há vagas abertas nem recebimento de currículos nesta demonstração. Os canais de candidatura serão publicados quando houver um processo seletivo real.' },
    ],
    note: 'Não envie documentos pessoais ou informações sensíveis por esta página demonstrativa.',
  },
  'Política de Privacidade': {
    eyebrow: 'Privacidade e dados', title: 'Seus dados merecem transparência.',
    intro: 'Esta página explica, de forma objetiva, como a versão demonstrativa da TechStore trata as informações inseridas durante a navegação.',
    icon: ShieldCheck,
    sections: [
      { title: 'Dados armazenados neste navegador', body: 'Carrinho, favoritos, catálogo personalizado e pedidos demonstrativos podem ser gravados no localStorage do navegador utilizado. Esses dados permanecem no dispositivo e podem ser apagados ao limpar os dados do site.' },
      { title: 'Dados do checkout', body: 'Nome e e-mail informados no formulário são utilizados apenas para montar um pedido fictício e exibi-lo no painel administrativo local. Não há envio para um servidor nesta versão.' },
      { title: 'Cookies e rastreamento', body: 'A demonstração não implementa ferramentas próprias de publicidade, perfilamento ou rastreamento de comportamento.' },
      { title: 'Seus controles', body: 'Você pode remover os dados locais limpando os dados de navegação do site no próprio navegador. Em uma loja real, a política deverá identificar o controlador, os operadores, bases legais, prazos de retenção e canal para solicitações dos titulares.' },
    ],
    note: 'Este texto é informativo para um projeto educacional e não substitui uma política jurídica revisada para uma operação comercial real.',
  },
  'Termos de Uso': {
    eyebrow: 'Condições de utilização', title: 'Uma experiência de demonstração, sem surpresas.',
    intro: 'Ao navegar pela TechStore demonstrativa, você pode explorar os recursos da interface e testar os fluxos simulados. Nenhuma compra real é concluída.',
    icon: BadgeCheck,
    sections: [
      { title: 'Natureza da demonstração', body: 'A loja é um projeto educacional. Produtos, marcas, imagens, preços, avaliações, descontos, estoque, prazos e condições são ilustrativos e não constituem oferta comercial.' },
      { title: 'Pedidos e pagamentos', body: 'A finalização cria um registro local de pedido para demonstração. Não há cobrança, processamento de pagamento, separação de mercadoria ou envio.' },
      { title: 'Uso adequado', body: 'Utilize os recursos de forma responsável. Não tente interferir no funcionamento, acessar dados de terceiros ou utilizar a demonstração para inserir informações sensíveis.' },
      { title: 'Atualizações', body: 'Funcionalidades e conteúdo podem ser alterados durante a evolução do projeto, sem aviso prévio.' },
    ],
    note: 'Em uma operação comercial, estes termos precisam ser substituídos por condições reais, revisadas juridicamente e adequadas à legislação aplicável.',
  },
  'Central de Ajuda': {
    eyebrow: 'Atendimento', title: 'Como podemos ajudar?',
    intro: 'Reunimos orientações rápidas para você aproveitar os recursos disponíveis na demonstração da TechStore.',
    icon: Headphones,
    sections: [
      { title: 'Encontrar produtos', body: 'Use a busca no topo da loja ou filtre o catálogo por categoria. Selecione um produto para consultar descrição, características, preço e estoque demonstrativo.' },
      { title: 'Carrinho e favoritos', body: 'Adicione produtos ao carrinho, ajuste quantidades respeitando o estoque exibido e salve itens nos favoritos. As escolhas ficam neste navegador.' },
      { title: 'Finalizar um pedido', body: 'Preencha os dados de demonstração no checkout. O sistema gera um código fictício e registra o pedido no painel administrativo local.' },
      { title: 'Acesso administrativo', body: 'O painel de demonstração pode ser acessado pelo botão Entrar, utilizando as credenciais apresentadas na própria tela de login.' },
    ],
    note: 'Como não existe operação logística ou financeira real, não há atendimento transacional nesta versão.',
  },
  'Trocas e Devoluções': {
    eyebrow: 'Pós-venda', title: 'Orientações sobre trocas e devoluções.',
    intro: 'Na TechStore demonstrativa, os pedidos são simulados e não geram compra, cobrança ou entrega de produtos.',
    icon: PackageCheck,
    sections: [
      { title: 'Compras demonstrativas', body: 'Não existe mercadoria adquirida por meio deste site. Por isso, não há processo real de troca, devolução, reembolso ou logística reversa.' },
      { title: 'Testes do sistema', body: 'Você pode realizar pedidos fictícios para observar a atualização do estoque e o histórico no painel administrativo.' },
      { title: 'Quando a loja for real', body: 'Uma operação comercial deverá publicar prazos, condições, canais de solicitação, procedimento de devolução e informações sobre o direito de arrependimento, conforme a legislação aplicável.' },
    ],
    note: 'Não envie produtos ou dados de pagamento em razão de pedidos criados nesta demonstração.',
  },
  'Rastreamento': {
    eyebrow: 'Entrega', title: 'Acompanhe o status do seu pedido.',
    intro: 'O acompanhamento logístico está representado visualmente nesta demonstração, mas ainda não existe integração com transportadoras.',
    icon: Truck,
    sections: [
      { title: 'Pedidos de demonstração', body: 'Os pedidos concluídos aparecem no histórico do painel administrativo deste navegador, com código iniciado por TS-.' },
      { title: 'Código de rastreio', body: 'Os códigos gerados são identificadores internos fictícios. Eles não podem ser consultados nos sites dos Correios ou de transportadoras.' },
      { title: 'Integração futura', body: 'Uma versão de produção poderá conectar o pedido a uma transportadora e apresentar eventos reais de coleta, transferência e entrega.' },
    ],
    note: 'Nenhum pacote será enviado a partir desta loja demonstrativa.',
  },
  'FAQ': {
    eyebrow: 'Dúvidas frequentes', title: 'Respostas rápidas para continuar.',
    intro: 'Confira as perguntas mais comuns sobre o funcionamento da loja demonstrativa.',
    icon: HelpCircle,
    sections: [
      { title: 'A loja vende produtos de verdade?', body: 'Não. Esta é uma demonstração educacional; os produtos e valores são ilustrativos.' },
      { title: 'O checkout cobra meu cartão?', body: 'Não. Não existe integração de pagamento nem cobrança real.' },
      { title: 'Meus dados ficam salvos?', body: 'Alguns dados do fluxo ficam no armazenamento local do navegador utilizado. Eles não são sincronizados entre dispositivos.' },
      { title: 'Como acesso o painel?', body: 'Clique em Entrar no cabeçalho e utilize admin como usuário e senha, conforme indicado na tela de acesso.' },
      { title: 'Por que o estoque muda?', body: 'A finalização de um pedido fictício reduz o estoque local para demonstrar a rotina de vendas.' },
    ],
  },
  'Redes sociais': {
    eyebrow: 'Comunidade', title: 'Acompanhe a TechStore.',
    intro: 'Este espaço foi preparado para reunir os canais oficiais, novidades, conteúdos e comunicados da marca.',
    icon: MessageCircle,
    sections: [
      { title: 'Canais oficiais', body: 'Os perfis sociais ainda não foram configurados nesta demonstração. Os ícones do rodapé são elementos ilustrativos e não direcionam para perfis externos.' },
      { title: 'O que poderá encontrar', body: 'Em uma operação real, este espaço poderá destacar lançamentos, dicas de setup, novidades do catálogo e conteúdos da comunidade.' },
    ],
    note: 'Nenhum perfil social oficial está associado a esta versão demonstrativa.',
  },
};

const quickLinks = ['Sobre Nós', 'Trabalhe Conosco', 'Política de Privacidade', 'Termos de Uso', 'Central de Ajuda', 'Trocas e Devoluções', 'Rastreamento', 'FAQ'];

export function FooterInfoPage({ topic, onBack, onNavigate }: Props) {
  const page = contentByTopic[topic] ?? contentByTopic['Central de Ajuda'];
  const Icon = page.icon;
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-orange-600"><ArrowLeft size={17}/> Voltar à loja</button>
          <div className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-950"><span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500 text-white"><ShoppingBag size={19}/></span>Tech<span className="text-orange-500">Store</span></div>
          <a href="#info-content" className="hidden items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-600 sm:inline-flex">Ir para conteúdo <ArrowRight size={16}/></a>
        </div>
      </header>

      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_20%,rgba(249,115,22,0.28),transparent_45%),linear-gradient(120deg,#020617,#172033)]"/>
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:py-20 lg:grid-cols-[1fr_260px] lg:items-center lg:px-8">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-orange-300"><Icon size={14}/> {page.eyebrow}</div>
            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">{page.title}</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">{page.intro}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-400"><span>TechStore</span><span className="text-slate-600">/</span><span>{topic}</span><span className="ml-1 rounded-full bg-white/10 px-3 py-1 text-slate-300">Informações da loja</span></div>
          </div>
          <div className="hidden justify-center lg:flex"><div className="grid h-52 w-52 place-items-center rounded-[2.5rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-orange-950/30"><div className="grid h-32 w-32 place-items-center rounded-[2rem] bg-gradient-to-br from-orange-400 to-orange-600 shadow-xl shadow-orange-950/40"><Icon size={58} strokeWidth={1.5}/></div></div></div>
        </div>
      </section>

      <main id="info-content" className="mx-auto grid max-w-7xl gap-12 px-5 py-12 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-8 lg:py-16">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-5 lg:sticky lg:top-28">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-slate-400">Navegação</p>
          <nav className="space-y-1">
            {quickLinks.map((link) => <button key={link} type="button" onClick={() => onNavigate(link)} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${topic === link ? 'bg-orange-50 text-orange-700' : 'text-slate-600 hover:bg-white hover:text-slate-950'}`}>{link}{topic === link && <span className="h-1.5 w-1.5 rounded-full bg-orange-500"/>}</button>)}
          </nav>
          <div className="mt-6 rounded-xl bg-slate-900 p-4 text-white"><div className="mb-2 flex items-center gap-2 text-sm font-bold"><Headphones size={16} className="text-orange-400"/> Precisa de ajuda?</div><p className="text-xs leading-5 text-slate-400">Consulte a central de ajuda para entender os recursos desta demonstração.</p></div>
        </aside>

        <div className="min-w-0">
          <div className="mb-8 flex items-center gap-3 border-b border-slate-200 pb-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-50 text-orange-600"><Icon size={22}/></span><div><p className="text-xs font-bold uppercase tracking-widest text-orange-600">TechStore informa</p><h2 className="text-xl font-black text-slate-900">{topic}</h2></div></div>
          <div className="space-y-5">
            {page.sections.map((section, index) => <section key={section.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-orange-200 sm:p-8"><div className="flex gap-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-sm font-black text-slate-500">{String(index + 1).padStart(2, '0')}</span><div className="min-w-0"><h3 className="text-lg font-extrabold text-slate-900">{section.title}</h3><p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{section.body}</p>{section.bullets && <ul className="mt-4 grid gap-2 sm:grid-cols-2">{section.bullets.map((item) => <li key={item} className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500"/>{item}</li>)}</ul>}</div></div></section>)}
          </div>
          {topic === 'FAQ' && <div className="mt-8 rounded-2xl border border-orange-100 bg-orange-50/70 p-6"><h3 className="font-extrabold text-slate-900">Ainda tem dúvidas?</h3><p className="mt-2 text-sm leading-6 text-slate-600">Lembre-se: todos os fluxos desta versão são demonstrativos e não envolvem transações reais.</p></div>}
          {page.note && <div className="mt-8 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900"><ShieldCheck className="mt-0.5 shrink-0" size={19}/><p>{page.note}</p></div>}
          <div className="mt-10 flex flex-col justify-between gap-5 rounded-2xl bg-slate-950 p-6 text-white sm:flex-row sm:items-center sm:p-8"><div><p className="text-xs font-bold uppercase tracking-widest text-orange-400">Continue explorando</p><h3 className="mt-2 text-xl font-black">Volte para a experiência TechStore.</h3><p className="mt-2 text-sm text-slate-400">Veja o catálogo e conheça os recursos da loja.</p></div><button type="button" onClick={onBack} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600">Voltar ao catálogo <ArrowRight size={17}/></button></div>
        </div>
      </main>
      <footer className="border-t border-slate-200 bg-slate-50"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>© {new Date().getFullYear()} TechStore · Projeto demonstrativo.</span><span>Conteúdo ilustrativo, sem operação comercial real.</span></div></footer>
    </div>
  );
}
