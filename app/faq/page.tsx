"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus, Minus } from "lucide-react";
import Image from "next/image";

const faqData = [
  {
    question: "How do I start my string art?",
    answer:
      "Before you start stringing, tie the string securely to the first nail (Step 1). This will be your starting point.\nAfter that, continue stringing without making any additional knots.",
  },
  {
    question: "How do I follow the design?",
    answer:
      "Simply follow the step-by-step instructions shown in the tool. Each step tells you exactly which nails to connect with the string.",
  },
  {
    question: "Do I need to tie knots during the process?",
    answer:
      "No. You only need to tie the string once at the beginning. After that, continue stringing without making additional knots.",
  },
  {
    question: "What should I do when I finish the design?",
    answer:
      "Once you’ve completed all steps, tie off the string securely at the final nail to finish your artwork.",
  },
  {
    question: "How do I redeem the code I received via email?",
    answer:
      "Just follow these steps:\n1. Log in or sign up.\n2. Go to your profile.\n3. Click the \"Redeem or buy credits\" button.\n4. Enter your code and click Submit.",
  },
  {
    question: "What if I don’t remember where I left off?",
    answer:
      "Use the “I’m lost” button on the instruction page. Enter your 3 most recent steps, and the tool will help you find where you left off so you can continue.",
  },
  {
    question: "Do I need an account to save my designs?",
    answer:
      "Yes, you need to be logged in to save your designs or unlock instructions. Without an account, your progress and designs will not be stored.",
  },
  {
    question: "Can I continue my project later?",
    answer:
      "Yes, your progress is saved automatically while you are working. You can come back at any time and continue from where you stopped.",
  },
  {
    question: "What are credits?",
    answer:
      "Credits are used to unlock step-by-step string art instructions for your designs.",
  },
  {
    question: "How many credits do I get?",
    answer: "You will receive 3 credits via email after placing your order.",
  },
  {
    question: "What can I do with credits?",
    answer: "Each credit allows you to unlock one design in the WovenArt tool.\n3 credits = 3 designs",
  },
  {
    question: "Where can I find my credits?",
    answer:
      "Your credits are sent to your email after your purchase. Follow the instructions in the email to activate them.",
  },
  {
    question: "Can I use one credit multiple times?",
    answer: "No, each credit can only be used once to unlock a single design.",
  },
  {
    question: "Can I get more credits?",
    answer: "Yes, additional credits may be available for purchase in the future.",
  },
  {
    question: "Can I upload my own image?",
    answer:
      "Yes, you can upload your own image to generate a custom string art design.",
  },
  {
    question: "Why does my artwork look mirrored while stringing?",
    answer:
      "You create the artwork from the back side of the frame. This means the design appears mirrored during the process, but once you hang it, it will look correct.",
  },
  {
    question: "What if I make a mistake while stringing?",
    answer:
      "You can carefully remove the string and redo the step. Take your time and follow the instructions closely.",
  },
  {
    question: "I didn’t receive my credits, what should I do?",
    answer:
      "Please check your spam folder first. If you still haven’t received your credits, contact us at contact@wovenart.store and we’ll help you.",
  },
  {
    question: "I have another question",
    answer:
      "Feel free to reach out to us at contact@wovenart.store — we’re happy to help!",
  },
  {
    question: "Show us your artwork!",
    answer:
      "Share your creation on Instagram and tag @wovenart.store to receive a $5 cashback.",
  },
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
                    <div className="pl-9 pr-4 pb-8 text-[17px] text-[#51606e] leading-relaxed whitespace-pre-line">
                      {item.answer}
                    </div>
                  </AccordionPrimitive.Content>
                </AccordionPrimitive.Item>
              ))}
            </AccordionPrimitive.Root>
          </div>

          <div className="hidden lg:flex justify-end items-start h-full pt-10">
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
