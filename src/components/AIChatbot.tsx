import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Minimize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Course, Topic } from '@/services/studyService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatbotProps {
  courses?: Course[];
  topics?: Topic[];
}

export interface AIChatbotHandle {
  open: () => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/study-chat`;

export const AIChatbot = React.forwardRef<AIChatbotHandle, AIChatbotProps>(
  ({ courses = [], topics = [] }, ref) => {
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const { profile } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  React.useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
  }));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const streamChat = async (userMessage: string) => {
    console.log('streamChat called with message:', userMessage);
    setIsLoading(true);
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    console.log('Messages updated:', newMessages);
    setInput('');

    let assistantContent = '';

    try {
      // Build context about user's courses and topics
      const courseContext = courses.length > 0 
        ? `User is currently studying these courses: ${courses.map(c => `${c.name}${c.code ? ` (${c.code})` : ''}`).join(', ')}`
        : '';
      
      const topicContext = topics.length > 0
        ? `User has ${topics.length} topics: ${topics.map(t => t.name).join(', ')}`
        : '';
      
      const contextMessage = [courseContext, topicContext].filter(Boolean).join('. ');
      console.log('Sending to API with context:', contextMessage);

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages,
          language: i18n.language,
          context: contextMessage,
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Add empty assistant message to update
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
      // Remove the failed assistant message
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) {
      console.log('Submit blocked - input:', input, 'isLoading:', isLoading);
      return;
    }
    console.log('Submitting message:', input.trim());
    streamChat(input.trim());
  };

  const quickPrompts = React.useMemo(() => {
    const courseNames = courses.map(c => c.name).slice(0, 2).join(', ');
    const topicCount = topics.length;
    
    if (i18n.language === 'bn') {
      return [
        courseNames 
          ? `${courseNames} এর জন্য আজ আমার কী রিভিশন করা উচিত?`
          : 'আজ আমার কী রিভিশন করা উচিত?',
        'আমার পড়াশোনার সময়সূচী তৈরি করো',
        topicCount > 0 
          ? `আমার ${topicCount}টি টপিক আছে, কীভাবে শিখব?`
          : 'পরীক্ষার প্রস্তুতির টিপস দাও',
      ];
    } else {
      return [
        courseNames
          ? `What should I revise today in ${courseNames}?`
          : 'What should I revise today?',
        'Create a study schedule for me',
        topicCount > 0
          ? `I have ${topicCount} topics to cover, how should I learn?`
          : 'Give me exam preparation tips',
      ];
    }
  }, [courses, topics, i18n.language]);

  return (
    <>
      {/* Floating Chat Button (for when chat is closed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              console.log('Floating chat button clicked - opening chatbot');
              setIsOpen(true);
            }}
            className="fixed bottom-8 right-8 lg:bottom-24 lg:right-24 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 hover:shadow-2xl hover:shadow-purple-500/50 shadow-lg flex items-center justify-center text-white z-40 transition-all duration-300"
            title="Open AI Study Assistant"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.85 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? 'auto' : '500px',
            }}
            exit={{ opacity: 0, y: 100, scale: 0.85 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 lg:inset-auto lg:bottom-8 lg:right-8 lg:w-[420px] max-w-[calc(100vw-32px)] h-[calc(100vh-32px)] lg:h-[600px] bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 border border-purple-500/20 rounded-2xl shadow-2xl hover:shadow-purple-500/20 overflow-hidden z-50 flex flex-col transition-all duration-300"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 p-5 lg:p-6 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <div className="text-white">
                  <h3 className="font-semibold">
                    {i18n.language === 'bn' ? 'AI স্টাডি সহায়ক' : 'AI Study Assistant'}
                  </h3>
                  <p className="text-xs text-white/80">
                    {i18n.language === 'bn' ? 'আপনার পড়াশোনার সঙ্গী' : 'Your study companion'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    console.log('Minimize button clicked');
                    setIsMinimized(!isMinimized);
                  }}
                  className="text-white hover:bg-white/20"
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    console.log('Close button clicked');
                    setIsOpen(false);
                  }}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <>
                <ScrollArea className="flex-1 p-5 lg:p-6 bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden" ref={scrollRef}>
                  {messages.length === 0 ? (
                    <div className="text-center py-8 px-4 flex flex-col items-center justify-center h-full">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <Sparkles className="w-8 h-8 text-purple-400" />
                      </div>
                      <h4 className="font-bold text-lg mb-3 text-white max-w-xs">
                        {i18n.language === 'bn'
                          ? `হাই ${profile?.full_name || 'স্টুডেন্ট'}! 👋`
                          : `Hi ${profile?.full_name || 'Student'}! 👋`}
                      </h4>
                      <p className="text-sm text-slate-400 mb-8 max-w-xs leading-relaxed">
                        {i18n.language === 'bn'
                          ? 'আমি আপনার পড়াশোনায় সাহায্য করতে এখানে আছি'
                          : "I'm here to help with your studies"}
                      </p>
                      <div className="space-y-3 w-full">
                        {quickPrompts.map((prompt, i) => (
                          <motion.button
                            key={i}
                            initial={{ opacity: 0, y: 15, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: i * 0.1, type: 'spring', damping: 20, stiffness: 300 }}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => {
                              console.log('Quick prompt clicked:', prompt);
                              streamChat(prompt);
                            }}
                            disabled={isLoading}
                            className="w-full text-left p-4 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-800/40 hover:from-purple-500/30 hover:to-pink-500/30 text-slate-200 text-sm transition-all duration-300 border border-slate-700/50 hover:border-purple-500/50 disabled:opacity-50 cursor-pointer hover:shadow-lg hover:text-white active:scale-95"
                          >
                            {prompt}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 flex flex-col">
                      {messages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10, x: msg.role === 'user' ? 20 : -20 }}
                          animate={{ opacity: 1, y: 0, x: 0 }}
                          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                          whileHover={{ scale: 1.01 }}
                          className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              msg.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            {msg.role === 'user' ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                          </div>
                          <div
                            className={`flex-1 p-4 rounded-xl text-sm max-w-xs overflow-auto ${
                              msg.role === 'user'
                                ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'
                                : 'bg-slate-800 text-slate-100 border border-slate-700'
                            }`}
                          >
                            {msg.content ? (
                              msg.role === 'assistant' ? (
                                <MarkdownRenderer content={msg.content} />
                              ) : (
                                msg.content
                              )
                            ) : (
                              <span className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {i18n.language === 'bn' ? 'চিন্তা করছি...' : 'Thinking...'}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-5 lg:p-6 border-t border-slate-700/50 bg-slate-950 flex-shrink-0">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={
                        i18n.language === 'bn' ? 'আপনার প্রশ্ন লিখুন...' : 'Ask me anything...'
                      }
                      disabled={isLoading}
                      className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      disabled={isLoading || !input.trim()}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

AIChatbot.displayName = 'AIChatbot';
