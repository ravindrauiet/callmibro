import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Schedule & Address | CallMiBro',
  description: 'Choose your preferred date, time, and provide your address for service',
};

export default function ScheduleAddressLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
} 