export interface Course {
  id: number;
  title: string;
  description: string;
  duration: string;
  price: number;
  available: boolean;
  level: string;
  modules: string[];
  prerequisites: string;
  instructor: string;
  instructorBio: string;
  rating: number;
  students: number;
}

export interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  course: string;
}

export interface ContactInfo {
  mainOffice: {
    title: string;
    address: string;
    icon: string;
  };
  phone: {
    title: string;
    number: string;
    icon: string;
  };
  email: {
    title: string;
    address: string;
    icon: string;
  };
  fax: {
    title: string;
    number: string;
    icon: string;
  };
}

export interface SocialMedia {
  platform: string;
  url: string;
  icon: string;
  username: string;
}

export const coursesData: Course[] = [
  {
    id: 1,
    title: "Introduction to Python",
    description: "Start your programming journey with Python basics, syntax, and fundamental concepts.",
    duration: "6 weeks",
    price: 2999,
    available: true,
    level: "Beginner",
    modules: ["Python Basics", "Data Types", "Control Structures", "Functions", "File Handling", "Error Handling"],
    prerequisites: "No programming experience required",
    instructor: "Dr. Sarah Johnson",
    instructorBio: "PhD in Computer Science with 8+ years teaching experience",
    rating: 4.8,
    students: 1250
  },
  {
    id: 2,
    title: "Advanced Python Course",
    description: "Deep dive into advanced Python concepts, OOP, and professional development practices.",
    duration: "8 weeks",
    price: 4999,
    available: false,
    level: "Advanced",
    modules: ["OOP", "Decorators", "Generators", "Async Programming", "Testing", "Deployment"],
    prerequisites: "Basic Python knowledge required",
    instructor: "Prof. Michael Chen",
    instructorBio: "Senior Software Engineer with 12+ years industry experience",
    rating: 4.9,
    students: 0
  },
  {
    id: 3,
    title: "Foundations in Machine Learning",
    description: "Learn ML algorithms, model building, and practical implementation techniques.",
    duration: "10 weeks",
    price: 7999,
    available: false,
    level: "Intermediate",
    modules: ["ML Basics", "Supervised Learning", "Unsupervised Learning", "Model Evaluation", "Feature Engineering", "Model Deployment"],
    prerequisites: "Python and basic statistics knowledge",
    instructor: "Dr. Emily Rodriguez",
    instructorBio: "PhD in Machine Learning, Former Google AI researcher",
    rating: 4.7,
    students: 0
  },
  {
    id: 4,
    title: "Foundations in Deep Learning",
    description: "Explore neural networks, deep learning frameworks, and advanced AI techniques.",
    duration: "12 weeks",
    price: 9999,
    available: false,
    level: "Advanced",
    modules: ["Neural Networks", "CNNs", "RNNs", "Transformers", "GANs", "MLOps"],
    prerequisites: "Machine Learning fundamentals required",
    instructor: "Dr. Alex Kumar",
    instructorBio: "PhD in AI, Published researcher with 50+ papers",
    rating: 4.9,
    students: 0
  },
  {
    id: 5,
    title: "SQL CrashCourse",
    description: "Master database querying, joins, and data manipulation with SQL.",
    duration: "4 weeks",
    price: 1999,
    available: false,
    level: "Beginner",
    modules: ["SQL Basics", "Joins", "Aggregations", "Subqueries", "Stored Procedures", "Performance Optimization"],
    prerequisites: "No prior database experience required",
    instructor: "James Wilson",
    instructorBio: "Database Administrator with 10+ years experience",
    rating: 4.6,
    students: 0
  },
  {
    id: 6,
    title: "Python for Data Analysis",
    description: "Use Python libraries like Pandas, NumPy, and Matplotlib for data analysis.",
    duration: "8 weeks",
    price: 5999,
    available: false,
    level: "Intermediate",
    modules: ["Pandas", "NumPy", "Matplotlib", "Seaborn", "Data Cleaning", "Statistical Analysis"],
    prerequisites: "Basic Python knowledge required",
    instructor: "Lisa Park",
    instructorBio: "Senior Data Analyst at Fortune 500 company",
    rating: 4.7,
    students: 0
  },
  {
    id: 7,
    title: "DSA In Python",
    description: "Master data structures and algorithms using Python for technical interviews.",
    duration: "10 weeks",
    price: 6999,
    available: false,
    level: "Intermediate",
    modules: ["Arrays & Strings", "Linked Lists", "Trees & Graphs", "Dynamic Programming", "Sorting & Searching", "System Design"],
    prerequisites: "Intermediate Python knowledge",
    instructor: "Raj Patel",
    instructorBio: "Software Engineer at FAANG company, Interview expert",
    rating: 4.8,
    students: 0
  }
];

export const testimonialsData: Testimonial[] = [
  {
    name: "Priya Sharma",
    role: "Data Scientist at TCS",
    content: "Data Rhythm Academy completely transformed my career. The hands-on approach and expert instructors helped me land my dream job in data science.",
    rating: 5,
    course: "Machine Learning Foundations"
  },
  {
    name: "Arjun Mehta",
    role: "Software Engineer at Infosys",
    content: "The Python courses are incredibly well-structured. I went from zero programming knowledge to building real applications in just a few months.",
    rating: 5,
    course: "Introduction to Python"
  },
  {
    name: "Sneha Kumar",
    role: "Business Analyst at Wipro",
    content: "The SQL course gave me the confidence to handle complex database queries. The practical projects were exactly what I needed for my job.",
    rating: 4,
    course: "SQL CrashCourse"
  },
  {
    name: "Rahul Singh",
    role: "ML Engineer at Flipkart",
    content: "Outstanding curriculum and support. The deep learning course opened up new career opportunities I never thought possible.",
    rating: 5,
    course: "Deep Learning Foundations"
  }
];

export const contactInfo: ContactInfo = {
  mainOffice: {
    title: "Main Office",
    address: "123 Tech Park, Whitefield, Bangalore, Karnataka 560066",
    icon: "📍"
  },
  phone: {
    title: "Phone Number",
    number: "+91-9876543210",
    icon: "📞"
  },
  email: {
    title: "Email Address",
    address: "info@datarhythmacademy.com",
    icon: "✉️"
  },
  fax: {
    title: "Fax",
    number: "+91-80-12345678",
    icon: "📠"
  }
};

export const socialMediaData: SocialMedia[] = [
  {
    platform: "LinkedIn",
    url: "https://linkedin.com/company/data-rhythm-academy",
    icon: "💼",
    username: "@DataRhythmAcademy"
  },
  {
    platform: "Email",
    url: "mailto:info@datarhythmacademy.com",
    icon: "✉️",
    username: "info@datarhythmacademy.com"
  },
  {
    platform: "Phone",
    url: "tel:+919876543210",
    icon: "📞",
    username: "+91-9876543210"
  }
];