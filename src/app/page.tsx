import CtaBanner from '@/components/home/CtaBanner';
import Hero from '@/components/home/Hero';
import HowItWorks from '@/components/home/HowItWorks';
import PopularRoutes from '@/components/home/PopularRoutes';
import WhySaathChalo from '@/components/home/WhySaathChalo';

export default function HomePage() {
  return (
    <>
      <Hero />
      <PopularRoutes />
      <HowItWorks />
      <WhySaathChalo />
      <CtaBanner />
    </>
  );
}
