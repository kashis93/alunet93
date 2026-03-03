import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Users, Calendar, Briefcase, Lightbulb, Rocket,
  MapPin, MessageCircle, Star, TrendingUp, Award, Target,
  Building2, GraduationCap, Zap, ChevronRight
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Avatar, AvatarImage, AvatarFallback, Separator } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { alumni, opportunities, challenges } from "@/data/dummyData.js";
import noteworthyAlumni from "@/data/noteworthyAlumni.json";
import eventsData from "@/data/eventsData.json";
import startupsData from "@/data/startupsData.json";
import { useState, useEffect } from "react";
import heroBg from "@/assets/hero-bg.jpg";
import slide1 from "@/assets/silde1.jfif";
import slide2 from "@/assets/silde2.jpg";
import slide3 from "@/assets/silde3.jfif";
import slide4 from "@/assets/silde4.jfif";
import slide5 from "@/assets/silde5.jpeg";

const Home = () => {
  const { user, requireAuth } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [newsIndex, setNewsIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const heroSlides = [
    { image: heroBg, title: "L.D. College of Engineering" },
    { image: slide1, title: "Campus Lawn & Activities" },
    { image: slide2, title: "Lecture Halls & Sessions" },
    { image: slide3, title: "Student Clubs & Events" },
    { image: slide4, title: "Alumni Meetups" },
    { image: slide5, title: "Campus Celebrations" },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length), 4000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const updates = [
    ...challenges.map((c) => ({
      id: `c-${c.id}`,
      type: "Challenge",
      title: c.title,
      href: `/challenges/${c.id}`,
      icon: Target,
      color: "text-blue-600",
      bg: "bg-blue-100",
    })),
    ...opportunities.slice(0, 10).map((o, i) => ({
      id: `o-${o.id || i}`,
      type: "Opportunity",
      title: `${o.title} • ${o.company}`,
      href: "/opportunities",
      icon: Briefcase,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    })),
    ...eventsData.slice(0, 10).map((e) => ({
      id: `e-${e.id}`,
      type: "Event",
      title: e.title,
      href: "/events",
      icon: Calendar,
      color: "text-rose-600",
      bg: "bg-rose-100",
    })),
  ];

  useEffect(() => {
    if (updates.length === 0) return;
    if (paused) return;
    const t = setInterval(() => {
      setNewsIndex((p) => (p + 1) % updates.length);
    }, 3000);
    return () => clearInterval(t);
  }, [paused, updates.length]);

  const visibleUpdates = Array.from({ length: 4 }).map((_, i) => updates[(newsIndex + i) % updates.length]).filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 pt-6 pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="relative w-full h-[500px] group">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative h-full w-full overflow-hidden bg-slate-100 rounded-3xl shadow-2xl"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 200, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -200, scale: 0.95 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300, mass: 1 }}
                  className="absolute inset-0 cursor-grab active:cursor-grabbing"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(e, { offset }) => {
                    const swipe = Math.abs(offset.x) > 50;
                    if (swipe && offset.x > 0) prevSlide();
                    else if (swipe && offset.x < 0) nextSlide();
                  }}
                >
                  <motion.img
                    src={heroSlides[currentSlide].image}
                    alt={heroSlides[currentSlide].title}
                    className="w-full h-full object-cover select-none"
                    loading="eager"
                    decoding="async"
                    draggable={false}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  {/* captions moved below the hero so they don't cover images */}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <motion.button onClick={prevSlide} className="h-12 w-12 rounded-full bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:bg-white/40 transition-all shadow-lg">
                  <ChevronRight className="h-6 w-6 rotate-180" />
                </motion.button>
                <motion.button onClick={nextSlide} className="h-12 w-12 rounded-full bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:bg-white/40 transition-all shadow-lg">
                  <ChevronRight className="h-6 w-6" />
                </motion.button>
              </div>

              {/* Indicators */}
              <div className="absolute bottom-8 right-10 flex gap-3 z-10">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`rounded-full transition-all duration-300 ${currentSlide === index ? "w-10 h-3 bg-gradient-to-r from-cyan-400 to-blue-500" : "w-3 h-3 bg-white/50 hover:bg-white/80"}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
          <div className="mt-6 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">{heroSlides[currentSlide].title}</h2>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div
          className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold text-slate-700">Latest Updates</span>
            </div>
            <Link to="/challenges" className="text-xs font-semibold text-primary hover:underline">See more</Link>
          </div>
          <div className="relative h-56 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={newsIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 p-4 space-y-3"
              >
                {visibleUpdates.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      to={item.href}
                      key={item.id}
                      className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition"
                    >
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center ${item.bg}`}>
                        <Icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-500">{item.type}</div>
                        <div className="text-sm font-bold text-slate-800 truncate">{item.title}</div>
                      </div>
                    </Link>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">

        {/* Latest Opportunities */}
        <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-12 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-3xl lg:rounded-[3rem]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                  <span className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">Career Portal</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900">Latest Opportunities</h2>
                <p className="text-lg text-slate-600 max-w-lg">Exclusive career openings posted by alumni from top companies</p>
              </div>
              <Button variant="ghost" className="gap-2 text-emerald-700 font-semibold hover:bg-emerald-100 text-base border-2 border-emerald-200 rounded-xl" asChild>
                <Link to="/opportunities">
                  Explore All <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-7">
              {opportunities.slice(0, 3).map((opp, index) => (
                <motion.div key={opp.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                  <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-sm overflow-hidden group relative">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl font-black text-slate-900 line-clamp-2">{opp.title}</CardTitle>
                      <p className="text-sm text-slate-600 font-bold flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-emerald-600" />
                        {opp.company}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">{opp.domain}</Badge>
                        <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 font-bold">{opp.roleType}</Badge>
                      </div>
                      <Button className="w-full gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-[1.02] transition-transform text-white font-bold" onClick={() => window.open(opp.applyLink, "_blank")}>
                        View & Apply <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Active Challenges */}
        <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 py-12 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-3xl lg:rounded-[3rem]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                  <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">Compete & Learn</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900">Active Challenges</h2>
                <p className="text-lg text-slate-600 max-w-lg">Showcase your skills and win exciting rewards</p>
              </div>
              <Button variant="ghost" className="gap-2 text-blue-700 font-semibold hover:bg-blue-100 text-base border-2 border-blue-200 rounded-xl" asChild>
                <Link to="/challenges">
                  View All <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-7">
              {challenges.map((challenge, index) => (
                <motion.div key={challenge.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                  <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-sm overflow-hidden group relative">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl font-black text-slate-900 line-clamp-2">{challenge.title}</CardTitle>
                        <Target className="h-5 w-5 text-blue-500" />
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold">{challenge.domain}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{challenge.description}</p>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-sm font-bold text-slate-500">Prize: {challenge.prize}</span>
                        <Button size="sm" variant="ghost" className="text-blue-700 font-black" asChild><Link to="/challenges">Join Now</Link></Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Innovation Center (Startups) */}
        <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-3xl lg:rounded-[3rem]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
                  <span className="text-sm font-semibold text-amber-700 uppercase tracking-wider">Startup Hub</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900">Innovation Center</h2>
                <p className="text-lg text-slate-600 max-w-lg">Fueling student ideas with alumni mentorship and resources</p>
              </div>
              <Button variant="ghost" className="gap-2 text-amber-700 font-semibold hover:bg-amber-100 text-base border-2 border-amber-200 rounded-xl" asChild>
                <Link to="/startup">
                  Explore Hub <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-7">
              {startupsData.slice(0, 3).map((startup, index) => (
                <motion.div key={startup.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                  <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-sm overflow-hidden group relative">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl font-black text-slate-900">{startup.name}</CardTitle>
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                      </div>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold">DIPP: {startup.dippNumber}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-slate-600 line-clamp-3">{startup.description}</p>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-xs font-bold text-slate-800">Founded by: {startup.founder}</span>
                        <Button size="sm" variant="ghost" className="text-amber-700 font-black" onClick={() => window.location.href = `mailto:secretary@ldcealumni.net?subject=Connect with ${startup.name}`}>Connect</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Campus Pulse (Events) */}
        <section className="bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 py-12 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-3xl lg:rounded-[3rem]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" />
                  <span className="text-sm font-semibold text-rose-700 uppercase tracking-wider">Upcoming Events</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900">Campus Pulse</h2>
                <p className="text-lg text-slate-600 max-w-lg">Stay connected with the latest gatherings and workshops</p>
              </div>
              <Button variant="ghost" className="gap-2 text-rose-700 font-semibold hover:bg-rose-100 text-base border-2 border-rose-200 rounded-xl" asChild>
                <Link to="/events">
                  View All <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-4 gap-7">
              {eventsData.slice(0, 4).map((event, index) => (
                <motion.div key={event.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                  <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-sm overflow-hidden group flex flex-col">
                    <div className="relative h-44 overflow-hidden">
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <Badge className="absolute top-3 right-3 bg-rose-500 text-white border-0 font-bold">{event.status}</Badge>
                    </div>
                    <CardContent className="p-5 flex flex-col flex-grow">
                      <h4 className="font-black text-slate-900 group-hover:text-rose-700 transition-colors line-clamp-2 flex-grow">{event.title}</h4>
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-rose-500" />
                          {event.date}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Noteworthy Mentions */}
        <section className="bg-gradient-to-br from-slate-50 via-gray-100 to-slate-50 py-12 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-3xl lg:rounded-[3rem]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-4xl font-black text-slate-900 border-l-4 border-primary pl-4">Noteworthy Mentions</h2>
                <p className="text-lg text-slate-600 mt-2">Celebrating the extraordinary achievements of our distinguished alumni</p>
              </div>
              <Button size="lg" variant="outline" className="gap-2 font-bold border-2 rounded-xl" asChild>
                <Link to="/directory">
                  View Directory <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {noteworthyAlumni.slice(0, 6).map((alum, index) => (
                <motion.div key={alum.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                  <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white group overflow-hidden">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={alum.image} alt={alum.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-white/90 text-slate-900 font-bold">Batch {alum.batch}</Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl font-black group-hover:text-primary transition-colors">{alum.name}</CardTitle>
                      <p className="text-sm font-bold text-primary/80">{alum.position}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700 italic line-clamp-3">"{alum.achievement}"</p>
                      <Button variant="ghost" className="w-full mt-4 font-bold rounded-lg border" onClick={() => requireAuth(() => { })}>View Profile</Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;
