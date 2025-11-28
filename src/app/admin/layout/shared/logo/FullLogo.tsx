"use client";
import React from "react";
import Image from "next/image";
import Logo from "/public/assets/logo.png";
import Logowhite from "/public/assets/logo.png";
import Link from "next/link";
const FullLogo = () => {
  return (
    <Link href={"/"}>
      {/* Dark Logo   */}
      <Image src={Logo} alt="logo" className="block dark:hidden rtl:scale-x-[-1] translate-y-1 w-50 h-14" />
      {/* Light Logo  */}
      <Image src={Logowhite} alt="logo" className="hidden dark:block rtl:scale-x-[-1] translate-y-1 w-50 h-15" />
    </Link>
  );
};

export default FullLogo;
