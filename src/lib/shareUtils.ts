import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface ShareTextOptions {
  strategy?: any;
  type?: string;
  period?: string;
  customTitle?: string;
  isFinancial?: boolean;
  language?: string;
}

const translations = {
  en: {
    shareTitle: 'My Business Strategy',
    copiedToast: 'Strategy copied to clipboard!',
    shareFailedToast: 'Share failed. Please try copying the text instead.',
    copyFailedToast: 'Failed to copy text',
    copyFailedDescription: 'Please try again or copy manually'
  },
  sw: {
    shareTitle: 'Mkakati Wangu wa Biashara',
    copiedToast: 'Mkakati umenakiliwa kwenye ubao wa kunakili!',
    shareFailedToast: 'Kushiriki kumeshindikana. Tafadhali jaribu kunakili maandishi badala yake.',
    copyFailedToast: 'Imeshindwa kunakili maandishi',
    copyFailedDescription: 'Tafadhali jaribu tena au nakili kwa mikono'
  },
  ar: {
    shareTitle: 'استراتيجية عملي',
    copiedToast: 'تم نسخ الاستراتيجية إلى الحافظة!',
    shareFailedToast: 'فشل في المشاركة. يرجى المحاولة بنسخ النص بدلاً من ذلك.',
    copyFailedToast: 'فشل في نسخ النص',
    copyFailedDescription: 'يرجى المحاولة مرة أخرى أو النسخ يدوياً'
  },
  fr: {
    shareTitle: 'Ma Stratégie d\'Entreprise',
    copiedToast: 'Stratégie copiée dans le presse-papiers!',
    shareFailedToast: 'Le partage a échoué. Veuillez essayer de copier le texte à la place.',
    copyFailedToast: 'Échec de la copie du texte',
    copyFailedDescription: 'Veuillez réessayer ou copier manuellement'
  }
};

export const generateShareText = ({ strategy, type, period, customTitle, isFinancial = false, language = 'en' }: ShareTextOptions) => {
  const t = translations[language] || translations.en;

  if (isFinancial) {
    return `${customTitle || t.shareTitle}

📊 Financial Summary (${strategy?.timePeriod || period || 'Current Period'})

💰 Total Revenue: ${strategy?.currency || strategy?.currencySymbol || 'KSh'} ${strategy?.totalRevenue?.toFixed(2) || strategy?.totalIncome?.toFixed(2) || '0.00'}

💸 Total Expenses: ${strategy?.currency || strategy?.currencySymbol || 'KSh'} ${strategy?.totalExpenses?.toFixed(2) || '0.00'}

📈 Net Profit: ${strategy?.currency || strategy?.currencySymbol || 'KSh'} ${strategy?.netProfit?.toFixed(2) || ((strategy?.totalRevenue || strategy?.totalIncome || 0) - (strategy?.totalExpenses || 0)).toFixed(2)}

📋 Revenue Entries: ${strategy?.revenueEntries?.length || strategy?.transactions?.filter(t => t.type === 'income')?.length || 0}
📋 Expense Entries: ${strategy?.expenseEntries?.length || strategy?.transactions?.filter(t => t.type === 'expense')?.length || 0}

Profit Margin: ${(strategy?.totalRevenue || strategy?.totalIncome) > 0 ? (((strategy?.netProfit || ((strategy?.totalRevenue || strategy?.totalIncome || 0) - (strategy?.totalExpenses || 0))) / (strategy?.totalRevenue || strategy?.totalIncome)) * 100).toFixed(1) : 0}%

Created with Jenga Biz Africa ✨`;
  }

  if (type === 'summary' || type === 'full') {
    return `${customTitle || t.shareTitle}

📈 ${strategy?.businessName || strategy?.business_name || strategy?.name || 'My Business'}

🎯 Vision: ${strategy?.vision || 'Not specified'}

🚀 Mission: ${strategy?.mission || 'Not specified'}

👥 Target Market: ${strategy?.targetMarket || strategy?.target_market || 'Not specified'}

💰 Revenue Model: ${strategy?.revenueModel || strategy?.revenue_model || 'Not specified'}

⭐ Value Proposition: ${strategy?.valueProposition || strategy?.value_proposition || 'Not specified'}

🤝 Key Partners: ${strategy?.keyPartners || strategy?.key_partners || 'Not specified'}

📢 Marketing: ${strategy?.marketingApproach || strategy?.marketing_approach || 'Not specified'}

⚙️ Operations: ${strategy?.operationalNeeds || strategy?.operational_needs || 'Not specified'}

📊 Growth Goals: ${strategy?.growthGoals || strategy?.growth_goals || 'Not specified'}

Created with Jenga Biz Africa ✨`;
  }
  
  return `${customTitle || t.shareTitle}

📈 ${strategy?.businessName || strategy?.business_name || strategy?.name || 'My Business'}

🎯 Vision: ${strategy?.vision || 'Not specified'}

🚀 Mission: ${strategy?.mission || 'Not specified'}

👥 Target Market: ${strategy?.targetMarket || strategy?.target_market || 'Not specified'}

💰 Revenue Model: ${strategy?.revenueModel || strategy?.revenue_model || 'Not specified'}

⭐ Value Proposition: ${strategy?.valueProposition || strategy?.value_proposition || 'Not specified'}

🤝 Key Partners: ${strategy?.keyPartners || strategy?.key_partners || 'Not specified'}

📢 Marketing: ${strategy?.marketingApproach || strategy?.marketing_approach || 'Not specified'}

⚙️ Operations: ${strategy?.operationalNeeds || strategy?.operational_needs || 'Not specified'}

📊 Growth Goals: ${strategy?.growthGoals || strategy?.growth_goals || 'Not specified'}

Created with Jenga Biz Africa ✨`;
};

export const useShareActions = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleWhatsAppShare = (text: string, language = 'en') => {
    try {
      const t = translations[language] || translations.en;
      const encodedText = encodeURIComponent(text);
      
      if (isMobile) {
        // Mobile deep link to WhatsApp app
        window.location.href = `whatsapp://send?text=${encodedText}`;
      } else {
        // Desktop web WhatsApp
        window.open(`https://web.whatsapp.com/send?text=${encodedText}`, '_blank');
      }
    } catch (error) {
      console.error('WhatsApp share failed:', error);
      toast({
        title: translations[language]?.shareFailedToast || translations.en.shareFailedToast,
        variant: 'destructive'
      });
    }
  };

  const handleEmailShare = (text: string, subject: string) => {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(text);
    const url = `mailto:?subject=${encodedSubject}&body=${encodedBody}`;
    window.open(url, '_blank');
  };

  const handleCopyText = async (text: string, language = 'en') => {
    try {
      const t = translations[language] || translations.en;
      
      if (!navigator.clipboard) {
        // Fallback for browsers without clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      } else {
        await navigator.clipboard.writeText(text);
      }
      
      toast({
        title: t.copiedToast,
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        title: translations[language]?.copyFailedToast || translations.en.copyFailedToast,
        description: translations[language]?.copyFailedDescription || translations.en.copyFailedDescription,
        variant: 'destructive'
      });
    }
  };

  return {
    handleWhatsAppShare,
    handleEmailShare,
    handleCopyText
  };
};