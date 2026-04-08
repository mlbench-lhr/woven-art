"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus, Minus } from "lucide-react";
import Image from "next/image";

const faqData = [
  {
    question: "Can I generate string art for free?",
    answer: "Yes! You can generate as many string art designs as you'd like and save them to your profile once you're logged in. However, to unlock the step-by-step instructions to actually construct your string art, you'll need to redeem one credit."
  },
  {
    question: "How do I redeem the code I received via email?",
    answer: "To redeem your code, go to the \"Shop Credits\" page and enter your code in the redemption box. Once verified, the credit will be added to your account immediately."
  },
  {
    question: "Can I continue a string art project later?",
    answer: "Absolutely! Your progress is automatically saved to your profile. You can access your ongoing projects anytime from your dashboard and pick up right where you left off."
  },
  {
    question: "Do I need to be logged in to save my creations?",
    answer: "Yes, you need to be logged in so we can securely save your artwork to your personal profile. This allows you to access your designs across different devices."
  },
  {
    question: "What do I get when I redeem a credit?",
    answer: "Redeeming a credit unlocks the full step-by-step instructions for your chosen string art design, including the specific sequence of pegs and thread paths needed to create your physical masterpiece."
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-[1200px] mx-auto px-6 py-12 lg:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
          <div className="pt-8">
            <h1 className="text-4xl leading-tight mb-16">
              <span className="font-bold text-[#171d1a]">Frequently Asked Questions</span>
            </h1>

            <AccordionPrimitive.Root type="single" collapsible className="w-full space-y-2">
              {faqData.map((item, index) => (
                <AccordionPrimitive.Item key={index} value={`item-${index}`} className="border-b border-[#e5e7eb]">
                  <AccordionPrimitive.Header className="flex">
                    <AccordionPrimitive.Trigger className="flex flex-1 items-start justify-between py-6 text-left outline-none group">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <Plus className="h-5 w-5 text-[#51606e] group-data-[state=open]:hidden" />
                          <Minus className="h-5 w-5 text-[#51606e] hidden group-data-[state=open]:block" />
                        </div>
                        <span className="text-[18px] font-sans font-semibold text-[#171d1a]">{item.question}</span>
                      </div>
                    </AccordionPrimitive.Trigger>
                  </AccordionPrimitive.Header>
                  <AccordionPrimitive.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
                    <div className="pl-9 pr-4 pb-8 text-[17px] text-[#51606e] leading-relaxed">
                      {item.answer}
                    </div>
                  </AccordionPrimitive.Content>
                </AccordionPrimitive.Item>
              ))}
            </AccordionPrimitive.Root>
          </div>

          <div className="hidden lg:flex justify-end items-center h-full pt-10">
            <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
              <Image
                src="/faq.png"
                alt="Frequently Asked Questions"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
