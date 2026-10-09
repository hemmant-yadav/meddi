import React from 'react'
import { Link } from 'react-router-dom'
import { Activity, ShieldAlert, Heart } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer
      className="border-t border-white/10 bg-black/80 text-hero-sub text-xs py-14 relative z-10"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Taglines */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Activity className="size-4" aria-hidden="true" />
              </div>
              <span className="font-headline font-bold text-xl text-white tracking-tight">
                Meddibuddy
              </span>
            </Link>

            <p className="text-sm text-hero-sub/90 font-medium">
              Scan. Understand. Act.
            </p>
            <p className="text-xs text-hero-sub/70 max-w-sm leading-relaxed">
              Making medical information easier for everyone. We translate complex clinical laboratory jargon into plain, culturally inclusive patient explanations.
            </p>

            <div className="flex items-center gap-1.5 text-[11px] text-hero-sub/50 pt-2">
              <span>Crafted for patient empowerment with</span>
              <Heart className="size-3 text-rose-500 fill-rose-500" />
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <span className="font-semibold text-white tracking-wider uppercase text-[11px] block font-mono">
              Product
            </span>
            <ul className="space-y-2">
              <li>
                <a href="#scan-section" className="hover:text-white transition-colors">
                  Optical Scanning
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#languages" className="hover:text-white transition-colors">
                  Regional Languages
                </a>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Interactive Dashboard Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Governance */}
          <div className="space-y-3">
            <span className="font-semibold text-white tracking-wider uppercase text-[11px] block font-mono">
              Trust & Legal
            </span>
            <ul className="space-y-2">
              <li>
                <a href="#privacy-section" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#ethics" className="hover:text-white transition-colors">
                  AI Safety Protocol
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-white transition-colors">
                  Security Overview
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory & Safety Box */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
          <ShieldAlert className="size-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-[11px] text-hero-sub/80 leading-relaxed">
            <strong>Mandatory Medical Notice:</strong> Meddibuddy is strictly an educational tool and is{' '}
            <span className="text-amber-300 font-semibold underline decoration-amber-400/50">
              not medically certified or clinically validated
            </span>
            . It does not formulate clinical diagnoses, prescribe treatments, or suggest modifying medicinal doses. Always seek direct counsel from your qualified physician.
          </p>
        </div>

        {/* Bottom row */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-hero-sub/50">
          <p>© {new Date().getFullYear()} Meddibuddy. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#privacy-section" className="hover:text-white transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
