"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import logo from "@/public/logo.png";
import CurrencySelector from "@/components/ui/currency-selector";
import {
  Menu,
  X,
  Home,
  Newspaper,
  Info,
  Compass,
  Phone,
  ChevronRight,
} from "lucide-react";

export function Navigation() {
  const [pathname, setPathname] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user_id = useAppSelector((s) => s.auth.user?.id);
  const user_role = useAppSelector((s) => s.auth.user?.role);
  console.log("user_role", user_role);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const navLinks = (
    <>
      <Link
        href="/"
        className={
          pathname === "home"
            ? "font-[600] text-sm lg:text-[16px]"
            : "text-[rgba(0,0,0,0.60)] text-sm lg:text-[16px] font-[500]"
        }
        onClick={() => {
          setIsMobileMenuOpen(false);
          setPathname("home");
        }}
      >
        Home
      </Link>
      <Link
        href="/blogs"
        className={
          pathname.includes("blogs")
            ? "font-[600] text-sm lg:text-[16px]"
            : "text-[rgba(0,0,0,0.60)] text-sm lg:text-[16px] font-[500]"
        }
        onClick={() => {
          setIsMobileMenuOpen(false);
          setPathname("blogs");
        }}
      >
        Blogs
      </Link>
      <Link
        href="/#About"
        className={
          pathname.includes("About")
            ? "font-[600] text-sm lg:text-[16px]"
            : "text-[rgba(0,0,0,0.60)] text-sm lg:text-[16px] font-[500]"
        }
        onClick={() => {
          setIsMobileMenuOpen(false);
          setPathname("About");
        }}
      >
        About Us
      </Link>
      <Link
        href="/explore"
        className={
          pathname.includes("/ToursAndActivities")
            ? "font-[600] text-sm lg:text-[16px]"
            : "text-[rgba(0,0,0,0.60)] text-sm lg:text-[16px] font-[500]"
        }
        onClick={() => {
          setIsMobileMenuOpen(false);
          setPathname("ToursAndActivities");
        }}
      >
        Tours & Activities
      </Link>
      <Link
        href="/#Contact"
        className={
          pathname.includes("Contact")
            ? "font-[600] text-sm lg:text-[16px]"
            : "text-[rgba(0,0,0,0.60)] text-sm lg:text-[16px] font-[500]"
        }
        onClick={() => {
          setIsMobileMenuOpen(false);
          setPathname("Contact");
        }}
      >
        Contact
      </Link>
    </>
  );

  const mobileNavItems = [
    { key: "home", label: "Home", href: "/", icon: Home },
    { key: "blogs", label: "Blogs", href: "/blogs", icon: Newspaper },
    { key: "About", label: "About Us", href: "/#About", icon: Info },
    {
      key: "ToursAndActivities",
      label: "Tours & Activities",
      href: "/explore",
      icon: Compass,
    },
    { key: "Contact", label: "Contact", href: "/#Contact", icon: Phone },
  ];

  return (
    <nav
      className="h-[70px] md:h-[80px] flex items-center px-[20px]  lg:px-[80px] 2xl:px-[90px] bg-white shadow-sm relative"
      style={{ zIndex: 110 }}
    >
      <div className="flex justify-between items-center w-full">
        {/* Logo */}

        <div className="flex items-center justify-start gap-0">
          <Link href="/" className="flex items-center">
            {/* <Image
              width={200}
              height={72}
              src={logo.src}
              alt="Logo"
              className="w-[130px] h-[50px] md:w-[200px] md:h-[72px]"
            /> */}
            <div className="w-[130px] h-[50px] md:w-[200px] md:h-[72px] bg-image"></div>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="flex justify-end items-center gap-0 md:gap-6 lg:gap-[100px]">
          <div className="hidden md:flex gap-4.5 lg:gap-[48px] items-center">
            {navLinks}
          </div>

          {/* Desktop Button */}
          <div className="flex items-center space-x-4">
            <CurrencySelector />
            <Button asChild variant={"main_green_button"}>
              <Link
                href={
                  !user_id
                    ? "/auth/login"
                    : user_role === "admin"
                    ? "/admin/dashboard"
                    : user_role === "vendor"
                    ? "/vendor/dashboard"
                    : "/explore"
                }
              >
                {user_id ? "Get Started" : "Login Now"}
              </Link>
            </Button>
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="focus:outline-none cursor-pointer"
              >
                {<Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        {/* Hamburger (Mobile) */}
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.3)] z-[109] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu (Left Drawer) */}
      <div
        className={`fixed top-0 right-0 h-full w-[90%] bg-white shadow-lg border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-[110] md:hidden
  ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 h-[64px] flex items-center justify-between border-b">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src={logo.src}
                alt="Logo"
                width={140}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
              className="focus:outline-none cursor-pointer p-2 rounded-md hover:bg-gray-100"
            >
              <X size={22} />
            </button>
          </div>
          <nav className="px-2 py-4">
            <ul className="space-y-1">
              {mobileNavItems.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.key || pathname.includes(item.key);
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setPathname(item.key);
                      }}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        active
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon
                          className={`h-5 w-5 ${
                            active ? "text-gray-900" : "text-gray-500"
                          }`}
                        />
                        <span className="text-[15px] font-medium">
                          {item.label}
                        </span>
                      </span>
                      <ChevronRight
                        className={`h-4 w-4 ${
                          active ? "text-gray-900" : "text-gray-400"
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="mt-auto px-6 pb-6">
            <div className="mb-3">
              <CurrencySelector size="default" className="w-full" />
            </div>
            <Button asChild variant={"main_green_button"} className="w-full">
              <Link
                href={
                  !user_id
                    ? "/auth/login"
                    : user_role === "admin"
                    ? "/admin/dashboard"
                    : user_role === "vendor"
                    ? "/vendor/dashboard"
                    : "/explore"
                }
              >
                {user_id ? "Get Started" : "Login Now"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
