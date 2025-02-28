"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";



interface RoadmapPageProps {
  onClose: () => void;
}

const phases = [
  {
    title: "Phase 1: Foundation",
    content:
      "Market Research\nActivities:  Conduct user surveys, analyze market trends, identify target demographics.\nGoal: Gain insights to tailor the project to market needs and user preferences. \n Team Formation\nActivities: : Assemble experts in development, marketing, design, and project management.\nGoal:  Create a robust team to execute the vision effectively. \n Telegram Mini-App Launch\nActivities:   Release initial version with core functionalities for testing.\nGoal: Collect user feedback for iterative development.\n Community Building\nActivities:  : Establish social media presence, engage with users, encourage community growth.\nGoal: : Build a supportive and engaged user base.  " ,
  },
  {
    title: "Phase 2: Expansion",
    content:
      "Erverse Wallet Launch:-\nActivities: Introduce wallet with basic functionalities (Send, Receive, Swap, Bridge).\nGoal: Provide users with a secure, user-friendly platform for token management.\n\n  Wallet Features Expansion\n Activities: Add advanced features like staking, yield farming, or multi-asset support. \n Goal: Enhance user experience and utility of the wallet.",

      
  },
  {
    title: "Phase 3: Growth",
    content:
      "   Erverse Games:-  \nActivities: Expand gaming ecosystem with PvP games and diverse gameplay.\nGoal: Engage users with fun, competitive experiences.\n\n  Mining End:-  \n Conclude the mining phase of the project.\nGoal: Transition from mining to other forms of engagement or rewards.\n\n  Level Conversion to NFT:-  \nActivities: Convert user levels into Erverse Genesis Citizen Badges NFTs.\nGoal:  Reward early adopters with valuable, unique digital assets.\n\n EPartnerships and Collaborations:-  \nActivities: : Forge strategic alliances with gaming, finance, and tech sectors.\nGoal: : Expand reach, enhance product offerings, and drive innovation.",
  },
  {
    title: "Phase 4: Ervepad Launch",
    content:
      "Ervepad:- \nActivities: : Launch platform for creating and managing meme tokens.\nGoal: Provide a platform for creativity, community involvement, and further ecosystem expansion",
  },

   {
    title: "Airdrop",
    content:
      "Activities:   Distribute token to eligible users as part of the growth strategy.\nGoal: Increase token distribution, community engagement, and loyalty. \n\n Disclaimer:- \n This roadmap is intended to outline our vision and planned development trajectory. However, alldates, features, and phases are subject to change based on various factors including but notlimited to market conditions, technological advancements, regulatory changes, and community feedback. We commit to transparency and will communicate any significant alterations to this roadmap as they occur.",
  },
];

export function RoadmapPage({ onClose }: RoadmapPageProps) {
  const [currentPhase, setCurrentPhase] = useState(0);

  const nextPhase = () => setCurrentPhase((prev) => (prev + 1) % phases.length);
  const prevPhase = () =>
    setCurrentPhase((prev) => (prev - 1 + phases.length) % phases.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
    >
      <div className="relative w-[95%] max-w-sm mx-auto rounded-xl bg-white shadow-lg p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        {/* Title */}
        <h2 className="mb-4 text-center text-lg font-bold text-[#25D366]">
          ERVERSE WALLET
        </h2>
        <p className="mb-6 text-center text-sm font-medium text-gray-500">
          Multichain self-custodial wallet on Telegram
        </p>

        {/* Content Area */}   
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="mb-2 text-base font-semibold text-[#128C7E]">
              {phases[currentPhase].title}
            </h3>
            <p className="whitespace-pre-line text-sm text-gray-700 leading-relaxed">
              {phases[currentPhase].content}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <div className="flex justify-between mt-6">
          <button
            onClick={prevPhase}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-gray-100 text-gray-500 hover:bg-[#25D366] hover:text-white transition"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={nextPhase}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-gray-100 text-gray-500 hover:bg-[#25D366] hover:text-white transition"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

