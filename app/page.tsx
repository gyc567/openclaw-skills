"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Footer } from "@/components/footer";
import { setupGlobalErrorHandlers } from "@/lib/error-handler";

export default function Home() {
  useEffect(() => {
    setupGlobalErrorHandlers();
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar onSearch={() => {}} />
      <Hero />
      <Footer />
    </main>
  );
}
