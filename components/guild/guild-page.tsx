"use client";

import { RefreshCw } from "lucide-react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { auth, getUserData } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";

interface GuildPageProps {
  onBack: () => void;
}

interface Miner {
  rank?: number;
  medal?: string;
  avatar: string;
  name: string;
  score: number;
}
const guildLevels: {
  id: number;
  name: string;
  image: string;
  percentage: string;
  miners: Miner[];
}[] = [
  {
    id: 1,
    name: "Prospector",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DALL%C2%B7E%202025-01-25%2013.10.05%20-%20An%20image%20displaying%20the%20text%20'Level%201'%20written%20in%20elegant%20italic%20font.%20The%20background%20is%20moderate,%20featuring%20a%20simple%20design%20with%20subtle%20gradients%20and-lNBGfQvlAWWq5DcXU2bgtB1zscDgVL.webp",
    percentage: `Refer 3 friends to level up`,
    miners: [],
  },
  {
    id: 2,
    name: "Emoji Miner",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DALL%C2%B7E%202025-01-25%2013.10.07%20-%20An%20image%20displaying%20the%20text%20'Level%202'%20written%20in%20elegant%20italic%20font.%20The%20background%20is%20fancier,%20featuring%20vibrant%20gradients,%20soft%20glowing%20effects,%20a-xFuLwywW0NJoFqR2iAGiiwUVF0KV4C.webp",
    percentage: "your level determines your drop",
    miners: [],
  },
  {
    id: 3,
    name: "TON Supporter",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_y6jgqjy6jgqjy6jg-etW5YL69KRKXfCKsWw4svK72KAsCQF.jpeg",
    percentage: "your level determines your drop",
    miners: [],
  },
  {
    id: 4,
    name: "Erverse Advocate",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_je08fhje08fhje08-7JvR6ZntXXMbTtiiHVoMZWS9Gz5vFA.jpeg",
    percentage: "your level determines your drop",
    miners: [],
  },
  {
    id: 5,
    name: "Network Booster",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_h4ymrjh4ymrjh4ym-Q0LZIOsxf9cCaULPtq828QKxIxShZv.jpeg",
    percentage: "your level determines your drop",
    miners: [],
  },
  {
    id: 6,
    name: "Streak Master",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_fktdv8fktdv8fktd-ur6TmbhNzEZcdzSwJzH2RocMfVVZAe.jpeg",
    percentage: "your level determines your drop",
    miners: [],
  },
  {
    id: 7,
    name: "Social Sharer",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_mwb8nqmwb8nqmwb8-ngh5MQwnWRvdaPRr1H3zrJAeI8EE8O.jpeg",
    percentage: "your level determines your drop",
    miners: [],
  },
];

export function GuildPage({ onBack }: GuildPageProps) {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [slideDirection, setSlideDirection] = useState("right");
  const [dynamicPercentage, setDynamicPercentage] = useState(
    "Refer 3 friends to level up"
  );
  const [shareCount, setShareCount] = useState(0);
  const [userData, setUserData] = useState<any>(null);
  const [user, loading] = useAuthState(auth);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push("/");
    }
  }, [user, loading, router, mounted]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const data = await getUserData(user.uid);
        if (data) {
          setUserData(data);
          const initialLevel = data.level ? data.level - 1 : 0;
          setCurrentLevel(initialLevel);
        }
      }
    };
    if (mounted) fetchData();
  }, [user, mounted]);

  // Update dynamic percentage
  useEffect(() => {
    if (guildLevels[currentLevel].id === 1) {
      const referrals = userData?.numberOfReferrals || 0;
      setDynamicPercentage(`Refer ${referrals}/3 friends to level up`);
    } else {
      setDynamicPercentage(guildLevels[currentLevel].percentage);
    }
  }, [currentLevel, userData?.numberOfReferrals]);


  const nextLevel = () => {
    if (currentLevel < guildLevels.length - 1) {
      setSlideDirection("right");
      setCurrentLevel((prev) => prev + 1);
    }
  };

  const prevLevel = () => {
    if (currentLevel > 0) {
      setSlideDirection("left");
      setCurrentLevel((prev) => prev - 1);
    }
  };

 const handleShare = async () => {
    if (!userData?.referralToken || !user) {
      toast.error("Referral information not available");
      return;
    }

    const referralLink = `${window.location.origin}?ref=${userData.referralToken}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join ERVERSE WALLET",
          text: "Join me in ERVERSE WALLET! Use my referral link:",
          url: referralLink,
        });
      } else {
        await navigator.clipboard.writeText(referralLink);
        toast.success("Link copied! Share with friends.");
      }

      // Update referrals in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        numberOfReferrals: increment(1)
      });

      const updatedData = await getUserData(user.uid);
      setUserData(updatedData);

     // Check for level up (Firestore level 1 → id 1 → needs 3 referrals)
      if (updatedData.numberOfReferrals >= 3 && updatedData.level === 1) {
        await updateDoc(userRef, { level: 2, miningSpeed: 0.6 });
        setUserData((prev: any) => ({ ...prev, level: 2,miningSpeed: 0.6 }));
        setCurrentLevel(1); // Index for id 2
      }

    } catch (error) {
      toast.error("Sharing failed. Try again.");
      console.error("Sharing failed:", error);
    }
  };

  

  const level = guildLevels[currentLevel];

  return (
    <div className="min-h-screen bg-[#EEF3FA]">
      <div className="mb-6 flex items-center justify-between p-4">
        <button onClick={onBack} className="text-2xl text-gray-600">
          ←
        </button>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Mining guilds</h1>
          <RefreshCw className="h-5 w-5 text-gray-600" />
        </div>
        <div className="w-6" />
      </div>

      <div className="relative px-4">
        <div className="flex items-center justify-center">
          <button
            onClick={prevLevel}
            disabled={currentLevel === 0}
            className="absolute left-8 z-10 text-3xl text-gray-400/80 disabled:opacity-50"
          >
            {"<"}
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentLevel}
              initial={{
                opacity: 0,
                x: slideDirection === "right" ? 100 : -100,
              }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: slideDirection === "right" ? -100 : 100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex flex-col items-center will-change-transform"
            >
              <div className="relative mb-4 h-32 w-32">
                <Image
                  src={level.image || "/placeholder.svg"}
                  alt={level.name}
                  width={128}
                  height={128}
                  className="h-full w-full rounded-2xl object-contain"
                  priority
                />
              </div>
              <h2 className="text-xl font-semibold">{level.name}</h2>
              {level.name != "Prospector" && (
                <p className="text-sm text-gray-500">{level.percentage}</p>
              )}

              {level.name === "Prospector" && (
                <p className="text-sm text-gray-500">{dynamicPercentage}</p>
              )}
            </motion.div>
          </AnimatePresence>

          <button
            onClick={nextLevel}
            disabled={currentLevel === guildLevels.length - 1}
            className="absolute right-8 z-10 text-3xl text-gray-400/80 disabled:opacity-50"
          >
            {">"}
          </button>
        </div>
      </div>

      <div className="mt-6 px-4 text-center">
        {level.name === "Prospector" && (
          <button
            type="button"
            onClick={handleShare}
            className="text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            Share & Invite
          </button>
        )}
      </div>
    </div>
  );
}
