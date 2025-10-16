import React from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Logo } from './ui/logo';
import { NavigatePath } from '../types';
import { 
  ArrowLeft,
  Users,
  Award,
  Target,
  Heart,
  BookOpen,
  Globe,
  Zap,
  CheckCircle,
  Star,
  GraduationCap,
  TrendingUp
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (path: NavigatePath) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  const teamMembers = [
    {
      name: "Dr.Hemalatha",
      role: "Founder & CEO",
      bio: "Passionate educator with 15+ years in tech education and software development",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=hemalatha&backgroundColor=3b82f6",
      expertise: ["Python", "Data Science", "Machine Learning", "Web Development"]
    },
    {
      name: "Dr. Sarah Johnson",
      role: "Lead Data Science Instructor",
      bio: "Data Scientist with 8+ years experience at Google and Microsoft",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah&backgroundColor=b6e3f4",
      expertise: ["Data Science", "Machine Learning", "Statistics", "Python"]
    },
    {
      name: "Alex Chen",
      role: "Senior Web Development Instructor",
      bio: "Full-stack developer and former tech lead at major startups",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex&backgroundColor=c084fc",
      expertise: ["React", "Node.js", "JavaScript", "TypeScript"]
    }
  ];

  const achievements = [
    { number: "10,000+", label: "Students Taught", icon: Users },
    { number: "50+", label: "Courses Available", icon: BookOpen },
    { number: "95%", label: "Job Placement Rate", icon: TrendingUp },
    { number: "4.8/5", label: "Average Rating", icon: Star }
  ];

  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description: "Democratizing quality tech education for everyone"
    },
    {
      icon: Heart,
      title: "Student-Centric",
      description: "Every decision is made with our students' success in mind"
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Cutting-edge curriculum that adapts to industry needs"
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "Building a worldwide community of skilled professionals"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-blue-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onNavigate('/')}
                className="text-gray-600 hover:text-blue-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
            <Logo />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              About{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Data Rhythm Academy
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Empowering the next generation of tech professionals through comprehensive, 
              hands-on education in data science, programming, and emerging technologies.
            </p>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12"
          >
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <achievement.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {achievement.number}
                </div>
                <div className="text-gray-600">{achievement.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Data Rhythm Academy was founded with a simple yet powerful vision: 
                  to make high-quality tech education accessible to everyone, regardless 
                  of their background or location.
                </p>
                <p>
                  Starting from Chennai, Tamil Nadu, we recognized the growing demand 
                  for skilled professionals in data science, programming, and emerging 
                  technologies. Our founders, having worked at top tech companies, 
                  understood the gap between academic learning and industry requirements.
                </p>
                <p>
                  Today, we've grown into a comprehensive learning platform that combines 
                  theoretical knowledge with practical, hands-on experience. Our courses 
                  are designed by industry experts and constantly updated to reflect 
                  the latest trends and technologies.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-8 text-white">
                <GraduationCap className="w-12 h-12 mb-4" />
                <h3 className="text-xl font-bold mb-2">Our Mission</h3>
                <p>
                  To bridge the skills gap in technology by providing world-class education 
                  that transforms learners into industry-ready professionals.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="text-center h-full border-blue-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <value.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Team */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Industry experts dedicated to your success
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="text-center border-blue-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage src={member.image} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl">{member.name}</CardTitle>
                    <CardDescription className="text-blue-600 font-medium">
                      {member.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{member.bio}</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {member.expertise.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of students who have transformed their careers with us
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-50"
                onClick={() => onNavigate('/courses')}>
                Browse Courses
              </Button>
              <Button 
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-50"
                onClick={() => onNavigate('/contact')}>
                Contact Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}