import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Order History | CallMiBro',
  description: 'Track your past purchases and service orders',
};

export default function OrdersLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black to-[#111]">
      <Header activePage="orders" />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
} 