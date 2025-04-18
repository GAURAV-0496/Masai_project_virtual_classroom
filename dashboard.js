// DOM elements
const userGreeting = document.getElementById('user-greeting');
const dateDisplay = document.getElementById('date-display');
const calendarDays = document.getElementById('calendar-days');
const currentMonthElement = document.getElementById('current-month');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const upcomingClassesList = document.getElementById('upcoming-classes-list');
const classDetailsModal = document.getElementById('class-details-modal');
const closeModalBtn = document.querySelector('.close-modal');

// Calendar variables
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let classes = [];

// Initialize Firestore
const db = firebase.firestore();

// Handle authentication state
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        console.log('User is signed in:', user.uid);
        // Update user display
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay) {
            usernameDisplay.textContent = user.displayName || user.email.split('@')[0];
        }
        if (userGreeting) {
            userGreeting.textContent = user.displayName || user.email.split('@')[0];
        }
        initHomepage();
    } else {
        // User is signed out
        console.log('User is signed out');
        window.location.href = 'index.html';
    }
});

// Handle logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await firebase.auth().signOut();
            // The onAuthStateChanged listener will handle the redirect
        } catch (error) {
            console.error('Error signing out:', error);
            alert('Error signing out. Please try again.');
        }
    });
}

// Test Firebase Connection
async function testFirebaseConnection() {
    try {
        // Try to write a test document
        const testRef = await db.collection('test').add({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            message: 'Testing Firebase connection'
        });
        
        // Try to read the test document
        const doc = await testRef.get();
        if (doc.exists) {
            console.log('Firebase connection successful!');
            // Clean up the test document
            await testRef.delete();
        } else {
            console.error('Firebase test document not found');
        }
    } catch (error) {
        console.error('Firebase connection error:', error);
        alert('Error connecting to Firebase. Please check your configuration and internet connection.');
    }
}

// Initialize homepage
async function initHomepage() {
    // Test Firebase connection first
    await testFirebaseConnection();

    // Set user greeting
    const user = firebase.auth().currentUser;
    if (user) {
        const displayName = user.displayName || user.email.split('@')[0];
        userGreeting.textContent = displayName;

        // Format and display current date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.textContent = new Date().toLocaleDateString(undefined, options);
    }

    // Load classes from Firestore
    await loadClasses();

    // Initialize calendar
    renderCalendar(currentMonth, currentYear);

    // Set up event listeners
    setupEventListeners();
}

// Load classes from Firestore
async function loadClasses() {
    try {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) {
            console.log('No authenticated user');
            return;
        }

        const classesSnapshot = await db.collection('classes')
            .where('createdBy', '==', currentUser.uid)
            .orderBy('dateTime', 'asc')
            .get();
            
        classes = [];
        
        classesSnapshot.forEach(doc => {
            const classData = doc.data();
            classes.push({
                id: doc.id,
                ...classData,
                dateTime: classData.dateTime.toDate()
            });
        });

        // Update calendar and class lists
        renderCalendar(currentMonth, currentYear);
        renderClassLists();
    } catch (error) {
        console.error("Error loading classes:", error);
        alert("Error loading classes. Please try again.");
    }
}

// Save class to Firestore
async function saveClass(classData) {
    try {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) {
            throw new Error('User not authenticated');
        }

        const classRef = await db.collection('classes').add({
            ...classData,
            dateTime: firebase.firestore.Timestamp.fromDate(classData.dateTime),
            createdBy: currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return classRef.id;
    } catch (error) {
        console.error("Error saving class:", error);
        throw error;
    }
}

// Delete class from Firestore
async function deleteClass(classId) {
    try {
        if (confirm('Are you sure you want to delete this class?')) {
            const currentUser = firebase.auth().currentUser;
            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            // Delete from Firestore
            await db.collection('classes').doc(classId).delete();
            
            // Remove from local array
            classes = classes.filter(classItem => classItem.id !== classId);
            
            // Update UI
            renderCalendar(currentMonth, currentYear);
            renderClassLists();
            
            // Close any open modals
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.style.display = 'none';
            });

            alert('Class deleted successfully');
        }
    } catch (error) {
        console.error("Error deleting class:", error);
        alert("Error deleting class. Please try again.");
    }
}

// Render calendar
function renderCalendar(month, year) {
    // Set current month display
    currentMonthElement.textContent = new Date(year, month).toLocaleDateString('default', {
        month: 'long',
        year: 'numeric'
    });

    // Get first day of month and total days in month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Clear previous calendar days
    calendarDays.innerHTML = '';

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarDays.appendChild(emptyDay);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';

        // Check if today
        const today = new Date();
        if (date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()) {
            dayElement.classList.add('today');
        }

        // Check if has classes
        const dayClasses = getClassesForDate(date);
        if (dayClasses.length > 0) {
            dayElement.classList.add('has-class');
            dayElement.style.backgroundColor = 'orange';  // Highlight with orange color
        }

        // Add day number
        const dayNumber = document.createElement('div');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);

        // Add class indicators
        if (dayClasses.length > 0) {
            const classIndicators = document.createElement('div');
            classIndicators.className = 'calendar-day-classes';

            // Show first 2 class titles
            const titlesToShow = dayClasses.slice(0, 2).map(c => c.title);
            if (dayClasses.length > 2) {
                titlesToShow.push(`${dayClasses.length - 2} more`);
            }
            classIndicators.textContent = titlesToShow.join(', ');

            dayElement.appendChild(classIndicators);
        }

        // Add click event to show classes for this day
        dayElement.addEventListener('click', () => {
            if (dayClasses.length > 0) {
                showClassesForDate(date, dayClasses);
            }
        });

        calendarDays.appendChild(dayElement);
    }
}

// Get classes for a specific date
function getClassesForDate(date) {
    return classes.filter(classItem => {
        const classDate = classItem.dateTime;
        return classDate.getDate() === date.getDate() &&
            classDate.getMonth() === date.getMonth() &&
            classDate.getFullYear() === date.getFullYear();
    });
}

// Render upcoming class list
function renderClassLists() {
    const now = new Date();

    // Filter upcoming classes (including those happening now)
    const upcomingClasses = classes.filter(classItem => classItem.dateTime >= now);

    // Render upcoming classes
    upcomingClassesList.innerHTML = '';
    if (upcomingClasses.length === 0) {
        upcomingClassesList.innerHTML = '<div class="no-classes">No upcoming classes scheduled</div>';
    } else {
        upcomingClasses.slice(0, 3).forEach(classItem => {
            upcomingClassesList.appendChild(createClassCard(classItem));
        });
    }
}

// Create a class card element
function createClassCard(classItem) {
    const classCard = document.createElement('div');
    classCard.className = 'class-card upcoming';
    classCard.dataset.id = classItem.id;

    const dateTime = new Date(classItem.dateTime);
    const timeString = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = dateTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

    classCard.innerHTML = `
        <div class="class-card-header">
            <div class="class-card-title">${classItem.title}</div>
            <div class="class-card-time">${dateString} · ${timeString}</div>
        </div>
        <div class="class-card-instructor">Instructor: ${classItem.instructor}</div>
        <div class="class-card-actions">
            <button class="btn-primary view-details-btn" data-id="${classItem.id}">
                <i class="fas fa-info-circle"></i> Details
            </button>
            <button class="btn-danger delete-class-btn" data-id="${classItem.id}">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;

    // Add delete button event listener
    const deleteBtn = classCard.querySelector('.delete-class-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteClass(classItem.id);
        });
    }

    // Add view details button event listener
    const viewDetailsBtn = classCard.querySelector('.view-details-btn');
    if (viewDetailsBtn) {
        viewDetailsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showClassDetails(classItem);
        });
    }

    return classCard;
}

// Show class details in modal
function showClassDetails(classItem) {
    const modalTitle = document.getElementById('modal-class-title');
    const modalDate = document.getElementById('modal-class-date');
    const modalTime = document.getElementById('modal-class-time');
    const modalInstructor = document.getElementById('modal-class-instructor');
    const modalLink = document.getElementById('modal-class-link');
    const modalDescription = document.getElementById('modal-class-description');
    const joinClassBtn = document.getElementById('join-class-modal-btn');
    const viewMaterialsBtn = document.getElementById('view-materials-modal-btn');

    // Set modal content
    modalTitle.textContent = classItem.title;
    modalDate.textContent = classItem.dateTime.toLocaleDateString([], {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    modalTime.textContent = classItem.dateTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
    modalInstructor.textContent = classItem.instructor;
    modalLink.href = `video.html?classId=${classItem.id}`;
    modalDescription.textContent = classItem.description || 'No description provided.';

    // Add delete button to modal
    const modalActions = document.querySelector('.modal-actions');
    // Remove existing delete button if any
    const existingDeleteBtn = modalActions.querySelector('.btn-danger');
    if (existingDeleteBtn) {
        existingDeleteBtn.remove();
    }
    // Add new delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-danger';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete Class';
    deleteBtn.onclick = () => deleteClass(classItem.id);
    modalActions.appendChild(deleteBtn);

    // Show modal
    const classDetailsModal = document.getElementById('class-details-modal');
    classDetailsModal.style.display = 'block';
}

// Show classes for a specific date
function showClassesForDate(date, dayClasses) {
    // Create a modal or popup to display all classes for this date
    alert(`Classes on ${date.toLocaleDateString()}:\n\n${
        dayClasses.map(c => `• ${c.title} (${c.dateTime.toLocaleTimeString()})`).join('\n')
    }`);
}

// Show all upcoming classes in a modal
function showAllUpcomingClasses() {
    const now = new Date();
    const upcomingClasses = classes.filter(classItem => classItem.dateTime >= now);
    
    if (upcomingClasses.length === 0) {
        alert('No upcoming classes scheduled');
        return;
    }

    // Create modal content
    let modalContent = '<div class="all-classes-modal">';
    modalContent += '<h3>All Upcoming Classes</h3>';
    modalContent += '<div class="all-classes-list">';
    
    upcomingClasses.forEach(classItem => {
        const dateTime = new Date(classItem.dateTime);
        const timeString = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateString = dateTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
        
        modalContent += `
            <div class="all-class-item" data-id="${classItem.id}">
                <div class="all-class-header">
                    <h4>${classItem.title}</h4>
                    <span class="all-class-time">${dateString} · ${timeString}</span>
                </div>
                <div class="all-class-instructor">Instructor: ${classItem.instructor}</div>
                <div class="all-class-actions">
                    <button class="btn btn-sm" onclick="showClassDetails(${JSON.stringify(classItem).replace(/"/g, '&quot;')})">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                    <button class="btn btn-sm delete-class-btn" data-id="${classItem.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    });
    
    modalContent += '</div></div>';

    // Create and show modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            ${modalContent}
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';

    // Add event listeners
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => {
        modal.remove();
    };

    // Close modal when clicking outside
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    };

    // Add delete button event listeners
    const deleteButtons = modal.querySelectorAll('.delete-class-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const classId = button.dataset.id;
            deleteClass(classId);
            modal.remove();
        });
    });
}

// Set up event listeners
function setupEventListeners() {
    // Month navigation
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar(currentMonth, currentYear);
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar(currentMonth, currentYear);
        });
    }

    // Schedule Class Button
    const scheduleClassBtn = document.getElementById('schedule-class-btn');
    const scheduleClassModal = document.getElementById('schedule-class-modal');
    const scheduleClassForm = document.getElementById('schedule-class-form');
    const cancelScheduleBtn = document.getElementById('cancel-schedule');

    if (scheduleClassBtn) {
        scheduleClassBtn.addEventListener('click', () => {
            if (scheduleClassModal) {
                scheduleClassModal.style.display = 'block';
            }
        });
    }

    // Close modal buttons
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (scheduleClassModal) {
                scheduleClassModal.style.display = 'none';
            }
            if (classDetailsModal) {
                classDetailsModal.style.display = 'none';
            }
        });
    });

    // Cancel Schedule Button
    if (cancelScheduleBtn) {
        cancelScheduleBtn.addEventListener('click', () => {
            if (scheduleClassModal) {
                scheduleClassModal.style.display = 'none';
            }
        });
    }

    // Schedule Class Form
    if (scheduleClassForm) {
        scheduleClassForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('class-title').value;
            const date = document.getElementById('class-date').value;
            const time = document.getElementById('class-time').value;
            const duration = parseInt(document.getElementById('class-duration').value) || 60;
            const description = document.getElementById('class-description').value;

            if (!title || !date || !time) {
                alert('Please fill in all required fields');
                return;
            }

            // Check if user is authenticated
            const currentUser = firebase.auth().currentUser;
            if (!currentUser) {
                alert('Please login to schedule a class');
                window.location.href = 'login.html';
                return;
            }

            // Create class object
            const newClass = {
                title,
                dateTime: new Date(`${date}T${time}`),
                duration,
                description,
                instructor: localStorage.getItem('username') || 'Unknown Instructor',
                createdBy: currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            try {
                // Save to Firestore
                await saveClass(newClass);
                
                // Close modal and reset form
                if (scheduleClassModal) {
                    scheduleClassModal.style.display = 'none';
                }
                scheduleClassForm.reset();
                
                // Refresh calendar and class lists
                await loadClasses();
            } catch (error) {
                console.error("Error scheduling class:", error);
                alert("Error scheduling class. Please try again.");
            }
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (scheduleClassModal && event.target === scheduleClassModal) {
            scheduleClassModal.style.display = 'none';
        }
        if (classDetailsModal && event.target === classDetailsModal) {
            classDetailsModal.style.display = 'none';
        }
    });

    // View All Upcoming Classes Button
    const viewAllUpcomingBtn = document.getElementById('view-all-upcoming');
    if (viewAllUpcomingBtn) {
        viewAllUpcomingBtn.addEventListener('click', showAllUpcomingClasses);
    }
}

// Initialize the homepage
initHomepage();