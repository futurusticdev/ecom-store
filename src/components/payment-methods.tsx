import {
  SiVisa,
  SiMastercard,
  SiAmericanexpress,
  SiPaypal,
  SiApplepay,
} from "react-icons/si";

export function PaymentMethods() {
  return (
    <div className="flex items-center justify-center gap-4">
      <SiVisa className="h-8 w-auto text-[#1434CB]" />
      <SiMastercard className="h-8 w-auto text-[#EB001B]" />
      <SiAmericanexpress className="h-8 w-auto text-[#006FCF]" />
      <SiPaypal className="h-8 w-auto text-[#00457C]" />
      <SiApplepay className="h-8 w-auto text-black" />
    </div>
  );
}
