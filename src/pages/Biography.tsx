import { motion } from 'motion/react';
import { Book, GraduationCap, ScrollText, Users, Award } from 'lucide-react';

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

      <div className="space-y-16">
        {/* Academic Background */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-purple/40 mb-6 flex items-center gap-3">
            <Book size={14} /> Academic Background
          </h2>
          <div className="space-y-4 text-sm text-brown-dark/60 leading-relaxed font-sans">
            <p>
              <span className="font-bold text-brown-dark">Duration of Study:</span> 9 years.
            </p>
            <p>
              <span className="font-bold text-brown-dark">Curriculum Covered:</span> Studied over 150 classical texts under various scholars.
            </p>
            <p>
              <span className="font-bold text-brown-dark">Books Read (450+):</span> Sharh Sunan Abi Dawud of Ibn Raslan, Sharh Sahih Muslim of An-Nawawi and Qadi Iyād and Muhammad Adam Al Ithyobi, Sharh Saheeh Al Bukhari of Ibn Battal, Ibn Hajar, Ibn Rajab, Al-Aziz (Fathul Aziz) of Ar-Rafi3i, and many others.
            </p>
          </div>
        </motion.section>

        {/* Teaching Experience */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-purple/40 mb-6 flex items-center gap-3">
            <GraduationCap size={14} /> Teaching Experience
          </h2>
          <div className="space-y-4 text-sm text-brown-dark/60 leading-relaxed font-sans">
            <p>Taught 50 scholarly texts.</p>
            <p>
              <span className="font-bold text-brown-dark">Currently Teaching:</span> Musnad al-Imam al-Shafi'i and Sharh al-Sunnah by al-Muzani.
            </p>
          </div>
        </motion.section>

        {/* Teachers */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-purple/40 mb-6 flex items-center gap-3">
            <Users size={14} /> Some of Who I Studied Under
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-beige/40 p-8 rounded-[2.5rem] border border-beige-dark">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-brown-dark/40 mb-4">United Arab Emirates</h3>
              <ul className="space-y-3">
                {[
                  'Shaykh Anees al-Mus\'abi',
                  'Shaykh Waleed al-Ibri',
                  'Shaykh Abdullah al-Kamali',
                  'Shaykh Aziz bin Farhan al-Anzi',
                  'Shaykh Muhammad Ghalib al-Omari',
                  'Shaykh Asim al-Qaryuti',
                  'Shaykh Muhammad al-Ghaith',
                ].map((name) => (
                  <li key={name} className="flex items-center gap-3 text-[11px] font-bold text-brown-dark">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple shrink-0"></div>
                    {name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-beige/40 p-8 rounded-[2.5rem] border border-beige-dark">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-brown-dark/40 mb-4">Sa'udiyyah</h3>
              <ul className="space-y-3">
                {[
                  'Shaykh Abd al-Razzaq al-Badr',
                  'Shaykh Hasan al-Bukhari',
                  'Shaykh Ali al-Tuwaijri',
                  'Shaykh Saad bin Nasser al-Shathri',
                  'Shaykh Sulaiman al-Ruhaili',
                  'Shaykh Sami al-Saqir',
                  'Shaykh Abd al-Muhsin al-Qasim',
                  'Shaykh Abdullah bin Saleh al-Ubaid',
                ].map((name) => (
                  <li key={name} className="flex items-center gap-3 text-[11px] font-bold text-brown-dark">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple shrink-0"></div>
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Formal Licenses (Ijazat) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-purple/40 mb-6 flex items-center gap-3">
            <ScrollText size={14} /> Formal Licenses (Ijazat)
          </h2>
          <div className="bg-beige/40 p-8 rounded-[2.5rem] border border-beige-dark">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Shaykh Abd al-Wakil al-Hashimi',
                'Shaykh Yahya al-Mudarris',
                'Shaykh Abd al-Muhsin al-Qasim',
                'Shaykh Abdullah bin Saleh al-Ubaid',
                'Shaykh Asim al-Qaryuti',
                'Shaykh Qasim al-Bahr',
                'Shaykh Sanaullah al-Madani',
                'Shaykh Mustafa al-Qudaimi',
                'Shaykh Ahmad bin Abd al-Razzaq al-Anqari',
                'Shaykh Abdullah bin Abd al-Rahman al-Mani\'',
                'Shaykha Safiya al-Ahnumi',
                'Shaykh Abdullah al-Mu\'taz',
                'Shaykh Ibrahim al-Ahdal',
                'Shaykh Ahmad Abd al-Qadir al-Ahdal',
                'Shaykha Nuzha al-Kattani',
                'Shaykh Yasin al-Muhammadi',
                'Shaykh Hisham al-Tahiri',
                'Shaykh Ziyad al-Takla',
                'Shaykh Daghsh al-Ajmi',
                'Shaykh Musa\'id bin Bashir al-Husayni',
                'Shaykh Muti\' al-Hafiz',
                'Shaykh Mustafa al-Baz',
                'Shaykh Noor al-Hassan Rashid al-Hindi',
                'Shaykh Khalid al-Dhafiri',
                'Shaykh Abdurrahman Kawthar',
                'Shaykh Abdullah bin Hamood At-Tuwayjiri',
                'Shaykh Muhammad Abdullah Ash-Shuja\' Abādi\'',
                'Amongst others',
              ].map((name) => (
                <li key={name} className="flex items-center gap-3 text-[11px] font-bold text-brown-dark">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple shrink-0"></div>
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </motion.section>
      </div>

      <div className="mt-16 p-12 bg-white rounded-[3rem] border border-beige-dark text-center">
        <p className="text-lg italic text-purple/60 leading-relaxed font-serif">
          حفظ الله أحياءهم ورحم أمواتهم
        </p>
      </div>
    </div>
  );
}
