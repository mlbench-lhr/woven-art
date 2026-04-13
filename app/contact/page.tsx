"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Swal from "sweetalert2";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(5, "Message must be at least 5 characters"),
});

type FormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Your message has been sent successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
        reset();
      } else {
        const result = await res.json();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.error || "Something went wrong. Please try again.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-12 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left Content */}
            <div className="flex flex-col gap-6">
              <h1 className="text-4xl md:text-5xl font-bold text-[#171d1a]">
                Contact
              </h1>
              <p className="text-lg text-[#51606e] leading-relaxed max-w-lg">
                Whether you&apos;re experiencing an issue with your account, have questions about
                features, or want to share your feedback, our dedicated support team is here to
                help. Reach out to us anytime at{" "}
                <a 
                  href="mailto:contact@wovenart.store" 
                  className="text-[#C5B4A3] hover:underline font-medium"
                >
                  contact@wovenart.store
                </a>{" "}
                or fill out the form, and we&apos;ll get back to you within 24-48 hours.
              </p>
            </div>

            {/* Right Form */}
            <form 
              onSubmit={handleSubmit(onSubmit)} 
              className="flex flex-col gap-6 w-full max-w-xl bg-white"
            >
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#171d1a]" htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter your name"
                  className={`w-full h-12 px-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C5B4A3]/50 transition-all ${
                    errors.name ? "border-red-500" : ""
                  }`}
                  {...register("name")}
                />
                {errors.name && (
                  <span className="text-red-500 text-xs">{errors.name.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#171d1a]" htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className={`w-full h-12 px-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C5B4A3]/50 transition-all ${
                    errors.email ? "border-red-500" : ""
                  }`}
                  {...register("email")}
                />
                {errors.email && (
                  <span className="text-red-500 text-xs">{errors.email.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#171d1a]" htmlFor="message">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  placeholder="Enter your message"
                  rows={6}
                  className={`w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C5B4A3]/50 transition-all resize-none ${
                    errors.message ? "border-red-500" : ""
                  }`}
                  {...register("message")}
                />
                {errors.message && (
                  <span className="text-red-500 text-xs">{errors.message.message}</span>
                )}
              </div>

              <Button
                type="submit"
                variant="main_green_button"
                className="w-full h-14 rounded-full text-lg font-semibold primary-button !rounded-full"
                loading={loading}
                loadingText="Sending..."
              >
                Submit
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
