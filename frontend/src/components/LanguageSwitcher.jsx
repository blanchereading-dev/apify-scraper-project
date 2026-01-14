import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    setCurrentLang(lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-slate-600 hover:text-[#1B3B5A]"
          data-testid="language-switcher"
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{currentLang === 'en' ? 'EN' : 'ES'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => changeLanguage('en')}
          className={currentLang === 'en' ? 'bg-slate-100' : ''}
          data-testid="lang-en"
        >
          {t('language.en')}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage('es')}
          className={currentLang === 'es' ? 'bg-slate-100' : ''}
          data-testid="lang-es"
        >
          {t('language.es')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
