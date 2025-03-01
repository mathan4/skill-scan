'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useState } from 'react';

const links = [
  { name: 'Home', href: '/' },
  {
    name: 'Form',
    href: '/form',
  },
  { name: 'Search', href: '/search' }
];

export default function NavBar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-gray-50">
      {/* Header Section */}
      <header className="bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">SkillScan</h1>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden flex items-center"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          
          {/* Desktop navigation */}
          <div className='hidden md:flex gap-10'>
            {links.map((link) => {
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={clsx(
                    'flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium hover:bg-blue-100 hover:bg-gradient-to-b from-blue-600 to-blue-800 md:flex-none md:justify-start md:p-2 md:px-3',
                    {
                      'bg-gradient-to-b from-blue-600 to-blue-800 text-white hover:text-white': pathname === link.href,
                    },
                  )}>
                  <p className="hidden md:block">{link.name}</p>
                </Link>
              );
            })}
          </div>
        </div>
        
        {/* Mobile navigation */}
        {menuOpen && (
          <div className="md:hidden mt-4">
            {links.map((link) => {
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={clsx(
                    'flex h-[48px] items-center justify-center gap-2 rounded-md p-3 text-sm font-medium hover:bg-blue-100 hover:bg-gradient-to-b from-blue-600 to-blue-800 w-full my-1',
                    {
                      'bg-gradient-to-b from-blue-600 to-blue-800 text-white hover:text-white': pathname === link.href,
                    },
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        )}
      </header>
    </div>
  );
}