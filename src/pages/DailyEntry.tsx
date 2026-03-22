import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mail, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

const STEPS_EN = [
  {
    title: 'What does today feel like?',
    options: [
      'Leaving a certain life',
      'Missing a version of myself I didn\'t become',
      'Approaching a new beginning',
      'Stuck in place',
      'Wanting to disappear for a while',
      'Wanting to live at a different pace'
    ]
  },
  {
    title: 'That life feels more about...',
    options: [
      'A place',
      'An unmade decision',
      'A lifestyle',
      'Someone I didn\'t become',
      'A relationship that never started'
    ]
  },
  {
    title: 'If it left something behind, it would be more like...',
    options: [
      'A train ticket',
      'A receipt',
      'A hotel keycard',
      'A postcard',
      'A polaroid',
      'A piece of paper with writing',
      'A matchbox',
      'A folded map'
    ]
  }
];

const STEPS_ZH = [
  {
    title: '你今天更像是在……',
    options: [
      '离开某种生活',
      '想念某个没活成的自己',
      '靠近一种新的开始',
      '被困在原地',
      '想暂时消失一会儿',
      '想换一种节奏生活'
    ]
  },
  {
    title: '那段人生更像关于……',
    options: [
      '一个地方',
      '一个没做出的决定',
      '一种生活方式',
      '一个没成为的人',
      '一段没有开始的关系'
    ]
  },
  {
    title: '如果它留下一件东西，它更像……',
    options: [
      '一张车票',
      '一张小票',
      '一枚房卡',
      '一张明信片',
      '一张拍立得',
      '一张写了字的纸片',
      '一个火柴盒',
      '一张折过的地图'
    ]
  }
];

export function DailyEntry() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [reflection, setReflection] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);

  const steps = language === 'en' ? STEPS_EN : STEPS_ZH;
  const isLastStep = currentStep === steps.length;

  const handleOptionSelect = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = option;
    setAnswers(newAnswers);
    
    // Auto-advance to next step after a short delay
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 400);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answers.length < steps.length) return;

    setIsGenerating(true);
    try {
      // Combine answers into a mood context string
      const moodContext = answers.join(' | ');
      
      navigate('/reveal', { 
        state: { 
          mood: moodContext, 
          reflection,
          language
        } 
      });
    } catch (error) {
      console.error(error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-4xl mx-auto w-full">
      <div className="w-full space-y-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-6 relative"
        >
          {currentStep > 0 && (
            <button 
              onClick={handleBack}
              className="absolute left-0 top-0 text-[var(--color-museum-muted)] hover:text-[var(--color-museum-accent)] transition-colors p-2"
              title={language === 'en' ? 'Go back' : '返回'}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          
          <p className="font-mono text-[9px] tracking-[0.4em] uppercase text-[var(--color-museum-accent)]/80 mb-6">
            {language === 'en' ? `Intake Ritual - Step ${currentStep + 1} of ${steps.length + 1}` : `采集仪式 - 第 ${currentStep + 1} 步，共 ${steps.length + 1} 步`}
          </p>
          
          <AnimatePresence mode="wait">
            <motion.h1 
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="font-serif text-3xl md:text-4xl lg:text-5xl font-light tracking-wide text-[var(--color-museum-text)] min-h-[80px] flex items-center justify-center"
            >
              {isLastStep 
                ? (language === 'en' ? 'What kind of life have you been lingering outside of?' : '你一直徘徊在怎样的人生门外？')
                : steps[currentStep].title}
            </motion.h1>
          </AnimatePresence>
          
          <div className="h-px w-12 bg-[var(--color-museum-accent)]/30 mx-auto" />
          
          <AnimatePresence mode="wait">
            <motion.p 
              key={currentStep}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[var(--color-museum-muted)] font-serif italic text-lg md:text-xl"
            >
              {isLastStep 
                ? (language === 'en' ? 'If you wish, you can leave your unspoken words in this unsent letter.' : '若你愿意，可以把未说完的话留在这封未寄出的信里。')
                : (language === 'en' ? 'Select the resonance that guides you.' : '选择指引你的共鸣。')}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-16">
          <div className="min-h-[300px] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {!isLastStep ? (
                <motion.div 
                  key={`step-${currentStep}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col gap-4 w-full max-w-xl mx-auto"
                >
                  {steps[currentStep].options.map((option, index) => (
                    <motion.button
                      key={option}
                      type="button"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      onClick={() => handleOptionSelect(option)}
                      className={`px-8 py-5 rounded-sm text-sm md:text-base font-serif tracking-wide transition-all duration-500 border text-left ${
                        answers[currentStep] === option 
                          ? 'bg-[var(--color-museum-accent)]/10 text-[var(--color-museum-accent)] border-[var(--color-museum-accent)] shadow-[0_0_30px_rgba(197,168,122,0.1)]' 
                          : 'bg-transparent text-[var(--color-museum-muted)] border-[var(--color-museum-btn-border)] hover:border-[var(--color-museum-accent)]/40 hover:text-[var(--color-museum-text)] hover:bg-[var(--color-museum-btn-hover)]'
                      }`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="step-envelope"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="exhibit-stand max-w-2xl mx-auto w-full relative glass-display"
                >
                  {/* Spotlight illumination effect */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 3, delay: 0.5 }}
                    className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-museum-accent)/0.05_0%,transparent_70%)] pointer-events-none -z-10 breathing-light"
                  />

                  <div className="text-center flex flex-col items-center gap-1 mb-8">
                    <span className="curator-label">
                      {language === 'en' ? 'Accession' : '馆藏编号'}
                    </span>
                    <span className="accession-number">
                      2026.042.NEW
                    </span>
                  </div>

                  <div className="envelope-container">
                    <AnimatePresence mode="wait">
                      {!isEnvelopeOpen ? (
                        <motion.div
                          key="closed"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -20 }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                          className="envelope-body cursor-pointer group"
                          onClick={() => setIsEnvelopeOpen(true)}
                        >
                          <div className="envelope-crease" />
                          <div className="flex flex-col items-center justify-center space-y-6 py-4">
                            <Mail className="w-8 h-8 text-[#4a3b32]/30" />
                            <h2 className="font-serif text-2xl md:text-3xl text-[#4a3b32]/70 italic">
                              {language === 'en' ? 'A note never sent' : '未寄出的信'}
                            </h2>
                            
                            <div className="absolute bottom-6 right-8 flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-[#4a3b32]/40 group-hover:text-[#4a3b32]/60 transition-colors">
                              <span>{language === 'en' ? 'Open Exhibit' : '打开展品'}</span>
                              <ChevronRight className="w-3 h-3" />
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="open"
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                          className="envelope-body !p-0"
                        >
                          <div className="p-8 md:p-12 space-y-6">
                            <label htmlFor="reflection" className="block text-center font-serif text-[#4a3b32]/60 italic text-lg md:text-xl">
                              {language === 'en' 
                                ? 'Unfold your thoughts...' 
                                : '展开你的思绪...'}
                            </label>
                            <textarea
                              id="reflection"
                              autoFocus
                              value={reflection}
                              onChange={(e) => setReflection(e.target.value)}
                              placeholder={language === 'en' ? 'Write a short reflection...' : '写下一段简短的感悟...'}
                              className="w-full bg-transparent border-none p-0 text-lg md:text-xl font-serif text-[#4a3b32]/80 placeholder:text-[#4a3b32]/20 focus:outline-none focus:ring-0 transition-all resize-none h-48 leading-relaxed"
                            />
                            
                            <div className="flex justify-end pt-4">
                              <button
                                type="button"
                                onClick={() => setIsEnvelopeOpen(false)}
                                className="text-[9px] tracking-[0.2em] uppercase text-[#4a3b32]/40 hover:text-[#4a3b32]/60 transition-colors"
                              >
                                {language === 'en' ? 'Fold Note' : '折叠信件'}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {isLastStep && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center pt-8"
              >
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="museum-button px-12 py-5 bg-transparent text-[var(--color-museum-text)] disabled:opacity-20 disabled:hover:scale-100 hover:shadow-[0_0_40px_rgba(197,168,122,0.1)] border-[var(--color-museum-accent)]/30"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="relative z-10">{language === 'en' ? 'Accessing Archives...' : '正在访问档案库...'}</span>
                    </div>
                  ) : (
                    <span className="relative z-10">{language === 'en' ? 'Retrieve Exhibit' : '提取展品'}</span>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}
