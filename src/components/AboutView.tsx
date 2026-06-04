import { TechStackWall } from './TechStackWall';
import { GithubCalendar } from './GithubCalendar';
import { BloggerProfile } from '../types';
import { MapPin, Mail, Github, ChevronLeft, Sparkles, Terminal, Code } from 'lucide-react';

interface AboutViewProps {
  profile: BloggerProfile;
  onBack: () => void;
}

export function AboutView({ profile, onBack }: AboutViewProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">

      {/* Dynamic Navigation/Back Row */}
      <div className="flex items-center justify-between select-none">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:text-emerald-600 hover:border-emerald-200/80 bg-white shadow-sm font-sans text-xs font-semibold cursor-pointer transition-all duration-300 hover:-translate-x-0.5"
        >
          <ChevronLeft size={14} className="stroke-[2.5]" />
          返回文章 Feed
        </button>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
          <Terminal size={12} className="text-emerald-500 animate-pulse" />
          <span>about://user_profile</span>
        </div>
      </div>

      {/* Main Profile Accent Header Banner */}
      <div className="relative overflow-hidden bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start group">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none select-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none select-none"></div>

        {/* Avatar Area */}
        <div className="relative shrink-0 select-none">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-emerald-500/10 border border-zinc-100 shadow-sm relative z-15 duration-500 group-hover:scale-[1.03]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white w-7 h-7 rounded-xl flex items-center justify-center border-2 border-white shadow-md z-20">
            <Sparkles size={12} className="animate-spin-slow text-white" />
          </div>
        </div>

        {/* Short info layout */}
        <div className="flex-1 text-center md:text-left space-y-3 relative z-10">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight flex items-center justify-center md:justify-start gap-2 select-none">
              {profile.name}
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">
                Blogger
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-600 font-semibold tracking-wide">
              {profile.title}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-xl">
            {profile.bio}
          </p>

          {/* Social connections footer inline */}
          <div className="pt-3 border-t border-zinc-100 flex flex-wrap justify-center md:justify-start gap-4 select-none text-xs font-mono text-zinc-500">
            <div className="flex items-center gap-1.5 hover:text-zinc-800 transition-colors">
              <MapPin size={13} className="text-emerald-500" />
              <span>中国 · 广东</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-zinc-800 transition-colors">
              <Mail size={13} className="text-emerald-500" />
              <a href="mailto:greeglue89@gmail.com">greeglue89@gmail.com</a>
            </div>
            <div className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors group">
              <Github size={13} className="text-emerald-500 group-hover:scale-105" />
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium"
              >
                {profile.githubUrl.replace('https://', '')}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Indicator Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 pl-1.5">
          <Code size={15} className="text-emerald-500" />
          <h2 className="text-sm font-semibold tracking-wide uppercase text-zinc-400 font-mono">My Professional Stack</h2>
        </div>
        <TechStackWall techStack={profile.techStack} />
      </div>

      {/* Github activity contribution calendar section */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 pl-1.5">
          <Github size={15} className="text-emerald-500" />
          <h2 className="text-sm font-semibold tracking-wide uppercase text-zinc-400 font-mono">GitHub Open Source Contribution</h2>
        </div>
        <GithubCalendar />
      </div>

    </div>
  );
}
