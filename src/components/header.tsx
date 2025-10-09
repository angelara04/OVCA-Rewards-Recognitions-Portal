import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full flex justify-center items-center bg-[#660000]shadow-md overflow-hidden">
      <Image
        src="/header.png"
        width={5000}
        height={5000}
        alt="UP Mindanao Gawad Tsanselor Header"
        className="w-full h-auto object-cover"
        priority
      />
    </header>
  );
}
