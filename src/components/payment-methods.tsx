import React from "react";
import {
  SiVisa,
  SiMastercard,
  SiAmericanexpress,
  SiPaypal,
  SiApple,
} from "react-icons/si";

export function PaymentMethods(): JSX.Element {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* @ts-ignore */}
      <SiVisa className="h-8 w-auto text-[#1434CB]" />
      {/* @ts-ignore */}
      <SiMastercard className="h-8 w-auto text-[#EB001B]" />
      {/* @ts-ignore */}
      <SiAmericanexpress className="h-8 w-auto text-[#006FCF]" />
      {/* @ts-ignore */}
      <SiPaypal className="h-8 w-auto text-[#00457C]" />
      {/* @ts-ignore */}
      <SiApple className="h-8 w-auto text-[#A2AAAD]" />
    </div>
  );
}
