import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Order History | CallMiBro',
  description: 'Track your past purchases and service orders',
};

export default function OrdersLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
} 