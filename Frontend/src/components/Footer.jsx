import React from 'react'
import SocialIcon from './SocialIcon'

const SocialLink = ({ href, icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    aria-label={label}
    className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 hover:border-[#f8d35c]/50 text-gray-400 hover:text-[#f8d35c]"
  >
    <SocialIcon name={icon} className="w-5 h-5" />
  </a>
)

function Footer({ t }) {
  return (
    <footer className="bg-gradient-to-b from-[#0b1410] to-[#040806] text-gray-300 pt-20 pb-6 border-t border-white/10 font-sans" style={{ marginTop: 'var(--section-gap)' }}>
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-12 mb-12">

          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold text-white font-serif mb-3 tracking-wide">
                Society of
                <span className="block text-[#f8d35c] text-lg mt-1 font-sans font-medium">Global Cycle</span>
              </h2>
              <p className="text-sm leading-relaxed text-gray-400">
                NGO promoting clean mobility, safer streets, and a culture of active living across Ujjain.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#f8d35c]/20 bg-[#f8d35c]/5">
              <p className="text-sm font-semibold text-[#f8d35c] flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                100+ Sunday rides & 118 km Char Dwar yatra
              </p>
            </div>

            <div className="flex gap-3 mt-2 flex-wrap">
              {t.footer.links.map((link) => (
                <SocialLink key={link.label} href={link.url} icon={link.icon} label={link.label} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-xs">Quick Links</h3>
              <ul className="flex flex-col gap-3 text-sm">
                <li><a href="#story" className="hover:text-[#f8d35c] transition-colors">About Us</a></li>
                <li><a href="#campaigns" className="hover:text-[#f8d35c] transition-colors">Programs</a></li>
                <li>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-volunteer-popup'))}
                    className="hover:text-[#f8d35c] transition-colors"
                  >
                    Volunteer
                  </button>
                </li>
                <li><a href="#" className="hover:text-[#f8d35c] transition-colors">Donate</a></li>
                <li><a href="#contact" className="hover:text-[#f8d35c] transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-xs">Transparency & Policies</h3>
              <ul className="flex flex-col gap-3 text-sm">
                <li><a href="#" className="hover:text-[#f8d35c] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#f8d35c] transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-[#f8d35c] transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-xs">Contact Information</h3>
              <ul className="flex flex-col gap-4 text-sm text-gray-400">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#f8d35c] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>EWS 2/202, Indira Nagar,<br />Agar Road, Ujjain (M.P.)</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#f8d35c] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <a href="mailto:societyofglobalcycle@gmail.com" className="hover:text-white transition-colors break-all">societyofglobalcycle@gmail.com</a>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#f8d35c] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <a href={`tel:${t.footer.phone.href}`} className="hover:text-white transition-colors">{t.footer.phone.label}</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3 uppercase tracking-wider text-xs">Legal Information</h3>
              <div className="text-xs text-gray-400 space-y-2 bg-white/5 p-4 rounded-xl border border-white/5">
                <p><strong className="text-gray-300 font-medium">Registration Type:</strong><br />Registered under Society Registration Act, 1973</p>
                <p><strong className="text-gray-300 font-medium">Registration No:</strong> 07/33/01/15657/19 (26 June 2019)</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-xs">Tax & Donation Info</h3>
              <div className="bg-[#f8d35c]/10 border border-[#f8d35c]/20 rounded-xl p-5 shadow-lg">
                <svg className="w-8 h-8 text-[#f8d35c] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                <ul className="text-sm space-y-3 mb-4 text-gray-300">
                  <li className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-gray-400">12A Reg No:</span>
                    <strong className="text-white font-medium">AACBS0728BE20251</strong>
                  </li>
                  <li className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-gray-400">80G Cert No:</span>
                    <strong className="text-white font-medium">AACBS0728BF20251</strong>
                  </li>
                </ul>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Donations are eligible for tax benefits under <span className="text-[#f8d35c] font-medium">Section 80G</span> of the Income Tax Act.
                </p>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Society of Global Cycle. All rights reserved.</p>
          <p className="flex flex-wrap items-center justify-center md:justify-end gap-2">
            Built with transparency and community trust by
            <a href="https://github.com/coder-aadii" target="_blank" rel="noreferrer" className="text-[#f8d35c] hover:text-white transition-colors font-medium">
              Aditya Aerpule
            </a>
            <svg className="w-4 h-4 text-[#f8d35c]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
