import { Nav } from '@/app/components/portfolio/Nav';
import { Opening } from '@/app/components/portfolio/Opening';
import { LiveDemos } from '@/app/components/portfolio/LiveDemos';
import { Work } from '@/app/components/portfolio/Work';
import { TechStack } from '@/app/components/portfolio/TechStack';
import { Contact } from '@/app/components/portfolio/Contact';

export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Opening />
        <Work />
        <LiveDemos />
        <TechStack />
        <Contact />
      </main>
    </>
  );
}
