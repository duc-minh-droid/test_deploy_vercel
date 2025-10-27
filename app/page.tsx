"use client"

import { motion } from "framer-motion"
import { HeroSection } from "@/components/home/HeroSection"
import { LoadingExamples } from "@/components/home/LoadingExamples"
import { GettingStarted } from "@/components/home/GettingStarted"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
}

export default function Home() {
  return (
    <motion.div
      className="flex flex-col"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <HeroSection />
      <LoadingExamples />
      <GettingStarted />
    </motion.div>
  )
}
