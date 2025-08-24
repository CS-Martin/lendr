
import NavBar from '@/components/shared/layout/main-navbar';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <NavBar />
      {children}
    </main>
  );
}
