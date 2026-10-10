import React from 'react';
import {
  Building2,
  PhoneCall,
  Utensils,
  GraduationCap,
  Sparkles,
  Compass,
  FileText,
  Languages,
} from 'lucide-react';

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
  knowledgeSectionsCount: number;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectPrompt,
  knowledgeSectionsCount,
}) => {
  const suggestions = [
    {
      icon: <PhoneCall className="w-4 h-4 text-blue-500" />,
      tag: 'Hostel Staff',
      title: 'Who is the Chief Warden of KEC Hostels and their phone number?',
      prompt: 'Who is the Chief Warden of KEC Hostels and what is their phone number?',
    },
    {
      icon: <Utensils className="w-4 h-4 text-emerald-500" />,
      tag: 'Fees & Mess',
      title: 'What are the annual hostel fees and food mess rules?',
      prompt: 'What are the annual hostel fees and food facilities at KEC?',
    },
    {
      icon: <Languages className="w-4 h-4 text-amber-500" />,
      tag: 'தமிழ் (Tamil)',
      title: 'ஹாஸ்டல் கட்டணம் மற்றும் உணவு வசதிகள் பற்றி கூறுங்கள்',
      prompt: 'ஹாஸ்டல் கட்டணம் மற்றும் உணவு வசதிகள் பற்றி கூறுங்கள்',
    },
    {
      icon: <Building2 className="w-4 h-4 text-indigo-500" />,
      tag: 'Tanglish',
      title: 'Amaravathi ladies hostel warden contact number enna?',
      prompt: 'Amaravathi ladies hostel warden contact number enna?',
    },
    {
      icon: <GraduationCap className="w-4 h-4 text-purple-500" />,
      tag: 'Hostel Blocks',
      title: 'List all Boys & Girls hostels available in KEC',
      prompt: 'List all boys hostels and girls hostels available in Kongu Engineering College.',
    },
    {
      icon: <Compass className="w-4 h-4 text-rose-500" />,
      tag: 'Live Web Search',
      title: 'What is KEC NAAC accreditation grade and campus address?',
      prompt: 'What is the NAAC accreditation grade of Kongu Engineering College and where is it located?',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center text-center animate-fade-in">
      {/* Official KEC Logo */}
      <div className="w-16 h-16 md:w-20 md:h-20 mb-4 p-2.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 shadow-md flex items-center justify-center shrink-0">
        <img
          src="/kec-logo.png"
          alt="Kongu Engineering College Official Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Icon Badge */}
      <div
        style={{
          backgroundColor: 'var(--bg-subtle)',
          borderColor: 'var(--border-subtle)',
        }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold text-stone-700 dark:text-stone-300 mb-6 shadow-2xs"
      >
        <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span>Kongu Engineering College • Autonomous</span>
      </div>

      {/* Main Title */}
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-tight mb-3">
        Your campus. One conversation.
      </h2>

      {/* Subtitle */}
      <p className="text-sm md:text-base text-stone-600 dark:text-stone-400 max-w-xl mb-6">
        Ask about hostels, wardens, fees, facilities, and departments in the language you are comfortable with:{' '}
        <span className="font-semibold text-stone-900 dark:text-white">English, தமிழ், Tanglish, or Hindi.</span>
      </p>

      {/* Language Quick Pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
          English
        </span>
        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
          தமிழ் (Tamil)
        </span>
        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
          Tanglish
        </span>
        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
          हिंदी (Hindi)
        </span>
      </div>

      {/* Suggested Questions Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.prompt)}
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
            }}
            className="p-3.5 rounded-2xl border hover:border-blue-500/50 dark:hover:border-blue-400/50 hover:shadow-sm transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                style={{ backgroundColor: 'var(--bg-subtle)' }}
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              >
                {item.icon}
              </div>
              <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                {item.tag}
              </span>
            </div>
            <p className="text-xs font-medium text-stone-800 dark:text-stone-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 transition-colors">
              {item.title}
            </p>
          </button>
        ))}
      </div>

      {/* Knowledge File Hot-Reload Notice */}
      <div
        style={{
          backgroundColor: 'var(--bg-subtle)',
          borderColor: 'var(--border-subtle)',
        }}
        className="w-full max-w-xl p-3 rounded-xl border flex items-center justify-between text-xs text-stone-600 dark:text-stone-400"
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <span>
            Source: <code className="font-semibold text-stone-800 dark:text-stone-200">college-info.txt</code>
          </span>
        </div>
        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
          Hot-reloads on save
        </span>
      </div>
    </div>
  );
};
