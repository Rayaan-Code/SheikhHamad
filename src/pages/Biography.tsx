import { motion } from 'motion/react';
import { Book, PenTool, Hash, Quote } from 'lucide-react';

export default function Biography() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <div className="inline-block px-4 py-1.5 bg-purple/10 text-purple text-[10px] uppercase font-black tracking-[0.3em] rounded-full mb-6">
          Authorized Biography
        </div>
        <h1 className="text-4xl md:text-6xl font-serif text-brown-dark italic px-4">
          Shaykh Hamad bin Aasif Ash-Shafi'i al-Athari
        </h1>
        <div className="w-24 h-px bg-beige-dark mx-auto mt-12"></div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
        <div className="md:col-span-2 space-y-12">
          <section>
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-purple/40 mb-6 flex items-center gap-3">
              <Book size={14} /> Traditional Upbringing
            </h2>
            <p className="font-serif text-lg leading-relaxed text-brown-dark/80">
              Shaykh Hamad bin Aasif, a student of knowledge and a caller to the path of the Salaf as-Salih, has dedicated his efforts to the propagation of the traditional Athari creed following the Shafi'i madhhab in jurisprudence.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-purple/40 mb-6 flex items-center gap-3">
              <PenTool size={14} /> Methodological Approach
            </h2>
            <div className="space-y-6 text-sm text-brown-dark/60 leading-relaxed font-sans">
              <p>
                The Shaykh's lessons are characterized by a profound adherence to primary sources—the Quran and the authentic Sunnah as understood by the righteous predecessors. His teaching style bridges classical scholarship with contemporary clarity, making complex theological concepts accessible to students across the digital archive.
              </p>
              <p>
                Specializing in the works of Imam Ash-Shafi'i and the early masters of the Athari tradition, the Shaykh emphasizes the importance of purifying the soul through authentic knowledge and consistent practice.
              </p>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="bg-beige/40 p-8 rounded-[2.5rem] border border-beige-dark">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-brown-dark/40 mb-4">Core Focus</h3>
            <ul className="space-y-4">
              {['Athari Creed', 'Shafi\'i Fiqh', 'Hadith Sciences', 'Tazkiyah'].map(item => (
                <li key={item} className="flex items-center gap-3 text-[11px] font-bold text-brown-dark">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple"></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-purple/5 p-8 rounded-[2.5rem] border border-purple/10">
             <Quote size={24} className="text-purple/20 mb-4" />
             <p className="text-xs italic text-purple/60 leading-relaxed font-serif">
               "Knowledge is not merely the memorization of lines, but it is a light that resides in the heart, necessitating action and sincerity."
             </p>
          </div>
        </div>
      </div>

      <div className="p-12 bg-white rounded-[3rem] border border-beige-dark text-center">
         <h3 className="text-2xl font-serif text-brown-dark mb-4">Educational Mission</h3>
         <p className="text-sm text-brown-dark/40 max-w-xl mx-auto leading-relaxed">
           This digital archive serves as a central repository for the Shaykh's recorded lessons, treatises, and beneficial insights, ensuring that students worldwide can access authentic knowledge for generations to come.
         </p>
      </div>
    </div>
  );
}
