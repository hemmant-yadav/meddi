import React from 'react'
import { HelpCircle, HeartHandshake } from 'lucide-react'

export const FaqPage: React.FC = () => {
  const faqs = [
    {
      q: 'Can Meddibuddy tell me what disease or condition I have?',
      a: 'No. Meddibuddy is strictly an educational tool. We clarify laboratory terms, reference intervals, and scientific definitions so that you understand what each line on your test report means. Only licensed doctors can evaluate symptoms, clinical history, and diagnose conditions.',
    },
    {
      q: 'Should I change my medications based on high or low readings?',
      a: 'Under no circumstances should you ever adjust medication dosages, start new drugs, or stop current prescriptions based on AI explanations. Always contact your prescribing physician or pharmacist.',
    },
    {
      q: 'How does Document AI extract data from my laboratory PDF?',
      a: 'Google Document AI analyzes optical character layouts and tabular laboratory structures to reliably parse metric names, values, units, and clinical reference intervals.',
    },
    {
      q: 'How are my personal medical documents protected?',
      a: 'Documents are protected with Firebase Security Rules and encryption protocols. We do not sell or monetize personal healthcare information.',
    },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-headline text-slate-900 tracking-tight">
          Educational Guide & Health FAQs
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Understanding our mission to make healthcare communication clear, safe, and empowering.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <HelpCircle className="size-4 text-sky-600 shrink-0" aria-hidden="true" />
              {item.q}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed pl-6">
              {item.a}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-6 flex items-start gap-4">
        <HeartHandshake className="size-8 text-sky-600 shrink-0 mt-1" aria-hidden="true" />
        <div>
          <h3 className="text-base font-semibold text-sky-950">Patient-Physician Partnership</h3>
          <p className="text-xs text-sky-800 leading-relaxed mt-1">
            Our goal is to prepare patients to be active, informed participants in their healthcare journeys.
            Bring your Meddibuddy Doctor Discussion Points directly to your next clinic visit!
          </p>
        </div>
      </div>
    </div>
  )
}
