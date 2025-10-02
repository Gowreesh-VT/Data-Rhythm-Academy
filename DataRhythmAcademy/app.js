// Data Rhythm Academy - Main Application JavaScript

// Application Data
const appData = {
  courses: [
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
  ],
  testimonials: [
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
  ],
  contactInfo: {
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
  },
  socialMedia: [
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
  ]
};

// Application State
let currentUser = null;
let currentPage = 'home';
let enrolledCourses = [];
let users = [];
let payments = [];

// DOM Elements
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const toast = document.getElementById('toast');
const modal = document.getElementById('modal');

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  setupEventListeners();
  loadTestimonialsFromData();
  displayCourses();
  checkAuthState();
});

function initializeApp() {
  // Create users array with admin if localStorage is empty
  const savedUsers = localStorage.getItem('dra_users');
  const savedCurrentUser = localStorage.getItem('dra_current_user');
  const savedEnrolledCourses = localStorage.getItem('dra_enrolled_courses');
  const savedPayments = localStorage.getItem('dra_payments');

  if (savedUsers) users = JSON.parse(savedUsers);
  if (savedCurrentUser) currentUser = JSON.parse(savedCurrentUser);
  if (savedEnrolledCourses) enrolledCourses = JSON.parse(savedEnrolledCourses);
  if (savedPayments) payments = JSON.parse(savedPayments);

  // Add admin user if not exists
  if (!users.find(u => u.email === 'admin@datarhythmacademy.com')) {
    users.push({
      id: 1,
      name: 'Admin User',
      email: 'admin@datarhythmacademy.com',
      password: 'admin123',
      role: 'admin',
      joinDate: new Date().toISOString()
    });
    saveToStorage();
  }
}

function setupEventListeners() {
  // Navigation
  document.addEventListener('click', function(e) {
    if (e.target.hasAttribute('data-page')) {
      e.preventDefault();
      const page = e.target.getAttribute('data-page');
      navigateToPage(page);
    }
  });

  // Forms
  setupAuthForms();
  setupPaymentForm();
  setupContactForm();
  setupAdminTabs();

  // Modal and Toast
  setupModalAndToast();

  // Course interactions
  setupCourseInteractions();
}

function navigateToPage(page, data = null) {
  // Hide all pages
  pages.forEach(p => p.classList.remove('active'));
  
  // Remove active class from nav links
  navLinks.forEach(link => link.classList.remove('active'));
  
  // Show target page
  const targetPage = document.getElementById(`${page}-page`);
  if (targetPage) {
    targetPage.classList.add('active');
    currentPage = page;
    
    // Add active class to corresponding nav link
    const navLink = document.querySelector(`[data-page="${page}"]`);
    if (navLink && navLink.classList.contains('nav-link')) {
      navLink.classList.add('active');
    }
    
    // Handle page-specific logic
    switch(page) {
      case 'courses':
        displayCourses();
        break;
      case 'course-detail':
        if (data) displayCourseDetail(data);
        break;
      case 'dashboard':
        if (currentUser) displayDashboard();
        else navigateToPage('login');
        break;
      case 'admin':
        if (currentUser && currentUser.role === 'admin') displayAdminPanel();
        else navigateToPage('login');
        break;
      case 'payment':
        if (data) displayPaymentPage(data);
        break;
      case 'course-content':
        if (data) displayCourseContent(data);
        break;
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
  }
}

function checkAuthState() {
  const loginLink = document.getElementById('login-link');
  const registerLink = document.getElementById('register-link');
  const userMenu = document.getElementById('user-menu');
  const adminMenu = document.getElementById('admin-menu');

  if (currentUser) {
    loginLink.style.display = 'none';
    registerLink.style.display = 'none';
    userMenu.classList.remove('hidden');
    
    if (currentUser.role === 'admin') {
      adminMenu.classList.remove('hidden');
    }
    
    // Update welcome message
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) {
      welcomeMessage.textContent = `Welcome back, ${currentUser.name}!`;
    }
  } else {
    loginLink.style.display = 'inline';
    registerLink.style.display = 'inline';
    userMenu.classList.add('hidden');
    adminMenu.classList.add('hidden');
  }
}

function setupAuthForms() {
  // Login Form
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      currentUser = user;
      localStorage.setItem('dra_current_user', JSON.stringify(currentUser));
      showToast('Login successful!', 'success');
      checkAuthState();
      
      if (user.role === 'admin') {
        navigateToPage('admin');
      } else {
        navigateToPage('dashboard');
      }
    } else {
      showToast('Invalid email or password', 'error');
    }
  });

  // Register Form
  const registerForm = document.getElementById('register-form');
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    
    if (users.find(u => u.email === email)) {
      showToast('User with this email already exists', 'error');
      return;
    }
    
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password,
      role: 'student',
      joinDate: new Date().toISOString()
    };
    
    users.push(newUser);
    currentUser = newUser;
    
    saveToStorage();
    localStorage.setItem('dra_current_user', JSON.stringify(currentUser));
    
    showToast('Registration successful!', 'success');
    checkAuthState();
    navigateToPage('dashboard');
  });

  // Logout
  document.getElementById('logout-link').addEventListener('click', function(e) {
    e.preventDefault();
    currentUser = null;
    localStorage.removeItem('dra_current_user');
    showToast('Logged out successfully', 'success');
    checkAuthState();
    navigateToPage('home');
  });
}

function loadTestimonialsFromData() {
  const container = document.getElementById('testimonials-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  appData.testimonials.forEach(testimonial => {
    const testimonialCard = document.createElement('div');
    testimonialCard.className = 'testimonial-card';
    
    const stars = '★'.repeat(testimonial.rating) + '☆'.repeat(5 - testimonial.rating);
    
    testimonialCard.innerHTML = `
      <div class="testimonial-content">"${testimonial.content}"</div>
      <div class="testimonial-author">${testimonial.name}</div>
      <div class="testimonial-role">${testimonial.role}</div>
      <div class="testimonial-rating">
        <span class="star">${stars}</span>
      </div>
      <div class="testimonial-course">Course: ${testimonial.course}</div>
    `;
    
    container.appendChild(testimonialCard);
  });
}

function displayCourses() {
  const container = document.getElementById('courses-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  appData.courses.forEach(course => {
    const courseCard = document.createElement('div');
    courseCard.className = `course-card ${course.available ? 'available' : ''}`;
    courseCard.setAttribute('data-course-id', course.id);
    
    const statusText = course.available ? 'Available Now' : 'Coming Soon';
    const statusClass = course.available ? 'available' : 'coming-soon';
    const actionText = course.available ? 'View Details' : 'Consult for Query';
    
    courseCard.innerHTML = `
      <div class="course-card-body">
        <h3 class="course-title">${course.title}</h3>
        <p class="course-description">${course.description}</p>
        <div class="course-meta">
          <span class="course-duration">${course.duration}</span>
          <span class="course-level">${course.level}</span>
        </div>
        <div class="course-meta">
          <span class="course-price">₹${course.price.toLocaleString()}</span>
          <span class="course-status ${statusClass}">${statusText}</span>
        </div>
        <button class="btn ${course.available ? 'btn--primary' : 'btn--secondary'} btn--full-width course-action-btn">
          ${actionText}
        </button>
      </div>
    `;
    
    container.appendChild(courseCard);
  });
}

function setupCourseInteractions() {
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('course-action-btn')) {
      const courseCard = e.target.closest('.course-card');
      const courseId = parseInt(courseCard.getAttribute('data-course-id'));
      const course = appData.courses.find(c => c.id === courseId);
      
      if (course.available) {
        navigateToPage('course-detail', course);
      } else {
        showModal('Course Not Available', 
          `<p>${course.title} is coming soon!</p>
           <p>Please contact us for more information:</p>
           <p><strong>Email:</strong> info@datarhythmacademy.com</p>
           <p><strong>Phone:</strong> +91-9876543210</p>`,
          [{ text: 'Close', action: 'close' }]
        );
      }
    }
  });
}

function displayCourseDetail(course) {
  const container = document.getElementById('course-detail-content');
  if (!container) return;
  
  const stars = '★'.repeat(Math.floor(course.rating)) + (course.rating % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(course.rating));
  
  container.innerHTML = `
    <div class="course-detail">
      <div class="course-detail-header">
        <h1 class="course-detail-title">${course.title}</h1>
        <p class="course-description">${course.description}</p>
        <div class="course-rating">
          <span class="star">${stars}</span>
          <span>(${course.rating}) • ${course.students} students</span>
        </div>
      </div>
      
      <div class="course-detail-meta">
        <div class="detail-card">
          <h4>Duration</h4>
          <p>${course.duration}</p>
        </div>
        <div class="detail-card">
          <h4>Level</h4>
          <p>${course.level}</p>
        </div>
        <div class="detail-card">
          <h4>Price</h4>
          <p>₹${course.price.toLocaleString()}</p>
        </div>
        <div class="detail-card">
          <h4>Students</h4>
          <p>${course.students}</p>
        </div>
      </div>
      
      <div class="syllabus-section">
        <h3>What You'll Learn</h3>
        <div class="modules-list">
          ${course.modules.map(module => `<div class="module-item">${module}</div>`).join('')}
        </div>
      </div>
      
      <div class="instructor-section">
        <h3>Your Instructor</h3>
        <h4>${course.instructor}</h4>
        <p>${course.instructorBio}</p>
      </div>
      
      <div class="course-detail-meta">
        <div class="detail-card">
          <h4>Prerequisites</h4>
          <p>${course.prerequisites}</p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 2rem;">
        <button class="btn btn--primary btn--lg enroll-btn" data-course-id="${course.id}">
          Enroll Now - ₹${course.price.toLocaleString()}
        </button>
      </div>
    </div>
  `;
  
  // Add enroll button listener
  container.querySelector('.enroll-btn').addEventListener('click', function() {
    if (!currentUser) {
      showToast('Please login to enroll', 'error');
      navigateToPage('login');
      return;
    }
    
    // Check if already enrolled
    const alreadyEnrolled = enrolledCourses.find(ec => ec.userId === currentUser.id && ec.courseId === course.id);
    if (alreadyEnrolled) {
      showToast('You are already enrolled in this course', 'info');
      navigateToPage('dashboard');
      return;
    }
    
    navigateToPage('payment', course);
  });
}

function setupPaymentForm() {
  const paymentForm = document.getElementById('payment-form');
  if (!paymentForm) return;
  
  paymentForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!currentUser) {
      showToast('Please login to complete payment', 'error');
      return;
    }
    
    // Simulate payment processing
    showToast('Processing payment...', 'info');
    
    setTimeout(() => {
      const courseId = parseInt(paymentForm.getAttribute('data-course-id'));
      const course = appData.courses.find(c => c.id === courseId);
      
      // Create enrollment
      const enrollment = {
        id: enrolledCourses.length + 1,
        userId: currentUser.id,
        courseId: courseId,
        enrollmentDate: new Date().toISOString(),
        progress: 0,
        completedModules: []
      };
      
      enrolledCourses.push(enrollment);
      
      // Create payment record
      const payment = {
        id: payments.length + 1,
        userId: currentUser.id,
        courseId: courseId,
        amount: course.price,
        date: new Date().toISOString(),
        status: 'completed'
      };
      
      payments.push(payment);
      
      saveToStorage();
      
      showToast('Payment successful! You are now enrolled.', 'success');
      navigateToPage('dashboard');
    }, 2000);
  });
}

function displayPaymentPage(course) {
  const summaryContainer = document.getElementById('payment-course-summary');
  const paymentForm = document.getElementById('payment-form');
  
  if (!summaryContainer || !paymentForm) return;
  
  paymentForm.setAttribute('data-course-id', course.id);
  
  summaryContainer.innerHTML = `
    <h3>Course Summary</h3>
    <div class="course-summary-details">
      <h4>${course.title}</h4>
      <p>${course.description}</p>
      <div class="summary-meta">
        <p><strong>Duration:</strong> ${course.duration}</p>
        <p><strong>Level:</strong> ${course.level}</p>
        <p><strong>Instructor:</strong> ${course.instructor}</p>
      </div>
      <div class="price-breakdown">
        <div class="price-row">
          <span>Course Price:</span>
          <span>₹${course.price.toLocaleString()}</span>
        </div>
        <div class="price-row total">
          <span><strong>Total:</strong></span>
          <span><strong>₹${course.price.toLocaleString()}</strong></span>
        </div>
      </div>
    </div>
  `;
}

function displayDashboard() {
  const enrolledCoursesContainer = document.getElementById('enrolled-courses');
  if (!enrolledCoursesContainer || !currentUser) return;
  
  const userEnrollments = enrolledCourses.filter(ec => ec.userId === currentUser.id);
  
  if (userEnrollments.length === 0) {
    enrolledCoursesContainer.innerHTML = `
      <div class="no-courses">
        <p>You haven't enrolled in any courses yet.</p>
        <button class="btn btn--primary" onclick="navigateToPage('courses')">Browse Courses</button>
      </div>
    `;
    return;
  }
  
  enrolledCoursesContainer.innerHTML = '';
  
  userEnrollments.forEach(enrollment => {
    const course = appData.courses.find(c => c.id === enrollment.courseId);
    if (!course) return;
    
    const progress = enrollment.progress || 0;
    
    const courseDiv = document.createElement('div');
    courseDiv.className = 'enrolled-course';
    courseDiv.innerHTML = `
      <h3>${course.title}</h3>
      <p>${course.description}</p>
      <div class="course-progress">
        <div class="progress-info">
          <span>Progress: ${progress}%</span>
          <span>${enrollment.completedModules?.length || 0}/${course.modules.length} modules</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
      </div>
      <button class="btn btn--primary btn--sm" onclick="navigateToPage('course-content', ${course.id})">
        Continue Learning
      </button>
    `;
    
    enrolledCoursesContainer.appendChild(courseDiv);
  });
}

function setupContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;
  
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const button = contactForm.querySelector('.send-message-btn');
    const originalText = button.textContent;
    
    // Animate button on submit
    button.textContent = 'Sending...';
    button.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      button.textContent = 'Sent!';
      button.style.transform = 'scale(1)';
      showToast('Message sent successfully! We will get back to you soon.', 'success');
      
      setTimeout(() => {
        button.textContent = originalText;
        contactForm.reset();
      }, 1500);
    }, 1000);
  });
}

function setupAdminTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const targetTab = this.getAttribute('data-tab');
      
      // Remove active classes
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Add active classes
      this.classList.add('active');
      const targetContent = document.getElementById(`${targetTab}-tab`);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

function displayAdminPanel() {
  displayAdminUsers();
  displayAdminCourses();
  displayAdminAnalytics();
}

function displayAdminUsers() {
  const container = document.getElementById('users-list');
  if (!container) return;
  
  container.innerHTML = `
    <div class="users-table">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: var(--color-secondary); text-align: left;">
            <th style="padding: 12px; border: 1px solid var(--color-border);">Name</th>
            <th style="padding: 12px; border: 1px solid var(--color-border);">Email</th>
            <th style="padding: 12px; border: 1px solid var(--color-border);">Role</th>
            <th style="padding: 12px; border: 1px solid var(--color-border);">Join Date</th>
            <th style="padding: 12px; border: 1px solid var(--color-border);">Enrolled Courses</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(user => {
            const userEnrollments = enrolledCourses.filter(ec => ec.userId === user.id);
            return `
              <tr>
                <td style="padding: 12px; border: 1px solid var(--color-border);">${user.name}</td>
                <td style="padding: 12px; border: 1px solid var(--color-border);">${user.email}</td>
                <td style="padding: 12px; border: 1px solid var(--color-border);">${user.role}</td>
                <td style="padding: 12px; border: 1px solid var(--color-border);">${new Date(user.joinDate).toLocaleDateString()}</td>
                <td style="padding: 12px; border: 1px solid var(--color-border);">${userEnrollments.length}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function displayAdminCourses() {
  const container = document.getElementById('admin-courses-list');
  if (!container) return;
  
  container.innerHTML = `
    <div class="admin-courses-grid">
      ${appData.courses.map(course => {
        const enrollmentCount = enrolledCourses.filter(ec => ec.courseId === course.id).length;
        return `
          <div class="admin-course-card" style="background: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid rgba(59, 130, 246, 0.1);">
            <h4>${course.title}</h4>
            <p><strong>Status:</strong> ${course.available ? 'Available' : 'Coming Soon'}</p>
            <p><strong>Price:</strong> ₹${course.price.toLocaleString()}</p>
            <p><strong>Enrollments:</strong> ${enrollmentCount}</p>
            <p><strong>Level:</strong> ${course.level}</p>
            <button class="btn btn--secondary btn--sm">Edit Course</button>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function displayAdminAnalytics() {
  const totalUsersEl = document.getElementById('total-users');
  const totalEnrollmentsEl = document.getElementById('total-enrollments');
  const totalRevenueEl = document.getElementById('total-revenue');
  
  if (totalUsersEl) {
    const totalUsers = users.filter(u => u.role === 'student').length;
    totalUsersEl.textContent = totalUsers;
  }
  
  if (totalEnrollmentsEl) {
    totalEnrollmentsEl.textContent = enrolledCourses.length;
  }
  
  if (totalRevenueEl) {
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    totalRevenueEl.textContent = `₹${totalRevenue.toLocaleString()}`;
  }
}

function setupModalAndToast() {
  // Modal close functionality
  const modalClose = document.getElementById('modal-close');
  const modalBackdrop = modal?.querySelector('.modal-backdrop');
  
  if (modalClose) {
    modalClose.addEventListener('click', hideModal);
  }
  
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', hideModal);
  }
  
  // Toast close functionality
  const toastClose = document.getElementById('toast-close');
  if (toastClose) {
    toastClose.addEventListener('click', hideToast);
  }
}

function showToast(message, type = 'info') {
  if (!toast) return;
  
  const toastMessage = document.getElementById('toast-message');
  if (toastMessage) {
    toastMessage.textContent = message;
  }
  
  // Reset classes
  toast.className = 'toast';
  
  // Add type class and set background color
  if (type === 'error') {
    toast.style.background = '#ef4444';
  } else if (type === 'success') {
    toast.style.background = '#22c55e';
  } else {
    toast.style.background = '#3b82f6';
  }
  
  // Show toast
  toast.classList.add('show');
  
  // Auto-hide after 5 seconds
  setTimeout(hideToast, 5000);
}

function hideToast() {
  if (toast) {
    toast.classList.remove('show');
  }
}

function showModal(title, content, actions = []) {
  if (!modal) return;
  
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  const actionsContainer = document.getElementById('modal-actions');
  
  if (titleEl) titleEl.textContent = title;
  if (bodyEl) bodyEl.innerHTML = content;
  
  if (actionsContainer) {
    actionsContainer.innerHTML = '';
    
    actions.forEach(action => {
      const button = document.createElement('button');
      button.className = `btn btn--${action.type || 'secondary'}`;
      button.textContent = action.text;
      
      if (action.action === 'close') {
        button.addEventListener('click', hideModal);
      } else if (action.callback) {
        button.addEventListener('click', action.callback);
      }
      
      actionsContainer.appendChild(button);
    });
  }
  
  modal.classList.remove('hidden');
}

function hideModal() {
  if (modal) {
    modal.classList.add('hidden');
  }
}

function saveToStorage() {
  try {
    localStorage.setItem('dra_users', JSON.stringify(users));
    localStorage.setItem('dra_enrolled_courses', JSON.stringify(enrolledCourses));
    localStorage.setItem('dra_payments', JSON.stringify(payments));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// Course Content Functions
function displayCourseContent(courseId) {
  const course = appData.courses.find(c => c.id === courseId);
  const enrollment = enrolledCourses.find(ec => ec.userId === currentUser.id && ec.courseId === courseId);
  
  if (!course || !enrollment) {
    showToast('Course not found or not enrolled', 'error');
    navigateToPage('dashboard');
    return;
  }
  
  const container = document.getElementById('course-content-detail');
  if (!container) return;
  
  container.innerHTML = `
    <div class="course-content">
      <h1>${course.title}</h1>
      <div class="content-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${enrollment.progress || 0}%"></div>
        </div>
        <span>${enrollment.progress || 0}% Complete</span>
      </div>
      
      <div class="content-modules">
        <h2>Course Modules</h2>
        ${course.modules.map((module, index) => `
          <div class="module-item ${(enrollment.completedModules || []).includes(index) ? 'completed' : ''}">
            <h3>Module ${index + 1}: ${module}</h3>
            <div class="module-content">
              <div class="video-section">
                <h4>Video Lecture</h4>
                <div class="video-placeholder">
                  <p>YouTube video would be embedded here</p>
                  <p>Video: ${module} - Part 1</p>
                </div>
              </div>
              <div class="materials-section">
                <h4>Course Materials</h4>
                <ul>
                  <li><a href="#" target="_blank">${module} - Slides.pdf</a></li>
                  <li><a href="#" target="_blank">${module} - Notes.pdf</a></li>
                  <li><a href="#" target="_blank">${module} - Exercises.pdf</a></li>
                </ul>
              </div>
            </div>
            ${!(enrollment.completedModules || []).includes(index) ? 
              `<button class="btn btn--primary complete-module-btn" data-module="${index}">Mark as Complete</button>` :
              `<span class="module-completed">✓ Completed</span>`
            }
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  // Add complete module listeners
  container.querySelectorAll('.complete-module-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const moduleIndex = parseInt(this.getAttribute('data-module'));
      completeModule(enrollment, moduleIndex);
    });
  });
}

function completeModule(enrollment, moduleIndex) {
  if (!enrollment.completedModules) enrollment.completedModules = [];
  
  if (!enrollment.completedModules.includes(moduleIndex)) {
    enrollment.completedModules.push(moduleIndex);
    
    const course = appData.courses.find(c => c.id === enrollment.courseId);
    enrollment.progress = Math.round((enrollment.completedModules.length / course.modules.length) * 100);
    
    saveToStorage();
    showToast('Module completed!', 'success');
    
    // Refresh content
    displayCourseContent(enrollment.courseId);
  }
}

// Utility Functions
function generateId() {
  return Date.now() + Math.random().toString(36).substr(2, 9);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    // App is already initialized in the main DOMContentLoaded listener above
  });
} else {
  // DOM is already loaded
  initializeApp();
  setupEventListeners();
  loadTestimonialsFromData();
  displayCourses();
  checkAuthState();
}
