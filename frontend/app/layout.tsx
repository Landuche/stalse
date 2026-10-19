import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mini Inbox - Stalse',
  icons: {
    icon: 'https://www.stalse.com/favicon.ico', 
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        <header className="bg-white border-b border-gray-200 shadow-sm overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link 
              href="/tickets" 
              className="flex items-center focus:outline-none -ml-3 transition hover:opacity-90"
            >
              <div className="h-16 flex items-center justify-center overflow-hidden">
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTY7HHBD2MPJBtOiEIgIX9aaDSKYCa-czaM2_ncE8Rpgw&s=10" 
                  alt="Stalse Logo" 
                  style={{ height: '64px', width: 'auto' }}
                  className="object-contain scale-125"
                />
              </div>
            </Link>

            <nav className="flex gap-6 font-medium text-sm items-center">
              <Link href="/tickets" className="hover:text-indigo-600 transition">Tickets</Link>
              <Link href="/dashboard" className="hover:text-indigo-600 transition">Dashboard</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-7xl w-full mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}