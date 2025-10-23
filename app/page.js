import Navbar from "@/components/Navbar/Navbar";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="w-full">
      <Navbar />
      <p>Hello Front end developer</p>
      <Button>Lets Go</Button>
    </div>
  );
}
