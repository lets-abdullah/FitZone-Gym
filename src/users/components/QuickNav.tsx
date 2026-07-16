import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

interface QuickNavProps {
  onNavigate: (path: string) => void;
}

export default function QuickNav({ onNavigate }: QuickNavProps) {
  const cards = [
    {
      id: 'nav-memberships',
      title: 'Membership Plans',
      image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&q=80&w=400',
      description: 'Explore our flexible tier structures. Find Monthly & Annual arrangements designed to meet strength, cardiorespiratory, and recovery adaptations.',
      path: 'memberships'
    },
    {
      id: 'nav-nutrition',
      title: 'Nutrition Hub',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=400',
      description: 'Dive deep into clinical nutrient guides focusing on amino pathways, energy balance formula sets, and performance mineral absorption.',
      path: 'nutrition'
    },
    {
      id: 'nav-store',
      title: 'Supplement Store',
      image: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&q=80&w=400',
      description: 'Inspect our premium science-backed supplements catalog including double-filtered isolate, beta-alanine pre workouts, and creatine.',
      path: 'store'
    }
  ];

  return (
    <section className="py-20 bg-white border-t border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center md:text-left mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-gold-700 uppercase tracking-widest block mb-2 font-bold">
              Website Directory
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-black text-zinc-900 tracking-tight uppercase">
              Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-gold-600">Knowledge Columns</span>
            </h2>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-zinc-500 md:text-right font-light leading-relaxed">
            Navigate between our comprehensive informational resources and calculators to support your athletic progress.
          </p>
        </div>

        {/* Categories Grid - Responsive bento style / flex grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              id={card.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-zinc-50/50 border border-zinc-200/80 rounded-2xl overflow-hidden hover:border-gold-500/50 hover:bg-white transition-all duration-300 group flex flex-col h-full shadow-sm hover:shadow-md"
            >
              {/* Image Preview Container */}
              <div className="relative h-48 overflow-hidden bg-zinc-100">
                <img
                  src={card.image}
                  alt={`${card.title} preview`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-103 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                <span className="absolute bottom-4 left-4 font-display font-black text-base text-white uppercase tracking-tight">
                  {card.title}
                </span>
              </div>

              {/* Description Body */}
              <div className="p-5 flex-grow flex flex-col justify-between space-y-5">
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-light">
                  {card.description}
                </p>

                {/* Button Action */}
                <button
                  id={`${card.id}-btn`}
                  onClick={() => onNavigate(card.path)}
                  className="w-full bg-zinc-100 group-hover:bg-zinc-900 text-zinc-700 group-hover:text-white text-xs font-bold tracking-wider uppercase py-3.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-zinc-200 group-hover:border-transparent cursor-pointer shadow-sm group-hover:shadow"
                >
                  <span>View More</span> 
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
