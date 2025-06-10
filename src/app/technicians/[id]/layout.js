import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Technician Profile | CallMiBro',
  description: 'View detailed profile, skills, and services offered by our expert technicians',
};

export default function TechnicianProfileLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
} 