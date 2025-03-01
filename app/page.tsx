'use client';


import Link from 'next/link';


export default function Home() {

 
  return (
    <div className="flex items-center justify-center h-[80vh] bg-gray-50">
     
      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-extrabold mb-4">Discover the Right Talent with SkillScan</h2>
          <p className="text-lg text-gray-600 mb-6">AI-powered candidate evaluation and ranking system to match the best skills with the right opportunities.</p>
          <div className='flex justify-center gap-10'>
          <Link
            key={'add resume'}
            href={'/form'}>
            <p  className='rounded-full hover:bg-gray-900 bg-blue-600 text-white w-fit px-5 py-1'>Add Candidates</p>
          </Link><Link
            key={'search'}
            href={'/search'}>
            <p  className='rounded-full hover:bg-gray-900 bg-blue-600 text-white w-fit px-5 py-1'>Search fit Candidate</p>
          </Link>
          </div>
        </div>
      </section>
      
    </div>
  );
}

