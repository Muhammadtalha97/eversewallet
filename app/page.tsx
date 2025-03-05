"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { SplashScreen } from "@/components/splash-screen";
import { WelcomeScreen } from "@/components/welcome/welcome-screen";
import { MiningSection } from "@/components/mining-section";
import { TasksSection } from "@/components/tasks-section";
import { storeReferralData } from "@/lib/referral-service";
import { FrensSection } from "@/components/frens-section";
import { NavigationBar } from "@/components/navigation-bar";
import AuthForm from "@/components/AuthForm";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState("mining");
  const [totalMined, setTotalMined] = useState(0);
  const [level, setLevel] = useState(1);
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
 useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push("/");
    }
  }, [user, loading, router, mounted]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const referralCode = params.get("ref");
    if (referralCode) {
      storeReferralData(referralCode, referralCode);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);


  if (!user) {
    return <AuthForm />;
  }

  if (showSplash || loading) {
    return <SplashScreen />;
  }

  

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {activeTab === "mining" && (
        <MiningSection
          totalMined={totalMined}
          setTotalMined={setTotalMined}
        />
      )}
      {activeTab === "tasks" && (
        <TasksSection
          onTaskComplete={(reward) => {
            setTotalMined((prev) => prev + reward);
          }}
        />
      )}
      {activeTab === "frens" && (
        <FrensSection
          onReferralReward={(amount) => {
            setTotalMined((prev) => prev + amount);
            setLevel((prevLevel) => Math.min(prevLevel + 1, 7));
          }}
        />
      )}
      <NavigationBar activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  );
}
