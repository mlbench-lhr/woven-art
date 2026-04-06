import Link from "next/link";

export function Footer() {
  return (
    <footer className="px-0 md:px-[20px]  lg:px-[80px] 2xl:px-[90px] w-full bg-[#C5B4A3] py-6 md:py-[40px] xl:py-[56px] text-[rgba(255,255,255,0.80)]">
      <div className="w-full flex justify-between items-center mx-auto flex-wrap gap-8 md:gap-y-[48px]">
        <div className="px-[20px] md:px-[0px] flex justify-between items-start flex-col gap-[12px]">
          <div className="w-[130px] h-[50px] md:w-[200px] md:h-[72px] white-bg-image"></div>
          <span className="font-[400] text-white text-sm md:text-base">
            Discover amazing tours and activities with ease.
            <br className="hidden md:block" /> Connect with trusted local
            vendors and create unforgettable experiences.
          </span>
        </div>
        <div className="px-[20px] md:px-[0px] flex justify-start items-center gap-[48px] lg:gap-[24px] pe-0 md:pe-20">
          <div className="flex justify-between items-start gap-2 md:gap-y-[10px] gap-x-[40px] flex-col text-sm md:text-base">
            <span className="font-[600] text-white">Quick Links</span>
            <Link href="#About">About</Link>
            <Link href="/#WhyChoose">Why choose</Link>
            <Link href="/#Contact">Contact</Link>
            <Link href="/vendor/auth/signup">Become a vendor</Link>
          </div>
        </div>
        <div className="w-full px-[20px] md:px-[0px] py-5 md:py-8 border-y-2 border-[rgba(255,255,255,0.50)] font-[400] text-[12px] flex justify-center md:justify-start gap-2 md:gap-4 items-center">
          <Link href={"/terms-and-conditions"}>Terms & Conditions</Link>
          <span>|</span>
          <Link href={"/privacy-policy"}>Privacy Policy</Link>
          <span>|</span>
          <Link href={"/privacy-policy"}>KVKK Privacy</Link>
        </div>
        <span className="w-full px-[20px] md:px-[0px] text-sm md:text-base font-[400] text-white mx-auto text-center">
          © 2025 Woven Art. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
