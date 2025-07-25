import { useState, useEffect } from "react";
import { 
  Brain, 
  Eye, 
  Headphones, 
  Hand,
  Zap,
  Users,
  TrendingUp,
  ArrowRight,
  Play,
  Sparkles,
  Target,
  BarChart3,
  Settings
} from "lucide-react";
import vikaLogo from '../../assets/logo-vika.svg';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}
const varkModes = [

  {
    id: 'visual',
    name: 'Visual',
    description: 'Interactive diagrams, charts, and visual learning through generative canvas',
    icon: Eye,
    color: 'visual',
    example: 'Watch concepts come to life with AI-generated diagrams and visual representations'
  },
  {
    id: 'auditory', 
    name: 'Auditory',
    description: 'Conversational learning with AI voice agents and speech interaction',
    icon: Headphones,
    color: 'auditory',
    example: 'Engage in natural conversations with your AI tutor using voice interaction'
  },
  {

    id: 'kinesthetic',
    name: 'Kinesthetic',
    description: 'Hands-on interactive exercises with drag-and-drop activities',
    icon: Hand,
    color: 'kinesthetic',
    example: 'Learn by doing with interactive simulations and hands-on exercises'

  }
];

const adhdFeatures = [
  {
    name: 'Bionic Reading',
    description: 'Enhanced text formatting that guides your eyes and improves focus',
    icon: Zap
  },
  {
    name: 'Content Chunking',
    description: 'Breaking down complex information into digestible, manageable pieces',
    icon: BarChart3
  },
  {
    name: 'Customizable Interface',
    description: 'Adjust fonts, spacing, and visual elements to match your needs',
    icon: Settings
  }
];

const stats = [
  { label: 'Learning Modes', value: '3', description: 'Adaptive VAK modes' },
  { label: 'Accessibility', value: 'ADHD+', description: 'Neurodiverse support' },
  { label: 'Personalized', value: '∞', description: 'Unique to you' }
];

export default function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe all elements with scroll animation classes
    const animatedElements = document.querySelectorAll(
      '.scroll-fade-up, .scroll-fade-left, .scroll-fade-right, .scroll-scale-in, .scroll-count-up'
    );
    
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 50) {
        // Always show navbar at the top
        setIsNavbarVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down - hide navbar
        setIsNavbarVisible(false);
      } else {
        // Scrolling up - show navbar
        setIsNavbarVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };


    window.addEventListener('scroll', controlNavbar);
    
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 overflow-x-hidden w-full max-w-full">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm transition-transform duration-300 ${
        isNavbarVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={vikaLogo} alt="Vika Logo" className="w-8 h-8 rounded-md" />
            <div className="text-2xl font-bold text-blue-600">VIKA</div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => smoothScrollTo('about')}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
            >
              About
            </button>
            <button 
              onClick={() => smoothScrollTo('features')}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
            >
              Features
            </button>
            <button 
              onClick={onGetStarted}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="about" className="relative py-20 px-4 pt-32 overflow-hidden">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="animate-fade-in">
            <div className="inline-flex items-center mb-6 px-4 py-2 border border-blue-300 dark:border-blue-500 rounded-full text-sm text-blue-700 dark:text-blue-300 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors fade-scale-in">
              <Sparkles className="mr-2 h-3 w-3" />
              Adaptive Learning for Every Mind
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 dark:from-blue-300 dark:via-blue-400 dark:to-blue-200 bg-clip-text text-transparent">
                Learn Your Way with
              </span>
              <br />
              <span className="relative blur-to-text bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 dark:from-blue-300 dark:via-blue-400 dark:to-blue-200 bg-clip-text text-transparent overflow-hidden">
                VIKA
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 opacity-20 blur-lg -z-10"></div>
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              The first adaptive learning platform designed for VARK learning styles and neurodiverse minds. 
              Experience personalized education that adapts to how you learn best.
            </p>
            
            <div className="flex justify-center mb-12">
              <button 
                onClick={onGetStarted}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg group transition-colors"
              >
                Start Learning
                <ArrowRight className="ml-2 h-4 w-4 inline group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 justify-center max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center scroll-count-up" style={{ transitionDelay: `${index * 0.2}s` }}>
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VARK Modes Section */}
      <section id="features" className="py-20 px-4 bg-white/50 dark:bg-gray-900/50 overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4 scroll-fade-up">
              Three Ways to Learn, One Platform
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto scroll-fade-up">
              Our AI adapts to your preferred learning style and suggests the most effective mode based on your progress and understanding.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 justify-center max-w-4xl mx-auto">
            {varkModes.map((mode, index) => (
              <div
                key={mode.id}
                className="border-2 rounded-lg bg-white dark:bg-gray-800 p-6 scroll-fade-up border-gray-200 dark:border-gray-700"
                style={{
                  transitionDelay: `${index * 0.1}s`
                }}
              >
                <div className="text-center">
                  <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    mode.color === 'visual' ? 'bg-green-100' :
                    mode.color === 'auditory' ? 'bg-blue-100' :
                    'bg-orange-100'
                  }`}>
                    <mode.icon className={`h-8 w-8 ${
                      mode.color === 'visual' ? 'text-green-600' :
                      mode.color === 'auditory' ? 'text-blue-600' :
                      'text-orange-600'
                    }`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {mode.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {mode.description}
                  </p>
                  
                  {/* Static expanded content */}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                      {mode.example}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ADHD Support Section */}
      <section className="py-20 px-4 overflow-hidden">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center mb-4 px-4 py-2 bg-gradient-to-r from-green-500 to-purple-500 text-white rounded-full text-sm scroll-scale-in">
              <Brain className="mr-2 h-3 w-3" />
              Neurodiverse Support
            </div>
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4 scroll-fade-up">
              Built for Every Mind
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 scroll-fade-up">
              Special features designed to support learners with ADHD and other neurodivergent needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {adhdFeatures.map((feature, index) => (
              <div
                key={index}
                className={`text-center group ${
                  index % 2 === 0 ? 'scroll-fade-left' : 'scroll-fade-right'
                }`}
                style={{ transitionDelay: `${index * 0.2}s` }}
              >
                <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  {feature.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Adaptive Learning Engine */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6 scroll-fade-up">
            Powered by Adaptive AI
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed scroll-fade-up">
            Our intelligent learning engine tracks your progress across all modes, identifies what works best for you, 
            and automatically suggests the most effective learning approach.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mt-12 justify-center max-w-2xl mx-auto">
            <div className="text-center scroll-fade-left">
              <Target className="h-12 w-12 mx-auto mb-4 text-blue-200" />
              <h3 className="text-lg font-semibold mb-2">Smart Detection</h3>
              <p className="text-blue-200 text-sm">Recognizes when you're struggling and suggests alternative approaches</p>
            </div>
            <div className="text-center scroll-fade-right">
              <Users className="h-12 w-12 mx-auto mb-4 text-blue-200" />
              <h3 className="text-lg font-semibold mb-2">Personalized</h3>
              <p className="text-blue-200 text-sm">Adapts to your unique learning patterns and preferences</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950 overflow-hidden">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-6 scroll-fade-up">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 scroll-fade-up">
            Join thousands of learners who have discovered their optimal learning style with VIKA.
          </p>
          <button 
            onClick={onGetStarted}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg group transition-all scroll-scale-in"
          >
            Start Your Learning Journey
            <ArrowRight className="ml-2 h-4 w-4 inline group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between scroll-fade-up">
            <div className="flex items-center gap-3">
              <img src={vikaLogo} alt="Vika Logo" className="w-8 h-8 rounded-md" />
              <div className="text-2xl font-bold text-blue-600">VIKA</div>
            </div>
            <div className="flex items-center gap-6 mt-6 md:mt-0 text-sm text-gray-600 dark:text-gray-400">
              <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">Support</a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500 scroll-fade-up">
            © 2024 VIKA. Empowering every learner to reach their potential.
          </div>
        </div>
      </footer>
    </div>
  );
}