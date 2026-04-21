import { useState } from "react";
import Hero from "@/components/booking/Hero";
import BookingFunnel from "@/components/booking/BookingFunnel";

const Index = () => {
  const [started, setStarted] = useState(false);

  if (started) {
    return <BookingFunnel />;
  }

  return <Hero onStart={() => setStarted(true)} />;
};

export default Index;
