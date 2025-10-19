// 🎯 Dynamic Payment Examples - How Different Courses Trigger Different Amounts

// Example 1: Student clicks "Enroll Now" on Python Course (₹1,000)
const pythonCourse = {
  id: 'python-course-1',
  title: 'Introduction to Python',
  price: 1000,
  currency: '₹'
};

// Payment flow automatically calculates:
const pythonPayment = {
  baseAmount: 1000,           // Course price
  gstAmount: 180,             // 18% GST = 1000 * 0.18
  totalAmount: 1180,          // Final amount sent to Razorpay
  razorpayAmount: 118000      // Amount in paise (1180 * 100)
};

// Example 2: Student clicks "Enroll Now" on React Course (₹2,999)
const reactCourse = {
  id: 'react-course-1',
  title: 'React & TypeScript Masterclass',
  price: 2999,
  currency: '₹'
};

// Payment flow automatically calculates:
const reactPayment = {
  baseAmount: 2999,           // Course price
  gstAmount: 540,             // 18% GST = 2999 * 0.18 = 539.82 (rounded to 540)
  totalAmount: 3539,          // Final amount sent to Razorpay
  razorpayAmount: 353900      // Amount in paise (3539 * 100)
};

// Example 3: Student clicks "Enroll Now" on Full Stack Course (₹1,250)
const fullStackCourse = {
  id: 'fullstack-course-1',
  title: 'Full Stack Development Bootcamp',
  price: 1250,
  currency: '₹'
};

// Payment flow automatically calculates:
const fullStackPayment = {
  baseAmount: 1250,           // Course price
  gstAmount: 225,             // 18% GST = 1250 * 0.18
  totalAmount: 1475,          // Final amount sent to Razorpay
  razorpayAmount: 147500      // Amount in paise (1475 * 100)
};

// ========================================
// 🔄 How the Dynamic Flow Works
// ========================================

// Step 1: User clicks "Enroll Now" on ANY course
function handleEnrollClick(course) {
  // Course object contains dynamic price
  console.log(`Enrolling in: ${course.title}`);
  console.log(`Course Price: ₹${course.price}`);
  
  // Step 2: Payment hook processes with course-specific amount
  processPayment({
    courseId: course.id,
    courseTitle: course.title,
    amount: course.price,        // 🎯 This is DYNAMIC per course
    userId: user.id,
    userEmail: user.email,
    userName: user.displayName
  });
}

// Step 3: Payment processing with dynamic calculation
async function processPayment({ amount, courseId, courseTitle, userId }) {
  // Calculate total with GST (dynamic based on course price)
  const { totalAmount, taxAmount } = calculateTotalAmount(amount);
  
  console.log(`Processing payment for ${courseTitle}:`);
  console.log(`Base Amount: ₹${amount}`);
  console.log(`GST (18%): ₹${taxAmount}`);
  console.log(`Total: ₹${totalAmount}`);
  
  // Step 4: Send to Razorpay with calculated amount
  const razorpayOptions = {
    key: 'rzp_test_11111111111111',
    amount: totalAmount * 100,    // 🎯 Dynamic amount in paise
    currency: 'INR',
    name: 'Data Rhythm Academy',
    description: `Payment for ${courseTitle}`, // 🎯 Dynamic description
    handler: function(response) {
      // Step 5: Enroll user with payment details
      enrollInCourse(userId, courseId, {
        paymentId: response.razorpay_payment_id,
        amount: totalAmount,      // 🎯 Dynamic amount stored
        course: courseTitle,      // 🎯 Dynamic course info
        paymentMethod: 'razorpay'
      });
    }
  };
  
  const razorpay = new Razorpay(razorpayOptions);
  razorpay.open();
}

// ========================================
// 📊 Payment Analytics (Dynamic Tracking)
// ========================================

// Each course payment is tracked with specific amounts
function trackCoursePayment(courseId, courseTitle, amount, paymentId) {
  analytics.track('Payment Completed', {
    courseId,           // python-course-1, react-course-1, etc.
    courseTitle,        // Dynamic course name
    amount,             // Dynamic amount (1000, 2999, 1250, etc.)
    paymentId,          // Razorpay payment ID
    currency: 'INR',
    timestamp: new Date(),
    method: 'razorpay'
  });
}

// ========================================
// 💡 Key Points About Dynamic Pricing
// ========================================

/*
✅ WHAT'S DYNAMIC:
- Course prices (₹1,000, ₹2,999, ₹1,250, etc.)
- GST calculation (18% of each course price)
- Total amount sent to Razorpay
- Payment descriptions and metadata
- Enrollment records with specific amounts

✅ WHAT STAYS SAME:
- Razorpay configuration (key, currency, etc.)
- Payment flow logic
- GST rate (18%)
- Success/failure handling

✅ USER EXPERIENCE:
- User sees: "Enroll Now - ₹1,000" for Python course
- User sees: "Enroll Now - ₹2,999" for React course
- User sees: "Enroll Now - ₹1,250" for Full Stack course
- Payment popup shows exact amount with GST breakdown
- Each course enrollment is tracked separately

✅ FIREBASE STORAGE:
- Each enrollment record stores course-specific payment amount
- Revenue tracking per course
- Student payment history with course details
*/

export {
  pythonPayment,
  reactPayment,
  fullStackPayment,
  handleEnrollClick,
  processPayment,
  trackCoursePayment
};