export const Hero = () => {
  return (
    <section id="topo" className="bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 text-white">
      <div className="container mx-auto grid items-center gap-8 px-4 py-16 md:grid-cols-2">
        <div className="space-y-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-300">TechStore • universo gamer</p>
          <h2 className="text-5xl font-bold leading-tight">
            As melhores ofertas em <span className="text-orange-400">Gaming</span>
          </h2>
          <p className="text-xl text-gray-300">
            Consoles, periféricos e acessórios para transformar seu setup.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#catalogo" className="rounded-lg bg-orange-600 px-8 py-3 font-semibold text-white transition hover:scale-105 hover:bg-orange-700">
              Ver produtos
            </a>
            <a href="#catalogo" className="rounded-lg bg-white px-8 py-3 font-semibold text-orange-600 transition hover:scale-105 hover:bg-gray-100">
              Explorar catálogo
            </a>
          </div>
        </div>
        <div className="relative">
          <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-br from-orange-500/20 to-transparent p-8 backdrop-blur-sm">
            <img
              src="https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Setup gamer com computador e iluminação"
              className="w-full rounded-2xl object-cover shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
