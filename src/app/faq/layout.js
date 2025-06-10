import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'FAQ | CallMiBro',
  description: 'Frequently asked questions about CallMiBro services and products',
};

export default function FAQLayout({ children }) {
  return (
    <>
      <Header activePage="faq" />
      {children}
      <Footer />
    </>
  );
} 