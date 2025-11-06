import Image from "next/image";

interface HeaderProps {
  variant?: "default" | "login";
}

export default function Header({ variant = "default" }: HeaderProps) {
  const imageSrc = variant === "login" ? "/login-header.png" : "/header.png";
  
  return (
    <header className="w-full flex justify-center items-center bg-[#660000] shadow-md overflow-hidden">
      <Image
        src={imageSrc}
        width={5000}
        height={5000}
        alt="UP Mindanao Gawad Tsanselor Header"
        className="w-full h-auto object-cover"
        priority
      />
    </header>
  );
}