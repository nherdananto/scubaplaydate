import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from '@phosphor-icons/react';

const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-sm border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
      data-testid="language-switcher"
      title={language === 'en' ? 'Switch to Bahasa Indonesia' : 'Switch to English'}
    >
      <Globe size={18} weight="bold" className="text-[#0284C7]" />
      <span className="text-sm font-medium text-[#475569]">
        {language === 'en' ? 'EN' : 'ID'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;