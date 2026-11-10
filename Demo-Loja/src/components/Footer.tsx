import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  onInfoClick: (topic: string) => void;
}

export const Footer = ({ onInfoClick }: FooterProps) => {
  const linkClass = 'text-left transition hover:text-orange-400 hover:underline';
  const socialClass = 'rounded-full p-2 transition hover:bg-slate-800 hover:text-orange-400';

  return (
    <footer id="contato" className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">TechStore</h3>
            <p className="text-sm">Sua loja demonstrativa de tecnologia e gaming, com produtos para montar seu setup.</p>
            <div className="flex space-x-2">
              <button type="button" aria-label="Facebook" onClick={() => onInfoClick('Redes sociais')} className={socialClass}><Facebook size={20} /></button>
              <button type="button" aria-label="Instagram" onClick={() => onInfoClick('Redes sociais')} className={socialClass}><Instagram size={20} /></button>
              <button type="button" aria-label="Twitter" onClick={() => onInfoClick('Redes sociais')} className={socialClass}><Twitter size={20} /></button>
              <button type="button" aria-label="YouTube" onClick={() => onInfoClick('Redes sociais')} className={socialClass}><Youtube size={20} /></button>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Institucional</h4>
            <ul className="space-y-3 text-sm">
              {['Sobre Nós', 'Trabalhe Conosco', 'Política de Privacidade', 'Termos de Uso'].map((topic) => (
                <li key={topic}><button type="button" onClick={() => onInfoClick(topic)} className={linkClass}>{topic}</button></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Atendimento</h4>
            <ul className="space-y-3 text-sm">
              {['Central de Ajuda', 'Trocas e Devoluções', 'Rastreamento', 'FAQ'].map((topic) => (
                <li key={topic}><button type="button" onClick={() => onInfoClick(topic)} className={linkClass}>{topic}</button></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="tel:+5511999999999" className="flex items-center gap-2 hover:text-orange-400"><Phone size={16} /> (11) 99999-9999</a></li>
              <li><a href="mailto:contato@techstore.example" className="flex items-center gap-2 hover:text-orange-400"><Mail size={16} /> contato@techstore.example</a></li>
              <li className="flex items-start gap-2"><MapPin size={16} className="mt-1 shrink-0" /><span>São Paulo, SP<br />Brasil</span></li>
            </ul>
            <p className="mt-3 text-xs text-slate-500">Dados de contato ilustrativos desta demonstração.</p>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} TechStore. Projeto demonstrativo para fins educacionais.</p>
        </div>
      </div>
    </footer>
  );
};
