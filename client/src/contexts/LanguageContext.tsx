import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations = {
  en: {
    // Header
    "nav.home": "Home",
    "nav.courses": "Courses",
    "nav.specialNeeds": "Special Needs",
    "nav.tinyExplorers": "Tiny Explorers",
    "nav.mentalHealth": "Mental Health",
    "nav.aimVerse": "AIMVerse",
    "nav.gallery": "Gallery",
    "nav.about": "About",
    "nav.login": "Log In",
    "nav.signup": "Sign Up",
    "nav.bookAppointment": "Book Appointment",

    // Auth
    "auth.title.login": "Welcome Back",
    "auth.subtitle.login": "Log in to continue your infinity journey.",
    "auth.title.signup": "Join AIM Centre 360",
    "auth.subtitle.signup": "Start your holistic learning adventure today.",
    "auth.label.email": "Email Address",
    "auth.label.password": "Password",
    "auth.label.fullName": "Full Name",
    "auth.label.childUid": "Child UID",
    "auth.label.student": "Student",
    "auth.label.parent": "Parent",
    "auth.btn.login": "Log In",
    "auth.btn.signup": "Create Account",
    "auth.switch.login": "Already have an account? Log In",
    "auth.switch.signup": "Don't have an account? Sign Up",
    "auth.branding.title": "Achieve Infinity",
    "auth.branding.subtitle": "Holistic Excellence for Every Mind",

    // Hero
    "hero.est": "E S T .   2 0 2 6",
    "hero.title1": "AIM",
    "hero.title2": "CENTRE",
    "hero.title3": "360",
    "hero.subtitle": "Aim High, Achieve Infinity!",
    "hero.cta": "ENROLL NOW",
    "hero.scroll": "Scroll to Discover",

    // Mission Statement
    "mission.text": "Knowledge for anybody, anywhere, anytime.",

    // Learning Hours
    "learning.title": "Learning Hours",
    "learning.schedule": "Flexible Schedules",
    "learning.weekend": "Tailored to your needs",
    "learning.digital": "Digital Library",
    "learning.access": "24/7 Online Access",
    "learning.resources": "Resources & Materials",

    // About
    "about.title": "About AIM Centre 360",
    "about.desc": "A revolutionary educational platform blending academic excellence with holistic development. We nurture minds, hearts, and spirits.",
    "about.features.liveClasses": "Live Classes",
    "about.features.liveClasses.desc": "Interactive real-time learning with expert instructors.",
    "about.features.academics": "Academics",
    "about.features.academics.desc": "Comprehensive curriculum covering all core subjects.",
    "about.features.tinyExplorers": "Tiny Explorers",
    "about.features.tinyExplorers.desc": "Early childhood development for curious young minds.",
    "about.features.specialNeeds": "Special Needs",
    "about.features.specialNeeds.desc": "Innovative sensory-induced teaching approach.",
    "about.features.mentalHealth": "Mental Health",
    "about.features.mentalHealth.desc": "Counseling for both parents and students.",
    "about.features.gamified": "Gamified Learning",
    "about.features.gamified.desc": "Fun elements to make learning engaging.",
    "about.features.aimVerse": "AIMVerse",
    "about.features.aimVerse.desc": "Animated episodes with educational elements.",
    "about.features.skillBased": "Skill Based",
    "about.features.skillBased.desc": "Focus on practical skills and real-world application.",
    "about.features.quizzes": "Quizzes & Tracking",
    "about.features.quizzes.desc": "Regular assessments and detailed progress reports.",
    "about.features.aimBot": "AIMbot: AI Tutor",
    "about.features.aimBot.desc": "Smart AI assistance for 24/7 learning support.",
    "about.features.accessibility": "Accessibility",
    "about.features.accessibility.desc": "Customizable options to suit every learner's needs.",

    // AIMVerse
    "aimverse.tag": "AIMVERSE",
    "aimverse.title": "The Future of Learning",
    "aimverse.desc": "Immerse yourself in our animated universe where education meets entertainment. Join our heroes on epic quests for knowledge.",
    "aimverse.watch": "Watch Episode",
    "aimverse.glossaryTag": "CLASSIFIED ARCHIVES",
    "aimverse.glossaryTitle": "Power Glossary",
    "aimverse.glossaryDesc": "Explore the scientific basis behind our heroes' and villains' abilities.",
    "aimverse.hero": "Hero",
    "aimverse.heroName": "Photon",
    "aimverse.heroEp": "Episode 04: \"Light Speed\"",
    "aimverse.heroPower": "Power: Light Manipulation",
    "aimverse.heroPowerDesc": "Ability to control and solidify photons, creating hard-light constructs and moving at relativistic speeds.",
    "aimverse.theory": "Scientific Theory",
    "aimverse.heroTheory": "Wave-Particle Duality",
    "aimverse.plausibility": "Plausibility",
    "aimverse.heroPlausibility": "Theoretical",
    "aimverse.mechanism": "Mechanism",
    "aimverse.heroMechanism": "Utilizes a quantum field generator to collapse the wave function of light into tangible matter (Bose-Einstein Condensates).",
    "aimverse.future": "Future Possibility",
    "aimverse.heroFuture": "\"Photonics computing and laser cooling are early steps toward controlling light as matter.\"",

    "aimverse.villain": "Villain",
    "aimverse.villainName": "Entropy",
    "aimverse.villainEp": "Episode 07: \"Heat Death\"",
    "aimverse.villainPower": "Power: Decay Acceleration",
    "aimverse.villainPowerDesc": "Can instantly increase the disorder (entropy) of any closed system, causing structures to crumble and energy to dissipate.",
    "aimverse.villainTheory": "Second Law of Thermodynamics",
    "aimverse.villainPlausibility": "High (Natural Law)",
    "aimverse.villainMechanism": "Acts as a catalyst for thermodynamic equilibrium, bypassing activation energy barriers to speed up natural decay.",
    "aimverse.villainFuture": "\"Understanding entropy is key to energy efficiency, but weaponizing it remains pure sci-fi... for now.\"",

    "aimverse.nextEpisode": "Next Episode",
    "aimverse.nextEpisodeDesc": "Discover the secrets of subatomic particles with Captain Quantum.",
    "aimverse.reminder": "Set Reminder",
    "aimverse.days": "Days",
    "aimverse.hours": "Hours",
    "aimverse.minutes": "Minutes",
    "aimverse.seconds": "Seconds",

    // Courses
    "courses.title": "Our Learning Paths",
    "courses.subtitle": "Choose the perfect journey for your educational goals",
    "courses.enroll": "Enroll Now",
    "courses.wishlist": "Add to Wishlist",

    // Special Needs
    "special.tag": "Inclusive Education",
    "special.title": "Children with Special Needs",
    "special.desc": "Our innovative sensory-induced teaching method ensures that each lesson is customized and tailored for every unique individual. We believe in unlocking the potential within every child through understanding and specialized care.",
    "special.sensory": "Sensory Learning",
    "special.emotional": "Emotional Support",
    "special.individualized": "Individualized Plans",
    "special.lifeSkills": "Life Skills",
    "special.classroom": "Inside Our Classroom",
    "special.classroomDesc": "Witness the transformative power of connection. Our dedicated educators build bridges of understanding through patience, specialized techniques, and genuine care.",
    "special.resources": "Parents Resources",
    "special.resourcesDesc": "Empowering parents with knowledge, tools, and inspiring stories to navigate the journey of raising a child with special needs.",

    // Testimonials
    "testimonials.title": "Voices of Our Community",
    "testimonials.subtitle": "Real stories from the families and students who make AIM Centre 360 extraordinary.",

    // FAQ
    "faq.title": "Frequently Asked Questions",
    "faq.subtitle": "Everything you need to know about joining the AIM Centre 360 family.",

    // Footer
    "footer.rights": "All rights reserved.",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.contact": "Contact Us",
    "footer.desc": "Aim High, Achieve Infinity! An innovative e-learning platform dedicated to providing unique and effective learning experiences for everyone.",
    "footer.quickLinks": "Quick Links",
    "footer.email": "Email:",
    "footer.phone": "Phone:",
  },
  bn: {
    // Header
    "nav.home": "হোম",
    "nav.courses": "কোর্সসমূহ",
    "nav.specialNeeds": "বিশেষ চাহিদা",
    "nav.tinyExplorers": "খুদে অভিযাত্রী",
    "nav.mentalHealth": "মানসিক স্বাস্থ্য",
    "nav.aimVerse": "এইমভার্স",
    "nav.gallery": "গ্যালারি",
    "nav.about": "আমাদের সম্পর্কে",
    "nav.login": "লগ ইন",
    "nav.signup": "সাইন আপ",
    "nav.bookAppointment": "অ্যাপয়েন্টমেন্ট বুক করুন",

    // Auth
    "auth.title.login": "স্বাগতম",
    "auth.subtitle.login": "আপনার অসীম যাত্রা চালিয়ে যেতে লগ ইন করুন।",
    "auth.title.signup": "এইম সেন্টার ৩৬০-এ যোগ দিন",
    "auth.subtitle.signup": "আজই আপনার সামগ্রিক শিক্ষা অভিযান শুরু করুন।",
    "auth.label.email": "ইমেল ঠিকানা",
    "auth.label.password": "পাসওয়ার্ড",
    "auth.label.fullName": "পুরো নাম",
    "auth.label.childUid": "চাইল্ড ইউআইডি (UID)",
    "auth.label.student": "শিক্ষার্থী",
    "auth.label.parent": "অভিভাবক",
    "auth.btn.login": "লগ ইন",
    "auth.btn.signup": "অ্যাকাউন্ট তৈরি করুন",
    "auth.switch.login": "ইতিমধ্যেই অ্যাকাউন্ট আছে? লগ ইন করুন",
    "auth.switch.signup": "অ্যাকাউন্ট নেই? সাইন আপ করুন",
    "auth.branding.title": "অসীমে পৌঁছান",
    "auth.branding.subtitle": "প্রতিটি মনের জন্য সামগ্রিক উৎকর্ষ",

    // Hero
    "hero.est": "স্থাপিত  ২০২৬",
    "hero.title1": "এইম",
    "hero.title2": "সেন্টার",
    "hero.title3": "৩৬০",
    "hero.subtitle": "লক্ষ্য হোক আকাশছোঁয়া, অর্জন হোক অসীম!",
    "hero.cta": "ভর্তি হোন",
    "hero.scroll": "নিচে স্ক্রল করুন",

    // Mission Statement
    "mission.text": "জ্ঞান সবার জন্য, যেকোনো স্থানে, যেকোনো সময়ে।",

    // Learning Hours
    "learning.title": "লার্নিং আওয়ার্স",
    "learning.schedule": "ফ্লেক্সিবল সময়সূচী",
    "learning.weekend": "আপনার প্রয়োজন অনুযায়ী",
    "learning.digital": "ডিজিটাল লাইব্রেরি",
    "learning.access": "২৪/৭ অনলাইন অ্যাক্সেস",
    "learning.resources": "রিসোর্স এবং ম্যাটেরিয়ালস",

    // About
    "about.title": "এইম সেন্টার ৩৬০ সম্পর্কে",
    "about.desc": "একটি বৈপ্লবিক শিক্ষামূলক প্ল্যাটফর্ম যা একাডেমিক শ্রেষ্ঠত্বের সাথে সামগ্রিক বিকাশের সংমিশ্রণ ঘটায়। আমরা মন, হৃদয় এবং আত্মাকে লালন করি।",
    "about.features.liveClasses": "লাইভ ক্লাস",
    "about.features.liveClasses.desc": "বিশেষজ্ঞ প্রশিক্ষকদের সাথে ইন্টারেক্টিভ রিয়েল-টাইম শিক্ষা।",
    "about.features.academics": "একাডেমিক",
    "about.features.academics.desc": "সমস্ত মূল বিষয় কভার করে এমন বিস্তৃত পাঠ্যক্রম।",
    "about.features.tinyExplorers": "খুদে অভিযাত্রী",
    "about.features.tinyExplorers.desc": "কৌতূহলী শিশুদের জন্য প্রারম্ভিক শৈশব বিকাশ।",
    "about.features.specialNeeds": "বিশেষ চাহিদা",
    "about.features.specialNeeds.desc": "উদ্ভাবনী সংবেদনশীল শিক্ষণ পদ্ধতি।",
    "about.features.mentalHealth": "মানসিক স্বাস্থ্য",
    "about.features.mentalHealth.desc": "অভিভাবক এবং শিক্ষার্থীদের জন্য কাউন্সেলিং।",
    "about.features.gamified": "গ্যামিফাইড লার্নিং",
    "about.features.gamified.desc": "শেখা আনন্দদায়ক করতে মজার উপাদান।",
    "about.features.aimVerse": "এইমভার্স",
    "about.features.aimVerse.desc": "শিক্ষামূলক উপাদান সহ অ্যানিমেটেড এপিসোড।",
    "about.features.skillBased": "দক্ষতা ভিত্তিক",
    "about.features.skillBased.desc": "ব্যবহারিক দক্ষতা এবং বাস্তব প্রয়োগের উপর ফোকাস।",
    "about.features.quizzes": "কুইজ এবং ট্র্যাকিং",
    "about.features.quizzes.desc": "নিয়মিত মূল্যায়ন এবং বিস্তারিত অগ্রগতি প্রতিবেদন।",
    "about.features.aimBot": "এইমবট: এআই টিউটর",
    "about.features.aimBot.desc": "২৪/৭ শেখার সহায়তার জন্য স্মার্ট এআই।",
    "about.features.accessibility": "অ্যাক্সেসিবিলিটি",
    "about.features.accessibility.desc": "প্রতিটি শিক্ষার্থীর প্রয়োজন অনুসারে কাস্টমাইজযোগ্য বিকল্প।",

    // AIMVerse
    "aimverse.tag": "এইমভার্স",
    "aimverse.title": "শিক্ষার ভবিষ্যৎ",
    "aimverse.desc": "আমাদের অ্যানিমেটেড ইউনিভার্সে নিজেকে নিমজ্জিত করুন যেখানে শিক্ষা বিনোদনের সাথে মিলিত হয়। জ্ঞানের জন্য মহাকাব্যিক অভিযানে আমাদের নায়কদের সাথে যোগ দিন।",
    "aimverse.watch": "এপিসোড দেখুন",
    "aimverse.glossaryTag": "ক্লাসিফাইড আর্কাইভস",
    "aimverse.glossaryTitle": "পাওয়ার গ্লসারি",
    "aimverse.glossaryDesc": "আমাদের নায়ক এবং খলনায়কদের ক্ষমতার পিছনের বৈজ্ঞানিক ভিত্তি অন্বেষণ করুন।",
    "aimverse.hero": "হিরো",
    "aimverse.heroName": "ফোটন",
    "aimverse.heroEp": "পর্ব ০৪: \"লাইট স্পিড\"",
    "aimverse.heroPower": "শক্তি: আলোর কারসাজি",
    "aimverse.heroPowerDesc": "ফোটন নিয়ন্ত্রণ ও ঘনীভূত করার ক্ষমতা, হার্ড-লাইট কাঠামো তৈরি এবং আপেক্ষিক গতিতে চলার ক্ষমতা।",
    "aimverse.theory": "বৈজ্ঞানিক তত্ত্ব",
    "aimverse.heroTheory": "তরঙ্গ-কণা দ্বৈততা",
    "aimverse.plausibility": "সম্ভাব্যতা",
    "aimverse.heroPlausibility": "তাত্ত্বিক",
    "aimverse.mechanism": "মেকানিজম",
    "aimverse.heroMechanism": "বস্তুতে আলোর তরঙ্গ ফাংশন ধসে ফেলার জন্য একটি কোয়ান্টাম ফিল্ড জেনারেটর ব্যবহার করে (বোস-আইনস্টাইন কনডেনসেটস)।",
    "aimverse.future": "ভবিষ্যতের সম্ভাবনা",
    "aimverse.heroFuture": "\"ফটোনিক্স কম্পিউটিং এবং লেজার কুলিং হলো আলোকে বস্তু হিসেবে নিয়ন্ত্রণ করার প্রাথমিক পদক্ষেপ।\"",

    "aimverse.villain": "ভিলেন",
    "aimverse.villainName": "এনট্রপি",
    "aimverse.villainEp": "পর্ব ০৭: \"হিট ডেথ\"",
    "aimverse.villainPower": "শক্তি: ক্ষয় ত্বরান্বিতকরণ",
    "aimverse.villainPowerDesc": "যেকোনও বদ্ধ সিস্টেমের বিশৃঙ্খলা (এনট্রপি) তাৎক্ষণিকভাবে বৃদ্ধি করতে পারে, যার ফলে কাঠামো ভেঙে পড়ে এবং শক্তি বিলীন হয়ে যায়।",
    "aimverse.villainTheory": "তাপগতিবিদ্যার দ্বিতীয় সূত্র",
    "aimverse.villainPlausibility": "উচ্চ (প্রাকৃতিক আইন)",
    "aimverse.villainMechanism": "প্রাকৃতিক ক্ষয়কে ত্বরান্বিত করতে অ্যাক্টিভেশন এনার্জি বাধাগুলো বাইপাস করে থার্মোডাইনামিক ইকুইলিব্রিয়ামের জন্য অনুঘটক হিসেবে কাজ করে।",
    "aimverse.villainFuture": "\"এনট্রপি বোঝা শক্তি দক্ষতার জন্য চাবিকাঠি, কিন্তু এটিকে অস্ত্র হিসেবে ব্যবহার করা এখনও স্রেফ সায়েন্স ফিকশন... আপাতত।\"",

    "aimverse.nextEpisode": "পরবর্তী এপিসোড",
    "aimverse.nextEpisodeDesc": "ক্যাপ্টেন কোয়ান্টামের সাথে সাবঅ্যাটমিক কণার রহস্য আবিষ্কার করুন।",
    "aimverse.reminder": "রিমাইন্ডার সেট করুন",
    "aimverse.days": "দিন",
    "aimverse.hours": "ঘণ্টা",
    "aimverse.minutes": "মিনিট",
    "aimverse.seconds": "সেকেন্ড",

    // Courses
    "courses.title": "আমাদের লার্নিং পাথ",
    "courses.subtitle": "আপনার শিক্ষাগত লক্ষ্যের জন্য সঠিক পথটি বেছে নিন",
    "courses.enroll": "ভর্তি হোন",
    "courses.wishlist": "উইশলিস্টে যোগ করুন",

    // Special Needs
    "special.tag": "অন্তর্ভুক্তিমূলক শিক্ষা",
    "special.title": "বিশেষ চাহিদাসম্পন্ন শিশু",
    "special.desc": "আমাদের উদ্ভাবনী সংবেদনশীল শিক্ষণ পদ্ধতি নিশ্চিত করে যে প্রতিটি পাঠ প্রতিটি অনন্য ব্যক্তির জন্য কাস্টমাইজড এবং উপযুক্ত। আমরা বিশ্বাস করি প্রতিটি শিশুর মধ্যে সম্ভাবনাকে উন্মোচিত করতে হবে বোঝাপড়া এবং বিশেষায়িত যত্নের মাধ্যমে।",
    "special.sensory": "সংবেদনশীল শিক্ষা",
    "special.emotional": "মানসিক সহায়তা",
    "special.individualized": "ব্যক্তিগত পরিকল্পনা",
    "special.lifeSkills": "জীবন দক্ষতা",
    "special.classroom": "আমাদের ক্লাসরুমের ভেতরে",
    "special.classroomDesc": "সংযোগের রূপান্তরকারী শক্তি দেখুন। আমাদের নিবেদিত শিক্ষকরা ধৈর্য, বিশেষায়িত কৌশল এবং প্রকৃত যত্নের মাধ্যমে বোঝাপড়ার সেতু তৈরি করেন।",
    "special.resources": "অভিভাবকদের রিসোর্স",
    "special.resourcesDesc": "বিশেষ চাহিদাসম্পন্ন শিশু লালন-পালনের যাত্রায় অভিভাবকদের জ্ঞান, সরঞ্জাম এবং অনুপ্রেরণামূলক গল্প দিয়ে ক্ষমতায়ন করা।",

    // Testimonials
    "testimonials.title": "আমাদের কমিউনিটির কথা",
    "testimonials.subtitle": "সেই পরিবার এবং শিক্ষার্থীদের বাস্তব গল্প যারা এইম সেন্টার ৩৬০ কে অসাধারণ করে তুলেছে।",

    // FAQ
    "faq.title": "সচরাচর জিজ্ঞাসিত প্রশ্ন",
    "faq.subtitle": "এইম সেন্টার ৩৬০ পরিবারে যোগ দেওয়ার বিষয়ে আপনার যা জানা দরকার।",

    // Footer
    "footer.rights": "সর্বস্বত্ব সংরক্ষিত।",
    "footer.privacy": "গোপনীয়তা নীতি",
    "footer.terms": "সেবার শর্তাবলী",
    "footer.contact": "যোগাযোগ করুন",
    "footer.desc": "লক্ষ্য হোক আকাশছোঁয়া, অর্জন হোক অসীম! সবার জন্য অনন্য এবং কার্যকর শেখার অভিজ্ঞতা প্রদানের জন্য নিবেদিত একটি উদ্ভাবনী ই-লার্নিং প্ল্যাটফর্ম।",
    "footer.quickLinks": "কুইক লিংকস",
    "footer.email": "ইমেইল:",
    "footer.phone": "ফোন:",
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'bn' : 'en');
  };

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      <div className={language === 'bn' ? 'font-bengali' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
