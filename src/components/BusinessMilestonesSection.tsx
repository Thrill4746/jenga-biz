import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Target, Plus, Calendar as CalendarIcon, Trash2, CalendarPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { addToCalendar } from '@/lib/calendar';
import CoachingTip from '@/components/CoachingTip';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useStrategy } from '@/hooks/useStrategy';
import { useLocation } from 'react-router-dom';

interface BusinessMilestonesSectionProps {
  isPro?: boolean;
  strategyData?: any;
  language?: string;
  onMilestonesChange?: (milestones: any[]) => void;
}

const BusinessMilestonesSection = ({ isPro = true, strategyData = null, language = 'en', onMilestonesChange }: BusinessMilestonesSectionProps) => {
  const [businessStage, setBusinessStage] = useState<'ideation' | 'early' | 'growth'>('ideation');
  const [customMilestone, setCustomMilestone] = useState('');
  const { milestones, saveMilestone, deleteMilestone, currentStrategy } = useStrategy();
  const { trackBusinessMilestone, trackJourney } = useAnalytics();
  const { toast } = useToast();
  
  const location = useLocation();
  const getStrategyId = () => {
    const urlId = new URLSearchParams(location.search).get('id');
    return currentStrategy?.id || strategyData?.id || urlId || undefined;
  };

  // Helper function to get stage-specific milestones
  const getStageSpecificMilestones = (stage: string) => {
    const stageMilestones = {
      en: {
        ideation: [
          'Validate business idea with potential customers',
          'Research target market and competition',
          'Create basic business plan',
          'Secure initial funding or savings'
        ],
        early: [
          'Register business name',
          'Open business bank account',
          'Launch minimum viable product/service',
          'Get first 10 customers'
        ],
        growth: [
          'Expand product/service offerings',
          'Hire first employees',
          'Establish partnerships',
          'Scale marketing efforts'
        ]
      },
      sw: {
        ideation: [
          'Thibitisha wazo la biashara na wateja watarajiwa',
          'Fanya utafiti wa soko lengwa na ushindani',
          'Unda mpango wa msingi wa biashara',
          'Pata fedha za awali au akiba'
        ],
        early: [
          'Sajili jina la biashara',
          'Fungua akaunti ya benki ya biashara',
          'Zindua bidhaa/huduma ya kimsingi',
          'Pata wateja 10 wa kwanza'
        ],
        growth: [
          'Panua matoleo ya bidhaa/huduma',
          'Ajiri wafanyakazi wa kwanza',
          'Unda ushirikiano',
          'Ongeza juhudi za masoko'
        ]
      },
      ar: {
        ideation: [
          'التحقق من فكرة العمل مع العملاء المحتملين',
          'بحث السوق المستهدف والمنافسة',
          'إنشاء خطة عمل أساسية',
          'تأمين التمويل الأولي أو المدخرات'
        ],
        early: [
          'تسجيل اسم الشركة',
          'فتح حساب مصرفي تجاري',
          'إطلاق المنتج/الخدمة الأساسية',
          'الحصول على أول 10 عملاء'
        ],
        growth: [
          'توسيع عروض المنتجات/الخدمات',
          'توظيف أول موظفين',
          'إقامة شراكات',
          'توسيع جهود التسويق'
        ]
      },
      fr: {
        ideation: [
          'Valider l\'idée d\'entreprise avec des clients potentiels',
          'Rechercher le marché cible et la concurrence',
          'Créer un plan d\'affaires de base',
          'Sécuriser le financement initial ou les économies'
        ],
        early: [
          'Enregistrer le nom de l\'entreprise',
          'Ouvrir un compte bancaire professionnel',
          'Lancer le produit/service minimal viable',
          'Obtenir les 10 premiers clients'
        ],
        growth: [
          'Élargir les offres de produits/services',
          'Embaucher les premiers employés',
          'Établir des partenariats',
          'Intensifier les efforts marketing'
        ]
      }
    };
    return stageMilestones[language]?.[stage] || stageMilestones.en[stage] || [];
  };

  useEffect(() => {
    trackJourney('/milestones', 'page_view', { 
      businessStage: businessStage,
      totalMilestones: milestones.length 
    });
  }, [trackJourney, businessStage, milestones.length]);

  // Translation object
  const translations = {
    en: {
      title: 'Business Milestones',
      subtitle: 'Track your business goals and stay focused on progress.',
      businessStage: 'Business Stage',
      ideation: 'Concept Stage',
      early: 'Early Stage',
      growth: 'Growth Stage',
      ideationDesc: 'Still exploring business ideas or validating a concept.',
      earlyDesc: 'Launched and selling, still refining operations or product.',
      growthDesc: 'Established with regular income, focused on expansion.',
      yourMilestones: 'Your Milestones',
      addMilestone: 'Add Milestone',
      enterTitle: 'Enter milestone title',
      pickDate: 'Pick target date',
      selectStatus: 'Select status',
      notStarted: 'Not Started',
      inProgress: 'In Progress',
      complete: 'Complete',
      overdue: 'Overdue',
      tier3Note: 'Enjoy full access to Strategy Grid Pro (Tier 3 features) while testing.',
      coachingTip: 'Break down big goals into smaller, actionable milestones. Each milestone should be specific and have a clear deadline.',
      addToCalendar: 'Add to Calendar',
      suggestedMilestonesFor: 'Suggested Milestones for',
      defaultMilestones: {
        registerBusiness: 'Register business name',
        openBankAccount: 'Open business bank account'
      }
    },
    sw: {
      title: 'Malengo ya Biashara',
      subtitle: 'Fuatilia malengo yako ya biashara na uongozane na maendeleo.',
      businessStage: 'Hatua ya Biashara',
      ideation: 'Hatua ya Dhana',
      early: 'Hatua ya Awali',
      growth: 'Hatua ya Ukuaji',
      ideationDesc: 'Bado ninachunguza mawazo ya biashara au kuthibitisha dhana.',
      earlyDesc: 'Imeanzishwa na kuuza, bado ninaboresha uendeshaji au bidhaa.',
      growthDesc: 'Imesimamishwa na mapato ya kawaida, inalenga upanuzi.',
      yourMilestones: 'Malengo Yako',
      addMilestone: 'Ongeza Lengo',
      enterTitle: 'Ingiza kichwa cha lengo',
      pickDate: 'Chagua tarehe ya lengo',
      selectStatus: 'Chagua hali',
      notStarted: 'Haijuaanza',
      inProgress: 'Inaendelea',
      complete: 'Imekamilika',
      overdue: 'Umechelewa',
      tier3Note: 'Furahia ufikiaji kamili wa Strategy Grid Pro (vipengele vya Daraja la 3) wakati wa upimaji.',
      coachingTip: 'Gawanya malengo makubwa kuwa malengo madogo yanayoweza kutekelezwa. Kila lengo linapaswa kuwa mahususi na kuwa na tarehe ya mwisho ya wazi.',
      addToCalendar: 'Ongeza kwenye Kalenda',
      suggestedMilestonesFor: 'Malengo Yaliyopendekezwa kwa',
      defaultMilestones: {
        registerBusiness: 'Sajili jina la biashara',
        openBankAccount: 'Fungua akaunti ya benki ya biashara'
      }
    },
    ar: {
      title: 'معالم الأعمال',
      subtitle: 'تتبع أهداف عملك وحافظ على التركيز على التقدم.',
      businessStage: 'مرحلة الأعمال',
      ideation: 'مرحلة المفهوم',
      early: 'المرحلة المبكرة',
      growth: 'مرحلة النمو',
      ideationDesc: 'لا تزال تستكشف أفكار تجارية أو تتحقق من مفهوم.',
      earlyDesc: 'تم الإطلاق والبيع، لا تزال تحسن العمليات أو المنتج.',
      growthDesc: 'راسخة مع دخل منتظم، تركز على التوسع.',
      yourMilestones: 'معالمك',
      addMilestone: 'إضافة معلم',
      enterTitle: 'أدخل عنوان المعلم',
      pickDate: 'اختر التاريخ المستهدف',
      selectStatus: 'اختر الحالة',
      notStarted: 'لم تبدأ',
      inProgress: 'قيد التنفيذ',
      complete: 'مكتمل',
      overdue: 'متأخر',
      tier3Note: 'استمتع بالوصول الكامل إلى Strategy Grid Pro (ميزات المستوى 3) أثناء الاختبار.',
      coachingTip: 'قسم الأهداف الكبيرة إلى معالم أصغر قابلة للتنفيذ. يجب أن يكون كل معلم محددًا وله موعد نهائي واضح.',
      addToCalendar: 'إضافة للتقويم',
      suggestedMilestonesFor: 'المعالم المقترحة لـ',
      defaultMilestones: {
        registerBusiness: 'تسجيل اسم الشركة',
        openBankAccount: 'فتح حساب مصرفي تجاري'
      }
    },
    fr: {
      title: 'Jalons d\'Affaires',
      subtitle: 'Suivez vos objectifs commerciaux et restez concentré sur les progrès.',
      businessStage: 'Étape d\'Affaires',
      ideation: 'Étape Conceptuelle',
      early: 'Étape Précoce',
      growth: 'Étape de Croissance',
      ideationDesc: 'Explore encore des idées d\'affaires ou valide un concept.',
      earlyDesc: 'Lancé et vendant, affine encore les opérations ou le produit.',
      growthDesc: 'Établi avec un revenu régulier, axé sur l\'expansion.',
      yourMilestones: 'Vos Jalons',
      addMilestone: 'Ajouter un Jalon',
      enterTitle: 'Entrez le titre du jalon',
      pickDate: 'Choisir la date cible',
      selectStatus: 'Sélectionner le statut',
      notStarted: 'Pas Commencé',
      inProgress: 'En Cours',
      complete: 'Terminé',
      overdue: 'En Retard',
      tier3Note: 'Profitez d\'un accès complet à Strategy Grid Pro (fonctionnalités de niveau 3) pendant les tests.',
      coachingTip: 'Divisez les grands objectifs en jalons plus petits et réalisables. Chaque jalon doit être spécifique et avoir une échéance claire.',
      addToCalendar: 'Ajouter au Calendrier',
      suggestedMilestonesFor: 'Jalons Suggérés pour',
      defaultMilestones: {
        registerBusiness: 'Enregistrer le nom de l\'entreprise',
        openBankAccount: 'Ouvrir un compte bancaire professionnel'
      }
    }
  };

  const t = translations[language] || translations.en;

  const statusOptions = [
    { value: 'not-started', label: t.notStarted, color: 'bg-gray-100 text-gray-700' },
    { value: 'in-progress', label: t.inProgress, color: 'bg-blue-100 text-blue-700' },
    { value: 'complete', label: t.complete, color: 'bg-green-100 text-green-700' },
    { value: 'overdue', label: t.overdue, color: 'bg-red-100 text-red-700' }
  ];

  const businessStages = [
    { value: 'ideation', label: t.ideation, description: t.ideationDesc },
    { value: 'early', label: t.early, description: t.earlyDesc },
    { value: 'growth', label: t.growth, description: t.growthDesc }
  ];

  const getStatusColor = (status: string) => {
    return statusOptions.find(opt => opt.value === status)?.color || 'bg-gray-100 text-gray-700';
  };

  const handleAddMilestone = async () => {
    if (customMilestone.trim()) {
      const strategyId = getStrategyId();
      
      if (!strategyId) {
        toast({
          title: "Error",
          description: "Please save your strategy first before adding milestones.",
          variant: "destructive"
        });
        return;
      }

      const result = await saveMilestone({
        title: customMilestone.trim(),
        status: 'not-started',
        business_stage: businessStage,
        strategy_id: strategyId,
        target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
      });
      
      if (result) {
        setCustomMilestone('');
        trackBusinessMilestone('created', {
          title: customMilestone.trim(),
          category: businessStage,
          businessStage
        });
      }
    }
  };

  const handleAddSuggestedMilestone = async (milestoneTitle: string) => {
    const strategyId = getStrategyId();
      
    if (!strategyId) {
      toast({
        title: "Error",
        description: "Please save your strategy first before adding milestones.",
        variant: "destructive"
      });
      return;
    }

    const result = await saveMilestone({
      title: milestoneTitle,
      status: 'not-started',
      business_stage: businessStage,
      strategy_id: strategyId,
      target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
    });
    
    if (result) {
      trackBusinessMilestone('created', {
        title: milestoneTitle,
        category: businessStage,
        businessStage
      });
    }
  };

  const handleUpdateMilestoneStatus = async (milestoneId: string, newStatus: string) => {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (!milestone) return;

    const strategyId = getStrategyId();
    
    const result = await saveMilestone({
      id: milestoneId,
      title: milestone.title,
      status: newStatus,
      business_stage: milestone.business_stage,
      strategy_id: strategyId,
      target_date: milestone.target_date
    });
    
    if (result && newStatus === 'complete') {
      trackBusinessMilestone('completed', {
        title: milestone.title
      });
    }
  };

  const handleUpdateMilestoneDate = async (milestoneId: string, date: Date | undefined) => {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (!milestone) return;

    const strategyId = getStrategyId();

    const result = await saveMilestone({
      id: milestoneId,
      title: milestone.title,
      target_date: date?.toISOString() || null,
      status: milestone.status,
      business_stage: milestone.business_stage,
      strategy_id: strategyId
    });
    
    if (result) {
      // Use general activity tracking for date updates
      trackJourney('/milestones', 'milestone_date_updated', {
        milestoneId,
        targetDate: date
      });
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    await deleteMilestone(milestoneId);
    
    // Use general activity tracking for deletions
    trackJourney('/milestones', 'milestone_deleted', {
      milestoneId
    });
    
    toast({
      title: "Milestone deleted",
      description: "The milestone has been removed from your list.",
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'complete': return 'default';
      case 'in-progress': return 'secondary';
      case 'overdue': return 'destructive';
      default: return 'outline';
    }
  };

  const suggestedMilestones = getStageSpecificMilestones(businessStage);
  const existingMilestoneTitles = milestones.map(m => m.title.toLowerCase());
  const availableSuggestions = suggestedMilestones.filter(
    suggestion => !existingMilestoneTitles.includes(suggestion.toLowerCase())
  );

  const currentStage = businessStages.find(stage => stage.value === businessStage);

  return (
    <div id="milestones-section" className="space-y-6">
      {/* Section Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {t.title}
        </h2>
        <p className="text-gray-600">
          {t.subtitle}
        </p>
      </div>

      {/* Tier 3 Note */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-800 text-center">
          {t.tier3Note}
        </p>
      </div>

      {/* Coaching Tip */}
      <CoachingTip tip={t.coachingTip} language={language} />

      {/* Business Stage Selector */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">{t.businessStage}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={businessStage} onValueChange={(value: 'ideation' | 'early' | 'growth') => setBusinessStage(value)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {businessStages.map((stage) => (
                <SelectItem key={stage.value} value={stage.value}>
                  <div>
                    <div className="font-medium">{stage.label}</div>
                    <div className="text-sm text-gray-500">{stage.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentStage && (
            <p className="text-sm text-gray-600 mt-2">{currentStage.description}</p>
          )}
        </CardContent>
      </Card>

      {/* Suggested Milestones for Current Stage */}
      {availableSuggestions.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg text-green-800">{t.suggestedMilestonesFor} {currentStage?.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  💡 <strong>{language === 'sw' ? 'Jinsi inavyofanya kazi:' :
                             language === 'ar' ? 'كيف يعمل:' :
                             language === 'fr' ? 'Comment ça marche:' :
                             'How it works:'}</strong> {' '}
                  {language === 'sw' ? 'Chagua lengo kutoka orodha au andika lengo lako binafsi. Lengo litaongezwa moja kwa moja kwenye "Malengo Yako" ambapo unaweza kuweka tarehe na kuongeza kwenye kalenda.' :
                   language === 'ar' ? 'اختر معلمًا من القائمة أو اكتب معلمك المخصص. سيتم إضافة المعلم مباشرة إلى "معالمك" حيث يمكنك تعيين التواريخ وإضافته إلى التقويم.' :
                   language === 'fr' ? 'Choisissez un jalon dans la liste ou écrivez votre jalon personnalisé. Le jalon sera ajouté directement à "Vos Jalons" où vous pourrez définir des dates et l\'ajouter au calendrier.' :
                   'Select a milestone from the list or write your custom milestone. The milestone will be added directly to "Your Milestones" where you can set dates and add to calendar.'}
                </p>
              </div>
              {availableSuggestions.map((milestone, index) => (
                <div key={index} className="flex items-center justify-between bg-white/50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center text-sm text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="flex-1">{milestone}</span>
                  </div>
                  <Button
                    onClick={() => handleAddSuggestedMilestone(milestone)}
                    size="sm"
                    variant="outline"
                    className="ml-3 text-green-600 border-green-300 hover:bg-green-100 px-3 py-1 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {language === 'sw' ? 'Ongeza' :
                     language === 'ar' ? 'إضافة' :
                     language === 'fr' ? 'Ajouter' :
                     'Add'}
                  </Button>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <Input
                value={customMilestone}
                onChange={(e) => setCustomMilestone(e.target.value)}
                placeholder={t.enterTitle}
                className="w-full border-green-300 focus:border-green-400 focus:ring-green-200"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddMilestone();
                  }
                }}
              />
              <Button
                onClick={handleAddMilestone}
                size="sm"
                variant="outline"
                className="text-green-600 border-green-300 hover:bg-green-50 w-full"
              >
                <Plus className="w-4 h-4 mr-1" />
                {t.addMilestone}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestones List */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-orange-600" />
            {t.yourMilestones}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className="relative p-5 border rounded-xl bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex flex-col items-center pt-2">
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 shadow-sm",
                      milestone.status === 'complete' ? "bg-green-500 border-green-500" :
                      milestone.status === 'in-progress' ? "bg-blue-500 border-blue-500" :
                      milestone.status === 'overdue' ? "bg-red-500 border-red-500" :
                      "bg-gray-300 border-gray-300"
                    )} />
                    {index < milestones.length - 1 && (
                      <div className="w-px h-20 bg-gray-200 mt-3" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 mr-4">
                        <Input
                          value={milestone.title}
                          onChange={(e) => saveMilestone({
                            id: milestone.id,
                            title: e.target.value,
                            status: milestone.status,
                            strategy_id: milestone.strategy_id,
                            target_date: milestone.target_date,
                            business_stage: milestone.business_stage
                          })}
                          className="font-medium text-gray-900 bg-transparent border-none p-0 text-base focus:bg-white focus:border focus:border-orange-300 focus:px-3 focus:py-2 focus:rounded-md"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(milestone.status)}>
                          {statusOptions.find(opt => opt.value === milestone.status)?.label}
                        </Badge>
                        <Button
                          onClick={() => handleDeleteMilestone(milestone.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <div className="flex items-center space-x-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-left font-normal border-orange-200 hover:border-orange-300"
                            >
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              {milestone.target_date ? format(new Date(milestone.target_date), "PPP") : t.pickDate}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={milestone.target_date ? new Date(milestone.target_date) : undefined}
                              onSelect={(date) => handleUpdateMilestoneDate(milestone.id, date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <Select
                        value={milestone.status}
                        onValueChange={(value) => handleUpdateMilestoneStatus(milestone.id, value)}
                      >
                        <SelectTrigger className="w-40 border-orange-200 hover:border-orange-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {milestone.target_date && (
                        <Button
                          onClick={() => addToCalendar({
                            title: milestone.title,
                            startDate: new Date(milestone.target_date),
                            description: `Business milestone: ${milestone.title}`
                          })}
                          size="sm"
                          variant="outline"
                          className="text-purple-600 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                        >
                          <CalendarPlus className="w-4 h-4 mr-1" />
                          {t.addToCalendar}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessMilestonesSection;
