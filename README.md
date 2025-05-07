# Masai_project_virtual_classroom
Virtual Classroom
🌐 Live Demo → https://splendorous-sprinkles-6c88e3.netlify.app/

A simple, interactive, real-time virtual classroom built using HTML, CSS, and JavaScript. This platform allows instructors and students to communicate via video, text chat, and collaborate on assignments, all from a web browser. The app is fully responsive and provides an engaging experience for online learning.

🚀 Project Goal
The goal of this project is to create a web-based virtual classroom where instructors and students can interact in real time. The platform will allow users to join live video sessions, participate in text-based chats, share content, and collaborate on assignments. It is built using only HTML, CSS, and JavaScript to keep the project simple and easy to use, with no additional frameworks or libraries.

🌟 Features
1. Live Video & Audio Conferencing
Real-time video and audio communication using WebRTC.

Instructors and students can join the classroom session for face-to-face interaction.

2. Text-Based Chat
Real-time messaging between students and instructors.

Group chat for class-wide discussions and private chat for one-on-one communication.

3. Classroom Controls
Mute/Unmute: Controls for both video and audio to minimize distractions.

Camera Toggle: Ability to turn the webcam on/off.

4. Assignment Submissions (Future Enhancement)
Students can upload assignments directly to the platform.

Instructors can review and comment on submissions.

5. Responsive Design
The platform is mobile-friendly, offering an optimized experience across desktop, tablet, and mobile devices.

Touch-friendly navigation, video controls, and chat features.

🛠️ Technologies Used
Frontend:

HTML5 for the structure of the platform.

CSS3 for styling and layout.

JavaScript for the interactive functionality (including WebRTC for video calls).

WebRTC: For real-time video/audio communication between students and instructors.

LocalStorage: To keep the user's session alive (i.e., remember user details or preferences across sessions).

📁 Project Structure
plaintext
Copy
Edit
├── index.html             # Main entry point for the virtual classroom platform (landing page)
├── signup.html            # User signup page
├── dashboard.html         # Dashboard page for logged-in users (students/instructors)
├── plan.html              # Page for course plan or curriculum details
├── firebase-config.js     # Configuration file for Firebase authentication and database
├── app.js                 # Main JavaScript file for handling user interactions and logic
├── dashboard.js           # JavaScript for managing the dashboard features
├── plan.js                # JavaScript file for handling the course plan and related actions
├── style.css              # Global styles for the platform
├── dashboard.css          # Styles specific to the dashboard page
├── plan.css               # Styles specific to the course plan page
├── README.md              # Project documentation
└── LICENSE                # License file (e.g., MIT License)
File Descriptions:
HTML Files:

index.html: The main landing page of your Virtual Classroom platform.

signup.html: The user signup page where users can register for the platform.

dashboard.html: The user dashboard page, which is likely to show the live classroom or the student’s profile and details.

plan.html: The page where the instructor can show course plans, curriculum, or lesson schedules.

JavaScript Files:

firebase-config.js: Contains the Firebase configuration for authentication, database, etc.

app.js: The main JavaScript file that handles core logic for the platform.

dashboard.js: Manages features and interactions specific to the dashboard.

plan.js: Handles interactions related to the course plan, such as fetching and displaying lesson schedules.

CSS Files:

style.css: Global styles that apply to the whole platform.

dashboard.css: Styles specific to the dashboard.

plan.css: Styles specific to the course plan or curriculum page.

👤 User Flow Diagram

👥 Roles
1. Student
Sign up / Log in → Join live classroom → Participate in video/audio call.

View lesson content → Ask questions via chat → Submit assignments.

Participate in breakout sessions (future enhancement).

2. Instructor
Sign up / Log in → Start a live classroom session → Share lesson content.

Manage student participation → View submitted assignments (future feature).

Create polls and quizzes (future enhancement).

3. Admin (if integrated later)
Manage user accounts (students and instructors)

Monitor live classroom sessions

Access reports and analytics on class attendance and performance

💡 How to Run Locally
Clone the repository:

bash
Copy
Edit
git clone https://github.com/your-username/virtual-classroom.git
Navigate into the project directory:

bash
Copy
Edit
cd virtual-classroom
Open the index.html file in your browser to see the platform in action.

bash
Copy
Edit
start index.html  # On Windows
open index.html   # On macOS/Linux
Enjoy the Virtual Classroom!
