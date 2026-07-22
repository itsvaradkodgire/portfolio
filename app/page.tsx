import { Nav } from '@/app/components/portfolio/Nav';
import { Opening } from '@/app/components/portfolio/Opening';
import { Experience } from '@/app/components/portfolio/Experience';
import { LiveDemos } from '@/app/components/portfolio/LiveDemos';
import { Work } from '@/app/components/portfolio/Work';
import { HireMe } from '@/app/components/portfolio/HireMe';
import { TechStack } from '@/app/components/portfolio/TechStack';
import { Contact } from '@/app/components/portfolio/Contact';
import { getProfile, getProjects, getSkills, getContact, getResume } from '@/lib/content';

// Always render from live content storage so admin edits appear immediately.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [profile, projects, skills, contact, resume] = await Promise.all([
    getProfile(),
    getProjects(),
    getSkills(),
    getContact(),
    getResume(),
  ]);

  return (
    <>
      <Nav />
      <main>
        <Opening profile={profile} />
        <Work projects={projects} />
        <Experience resume={resume} />
        <LiveDemos />
        <TechStack skills={skills} />
        <HireMe projects={projects} />
        <Contact contact={contact} profile={profile} />
      </main>
    </>
  );
}
