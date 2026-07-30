"use client";

import { motion } from "framer-motion";
import { Cake, Heart, Music, Gift, PartyPopper } from "lucide-react";
import { useRef, useEffect, useState } from "react";

const useCases = [
  {
    id: 1,
    title: "Anniversaires",
    description: "Offrez une chanson unique et personnalisée pour marquer le coup et surprendre vos proches de manière inoubliable.",
    icon: Cake,
    color: "from-pink-500 to-rose-500",
    shadow: "shadow-pink-500/20"
  },
  {
    id: 2,
    title: "Mariages & Baptêmes",
    description: "Immortalisez vos moments les plus sacrés avec une mélodie sur-mesure, chargée de vos propres émotions.",
    icon: Heart,
    color: "from-purple-500 to-indigo-500",
    shadow: "shadow-purple-500/20"
  },
  {
    id: 3,
    title: "Instrumentals",
    description: "Générez des beats puissants pour vous amuser, freestyler, ou animer vos soirées comme un vrai DJ.",
    icon: Music,
    color: "from-[#FF6B00] to-orange-500",
    shadow: "shadow-orange-500/20"
  },
  {
    id: 4,
    title: "Faire Plaisir",
    description: "Faites passer votre message en chanson. Une petite attention personnalisée juste pour donner le sourire à quelqu'un.",
    icon: Gift,
    color: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-500/20"
  },
  {
    id: 5,
    title: "Événements Spéciaux",
    description: "Célébrez chaque instant de la vie avec une musique qui reflète parfaitement votre état d'esprit.",
    icon: PartyPopper,
    color: "from-blue-500 to-cyan-500",
    shadow: "shadow-blue-500/20"
  }
];

export default function UseCasesSlider() {
  const [width, setWidth] = useState(0);
  const carousel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (carousel.current) {
      setWidth(carousel.current.scrollWidth - carousel.current.offsetWidth);
    }
    
    const handleResize = () => {
        if (carousel.current) {
          setWidth(carousel.current.scrollWidth - carousel.current.offsetWidth);
        }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="py-24 bg-white overflow-hidden border-t border-gray-100">
      <div className="space-y-12 w-full">
        <div className="max-w-7xl mx-auto text-center space-y-3 px-6 md:px-12">
          <p className="text-sm font-bold text-pink-500 uppercase tracking-widest">Une infinité de possibilités</p>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900">Pourquoi utiliser Meliodia ?</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Que ce soit pour célébrer un événement, créer ou simplement s'amuser, Meliodia donne vie à vos idées musicales en quelques secondes.
          </p>
        </div>

        <motion.div ref={carousel} className="cursor-grab pt-4 pb-12 w-full" whileTap={{ cursor: "grabbing" }}>
          <motion.div 
            drag="x" 
            dragConstraints={{ right: 0, left: -width }} 
            className="flex gap-6 px-6 md:px-12 xl:pl-[calc((100vw-80rem)/2+3rem)] xl:pr-[calc((100vw-80rem)/2+3rem)]"
          >
            {useCases.map((useCase) => (
              <motion.div 
                key={useCase.id}
                className={`min-w-75 md:min-w-90 bg-white rounded-3xl p-8 shadow-xl ${useCase.shadow} border border-gray-100 flex flex-col gap-4 select-none`}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${useCase.color} flex items-center justify-center shadow-lg mb-2`}>
                  <useCase.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{useCase.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {useCase.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
          
          <div className="text-center mt-8 md:hidden">
              <span className="text-xs text-gray-400 flex items-center justify-center gap-2">
                  <span className="w-8 h-px bg-gray-300"></span>
                  Glissez pour voir plus
                  <span className="w-8 h-px bg-gray-300"></span>
              </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
