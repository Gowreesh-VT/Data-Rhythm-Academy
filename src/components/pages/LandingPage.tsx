import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { Logo } from '../ui/logo';
import { Page } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  Award, 
  Clock, 
  Star, 
  PlayCircle, 
  CheckCircle, 
  ArrowRight,
  Calendar,
  Target,
  Zap,
  Shield,
  BarChart3,
  Globe,
  Smartphone,
  Download,
  MessageCircle
} from 'lucide-react';

import { NavigatePath } from '../../types';

interface LandingPageProps {
  onNavigate: (path: NavigatePath) => void;
  user: any;
  onLogout: () => void;
}

export function LandingPage({ onNavigate, user, onLogout }: LandingPageProps) {
  const { user: authUser } = useAuth();
  
  const handleDashboardRedirect = () => {
    if (authUser?.role === 'admin') {
      onNavigate('/admin-dashboard');
    } else if (authUser?.role === 'instructor') {
      onNavigate('/instructor-dashboard');
    } else {
      onNavigate('/my-courses');
    }
  };

  const features = [
    {
      icon: <PlayCircle className="w-8 h-8" />,
      title: "Online Classes",
      description: "High-quality online classes with multiple resolutions and playback speeds"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile Learning",
      description: "Access courses on any device - phone, tablet, or desktop with seamless sync"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Self-Paced Learning",
      description: "Learn at your own pace with lifetime access to course materials"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Digital Certificates",
      description: "Earn verified certificates upon completion to boost your career"
    }
  ];

  const courses = [
    {
      title: "Introduction To Python",
      description: "Master Python programming from Basics and get started with programming",
      price: "₹1000",
      rating: 4.9,
      students: "5,670+",
      duration: "4 weeks",
      image: "https://images.unsplash.com/photo-1649180556628-9ba704115795?q=80&w=2062&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      title: "Python Programming Adv.",
      description: "Complete Python bootcamp from basics to advanced web scraping and automation",
      price: "₹1500",
      rating: 4.85,
      students: "3,876+",
      duration: "8 weeks",
      image: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
        {
      title: "DSA in Python",
      description: "Comprehensive guide to data structures and algorithms using Python",
      price: "₹1250",
      rating: 4.5,
      students: "475+",
      duration: "10 weeks",
      image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
        {
      title: "Introduction to SQL",
      description: "Master SQL for data analysis and manipulation",
      price: "₹1000",
      rating: 4.75,
      students: "1,296+",
      duration: "8 weeks",
      image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=2021&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
        {
      title: "Data Science and Analytics",
      description: "Comprehensive data science course with Python, R, and real-world datasets",
      price: "₹1000",
      rating: 4.7,
      students: "1,890+",
      duration: "12 weeks",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      title: "Foundation in Machine Learning",
      description: "Deep dive into ML algorithms, neural networks, and artificial intelligence",
      price: "₹1250",
      rating: 4.75,
      students: "1,567+",
      duration: "12 weeks",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2062&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    }
  ];

  const testimonials = [
    {
      name: "Aarav Mehta",
      role: "Software Developer at TCS",
      content: "This platform completely changed the way I learn. The support they gave helped me land my first job within a few months.",
      rating: 5,
      avatar: "AM"
    },
    {
      name: "Priya Nair",
      role: "Data Analyst at Infosys",
      content: "The hands-on projects and case studies made the concepts so clear. I gained real-world experience that set me apart during placements.",
      rating: 5,
      avatar: "PN"
    },
    {
      name: "Rohan Gupta",
      role: "UI/UX Designer at Zoho",
      content: "The course structure was well-organized, and the community was super helpful. My design portfolio built here directly helped me secure my current role.",
      rating: 5,
      avatar: "RG"
    }
  ];

  // const pricingPlans = [
  //   {
  //     name: "Starter",
  //     price: "₹1000",
  //     period: "/month",
  //     description: "Perfect for individual learners",
  //     features: [
  //       "Access to basic courses",
  //       "Community support",
  //       "Mobile app access",
  //       "Progress tracking"
  //     ],
  //     popular: false
  //   },
  //   {
  //     name: "Professional",
  //     price: "₹2500",
  //     period: "/month", 
  //     description: "Best for serious learners",
  //     features: [
  //       "Access to all courses",
  //       "1-on-1 mentorship",
  //       "Project reviews",
  //       "Career guidance",
  //       "Certificate of completion",
  //       "Priority support"
  //     ],
  //     popular: true
  //   },
  //   {
  //     name: "Enterprise",
  //     price: "₹5000",
  //     period: "/month",
  //     description: "For teams and organizations",
  //     features: [
  //       "Everything in Professional",
  //       "Team dashboard",
  //       "Custom learning paths",
  //       "Advanced analytics",
  //       "Dedicated account manager",
  //       "Custom integrations"
  //     ],
  //     popular: false
  //   }
  // ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-blue-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button 
              onClick={() => onNavigate('/')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Logo size="md" className="text-blue-600" />
              <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Data Rhythm Academy
              </span>
            </button>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <button 
                onClick={() => onNavigate('/courses')}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Courses
              </button>
              <button 
                onClick={() => onNavigate('/about')}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                About Us
              </button>
              {/* <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a> */}
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors">Reviews</a>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Welcome, {user.name}</span>
                  <Button variant="outline" onClick={() => onNavigate('/calendar')}>Calendar</Button>
                  <Button variant="outline" onClick={handleDashboardRedirect}>Dashboard</Button>
                  <Button variant="ghost" onClick={onLogout}>Logout</Button>
                </div>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => onNavigate('/login')}>Sign In</Button>
                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                    onClick={() => onNavigate('/register')}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-cyan-700 bg-clip-text text-transparent">
                Learn Online. Advance Your Career.
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Join our online course and experience live interactive sessions with expert mentors. 
                Engage in real-time discussions, receive personalized guidance, and clarify your doubts 
                instantly during live classes. This hands-on learning approach ensures a deeper 
                understanding and a more engaging educational experience.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-6 text-lg"
                  onClick={() => onNavigate('/courses')}
                >
                  Explore Online Courses
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg"
                  onClick={() => onNavigate('/register')}
                >
                  <PlayCircle className="mr-2 w-5 h-5" />
                  Start Learning
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <PlayCircle className="w-5 h-5 text-blue-400" />
                  <span>Online Classes</span>
                </div>
                {/* <div className="flex items-center space-x-2">
                  <Download className="w-5 h-5 text-green-400" />
                  <span>Recorded Sessions</span>
                </div> */}
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span>Digital Certificates</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Students learning together in modern classroom"
                  className="rounded-2xl shadow-2xl w-full h-auto"
                />
              </div>
              
              {/* Floating cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-10 -left-35 bg-white rounded-xl shadow-lg p-4 border border-blue-100"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-medium">Live Session</span>
                </div>
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                className="absolute -bottom-15 right-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg p-4 text-white"
              >
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span className="text-sm font-medium">Certificate Ready</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-cyan-100 text-cyan-700 border-cyan-200">
              ✨ Why Choose Data Rhythm Academy
            </Badge>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform combines expert instruction, practical projects, 
              and personalized support to accelerate your learning journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full border-blue-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200">
              🎯 Popular Courses
            </Badge>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-purple-800 bg-clip-text text-transparent">
              Start Your Journey Today
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our most popular courses designed by industry experts
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-blue-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 bg-white">
                  <div className="relative">
                    <ImageWithFallback
                      src={course.image}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-medium">
                      {course.price}
                    </div>
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{course.rating}</span>
                        <span className="text-sm text-gray-500">({course.students})</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {course.duration}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{course.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <CardDescription className="text-gray-600 mb-4">
                      {course.description}
                    </CardDescription>
                    {course.title === "Introduction To Python" ? (
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                        onClick={() => onNavigate('/register')}
                      >
                        Enroll Now
                      </Button>
                    ) : (
                      <Button 
                        variant="outline"
                        className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                        onClick={() => onNavigate('/contact')}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contact Us
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
              💬 Student Success Stories
            </Badge>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-green-800 bg-clip-text text-transparent">
              Hear From Our Alumni
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from students who transformed their careers with Data Rythym Academy.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full border-blue-100 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                          {testimonial.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center mt-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">"{testimonial.content}"</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {/* <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-orange-100 text-orange-700 border-orange-200">
              💰 Simple Pricing
            </Badge>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-orange-800 bg-clip-text text-transparent">
              Choose Your Learning Path
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Flexible plans designed to fit your learning goals and budget
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className={`relative h-full ${plan.popular ? 'border-blue-300 ring-2 ring-blue-200 bg-gradient-to-b from-blue-50 to-white' : 'border-blue-100 bg-white'} hover:shadow-xl transition-all duration-300`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full mt-8 ${plan.popular ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white' : 'border-blue-200 text-blue-600 hover:bg-blue-50'}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => onNavigate('/register')}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Logo size="md" className="text-blue-400" />
                <span className="text-xl font-semibold">Data Rythym Academy</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Empowering learners worldwide with expert-led courses and personalized mentorship.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Courses</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button 
                    onClick={() => onNavigate('/courses')} 
                    className="hover:text-white transition-colors text-left">
                    Introduction to Python
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('/courses')} 
                    className="hover:text-white transition-colors text-left">
                    Data Science
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('/courses')} 
                    className="hover:text-white transition-colors text-left">
                    DSA in Python
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('/courses')} 
                    className="hover:text-white transition-colors text-left">
                    Machine Learning
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button 
                    onClick={() => onNavigate('/about')} 
                    className="hover:text-white transition-colors text-left">
                    About Us
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('/courses')} 
                    className="hover:text-white transition-colors text-left">
                    Careers
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('/courses')} 
                    className="hover:text-white transition-colors text-left">
                    Blog
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('/contact')} 
                    className="hover:text-white transition-colors text-left">
                    Contact
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button 
                    onClick={() => onNavigate('/contact')} 
                    className="hover:text-white transition-colors text-left">
                    Help Center
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('/privacy')} 
                    className="hover:text-white transition-colors text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('/privacy')} 
                    className="hover:text-white transition-colors text-left"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('/contact')} 
                    className="hover:text-white transition-colors text-left">
                    Refund Policy
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2025 Data Rythym Academy. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </a>
              <a href="https://www.gowreesh.works" className="text-gray-400 hover:text-white transition-colors">
                <Users className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Shield className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}