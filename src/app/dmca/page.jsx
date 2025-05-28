'use client';

import SharedLayout from '@/components/SharedLayout';

export default function DmcaPage() {
  return (
    <SharedLayout>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">DMCA Policy</h1>
        
        <div className="prose prose-invert prose-lg max-w-none">
          <div className="space-y-6 text-gray-400">
            <p>
              We take the intellectual property rights of others seriously and require that our Users do the same. 
              The Digital Millennium Copyright Act (DMCA) established a process for addressing claims of copyright infringement. 
              If you own a copyright or have authority to act on behalf of a copyright owner and want to report a claim that a third party is 
              infringing that material on or through JustAnime's services, please submit a DMCA report as outlined below, and we will take appropriate action.
            </p>
            
            <div>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">DMCA Report Requirements</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>A description of the copyrighted work that you claim is being infringed;</li>
                <li>A description of the material you claim is infringing and that you want removed or access to which you want disabled and the URL or other location of that material;</li>
                <li>Your name, title (if acting as an agent), address, telephone number, and email address;</li>
                <li>The following statement: "I have a good faith belief that the use of the copyrighted material I am complaining of is not authorized by the copyright owner, its agent, or the law (e.g., as a fair use)";</li>
                <li>The following statement: "The information in this notice is accurate and, under penalty of perjury, I am the owner, or authorized to act on behalf of the owner, of the copyright or of an exclusive right that is allegedly infringed";</li>
                <li>An electronic or physical signature of the owner of the copyright or a person authorized to act on the owner's behalf.</li>
              </ul>
            </div>
            
            <div className="mt-8">
              <p>
                Your DMCA takedown request should be submitted through our <a href="/contacts" className="text-gray-300 hover:text-white transition-colors duration-200 underline">Contact page</a>.
              </p>
              
              <p className="mt-4">
                We will then review your DMCA request and take proper actions, including removal of the content from the website.
              </p>
            </div>
            
            <div className="bg-gray-800/40 p-6 rounded-lg mt-8 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Submit a DMCA Request</h3>
              <p>
                To submit a DMCA takedown request, please include all required information as listed above and 
                contact us through our <a href="/contacts" className="text-gray-300 hover:text-white transition-colors duration-200 underline">Contact page</a>.
              </p>
              <div className="mt-4">
                <a 
                  href="/contacts" 
                  className="inline-flex items-center px-5 py-2 border border-gray-600 text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition-colors duration-200"
                >
                  Go to Contact Page
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
} 