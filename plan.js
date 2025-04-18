// Video Conference Functionality
let micOn = false;
let stream = null;
let screenShareActive = false;
let cameraOn = false;

function addVideoStream(id, name, isTeacher = false) {
  const videoGrid = document.getElementById("videoGrid");
  
  const videoBox = document.createElement('div');
  videoBox.className = 'video-box';
  videoBox.id = `${id}Box`;
  
  const videoElement = document.createElement('video');
  videoElement.id = id;
  videoElement.autoplay = true;
  videoElement.playsInline = true;
  
  const videoLabel = document.createElement('div');
  videoLabel.className = 'video-label';
  videoLabel.innerHTML = `<i class="fas ${isTeacher ? 'fa-chalkboard-teacher' : 'fa-user-graduate'}"></i> <span>${name}</span>`;
  
  videoBox.appendChild(videoElement);
  videoBox.appendChild(videoLabel);
  videoGrid.appendChild(videoBox);
}

function removeVideoStream(id) {
  const videoBox = document.getElementById(`${id}Box`);
  if (videoBox) {
    videoBox.remove();
  }
}

// Whiteboard Functionality
const canvas = document.getElementById("whiteboard");
const ctx = canvas.getContext("2d");
let painting = false;
let paths = [];
let undonePaths = [];
let isEraser = false;

function resizeCanvas() {
  const container = canvas.parentElement;
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight - 50; // Account for tools bar
  redraw();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', finishedPosition);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('touchstart', handleTouch);
canvas.addEventListener('touchend', finishedPosition);
canvas.addEventListener('touchmove', handleTouch);

function handleTouch(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent(
    e.type === 'touchstart' ? 'mousedown' : 'mousemove',
    {
      clientX: touch.clientX,
      clientY: touch.clientY
    }
  );
  canvas.dispatchEvent(mouseEvent);
}

function startPosition(e) {
  painting = true;
  draw(e);
}

function finishedPosition() {
  painting = false;
  ctx.beginPath();
  paths.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
}

function draw(e) {
  if (!painting) return;
  
  ctx.lineWidth = document.getElementById("brushSize").value;
  ctx.lineCap = 'round';
  
  if (isEraser) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = document.getElementById("colorPicker").value;
  }
  
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function clearBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  paths = [];
  undonePaths = [];
}

function undo() {
  if (paths.length > 0) {
    undonePaths.push(paths.pop());
    redraw();
  }
}

function redo() {
  if (undonePaths.length > 0) {
    paths.push(undonePaths.pop());
    redraw();
  }
}

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (paths.length > 0) {
    ctx.putImageData(paths[paths.length - 1], 0, 0);
  }
}

function toggleEraser() {
  isEraser = !isEraser;
  const eraserBtn = document.getElementById("eraserBtn");
  if (isEraser) {
    eraserBtn.classList.add('active');
    eraserBtn.innerHTML = '<i class="fas fa-pencil-alt"></i> Pencil';
  } else {
    eraserBtn.classList.remove('active');
    eraserBtn.innerHTML = '<i class="fas fa-eraser"></i> Eraser';
  }
}

// Chat Functionality
function sendMessage(e) {
  if (e && e.key !== 'Enter') return;
  
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  
  if (message) {
    addMessage(message, 'sent');
    input.value = '';
    
    // Simulate received message after a delay
    setTimeout(() => {
      addMessage("Thanks for your message!", 'received');
    }, 1000);
  }
}

function addMessage(text, type) {
  const chatBox = document.getElementById("chatBox");
  const message = document.createElement('div');
  message.className = `message ${type}`;
  message.textContent = text;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addSystemMessage(text) {
  const chatBox = document.getElementById("chatBox");
  const message = document.createElement('div');
  message.className = 'message system';
  message.textContent = text;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function openFilePicker() {
  document.getElementById("fileInput").click();
}

function shareFile() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  
  if (file) {
    addSystemMessage(`File shared: ${file.name}`);
    fileInput.value = '';
  }
}

// Invite and Join Functionality
let currentClassroomId = generateClassroomId();
let participants = new Map();

function generateClassroomId() {
  return Math.random().toString(36).substring(2, 15);
}

function generateInviteLink() {
  const baseUrl = window.location.origin;
  return `${baseUrl}/classroom/${currentClassroomId}`;
}

function showInviteModal() {
  const modal = document.getElementById('inviteModal');
  const inviteLink = document.getElementById('inviteLink');
  inviteLink.value = generateInviteLink();
  modal.style.display = 'flex';
}

function hideInviteModal() {
  const modal = document.getElementById('inviteModal');
  modal.style.display = 'none';
}

function showJoinModal() {
  const modal = document.getElementById('joinModal');
  modal.style.display = 'flex';
}

function hideJoinModal() {
  const modal = document.getElementById('joinModal');
  modal.style.display = 'none';
}

function copyInviteLink() {
  const inviteLink = document.getElementById('inviteLink');
  inviteLink.select();
  document.execCommand('copy');
  alert('Invite link copied to clipboard!');
}

function shareViaEmail() {
  const inviteLink = generateInviteLink();
  const subject = 'Join my Virtual Classroom';
  const body = `Join my virtual classroom using this link: ${inviteLink}`;
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function shareViaWhatsApp() {
  const inviteLink = generateInviteLink();
  const text = `Join my virtual classroom using this link: ${inviteLink}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
}

function joinClassroom() {
  const joinLink = document.getElementById('joinLink').value;
  const userName = document.getElementById('userName').value;
  
  if (!joinLink || !userName) {
    alert('Please enter both the invite link and your name');
    return;
  }

  const classroomId = joinLink.split('/').pop();
  if (classroomId === currentClassroomId) {
    // Joining as a participant
    addParticipant(userName);
    hideJoinModal();
  } else {
    // Joining a different classroom
    window.location.href = joinLink;
  }
}

function addParticipant(name) {
  const participantId = 'participant-' + Date.now();
  participants.set(participantId, {
    name,
    video: null,
    audio: null,
    micEnabled: false,
    camEnabled: false
  });

  // Add participant to the video grid
  const videoGrid = document.getElementById('videoGrid');
  const videoBox = document.createElement('div');
  videoBox.className = 'video-box';
  videoBox.id = participantId;
  
  const video = document.createElement('video');
  video.autoplay = true;
  video.playsInline = true;
  
  const videoLabel = document.createElement('div');
  videoLabel.className = 'video-label';
  videoLabel.innerHTML = `<i class="fas fa-user"></i> <span>${name}</span>`;
  
  // Add student controls
  const controls = document.createElement('div');
  controls.className = 'video-controls';
  controls.innerHTML = `
    <button class="control-btn" onclick="toggleStudentMic('${participantId}')">
      <i class="fas fa-microphone"></i>
    </button>
    <button class="control-btn" onclick="toggleStudentCam('${participantId}')">
      <i class="fas fa-video"></i>
    </button>
    <button class="control-btn" onclick="toggleStudentScreenShare('${participantId}')">
      <i class="fas fa-share-square"></i>
    </button>
    <button class="control-btn danger" onclick="leaveStudentCall('${participantId}')">
      <i class="fas fa-phone-slash"></i>
    </button>
  `;
  
  videoBox.appendChild(video);
  videoBox.appendChild(videoLabel);
  videoBox.appendChild(controls);
  videoGrid.appendChild(videoBox);

  // Add participant to the participants list
  const participantsList = document.querySelector('.participants-list');
  const participant = document.createElement('div');
  participant.className = 'participant';
  participant.innerHTML = `
    <div class="participant-avatar">${name.charAt(0).toUpperCase()}</div>
    <div class="participant-info">
      <span class="participant-name">${name}</span>
      <span class="participant-status">
        <i class="fas fa-user"></i> Joined
      </span>
    </div>
  `;
  participantsList.appendChild(participant);

  // Add system message
  addSystemMessage(`${name} has joined the classroom`);
}

// Initialize the classroom
window.addEventListener('DOMContentLoaded', () => {
  // Check if joining an existing classroom
  const path = window.location.pathname;
  if (path.startsWith('/classroom/')) {
    currentClassroomId = path.split('/').pop();
    showJoinModal();
  }
});

// Initialize with some sample data
window.addEventListener('DOMContentLoaded', () => {
  // Add sample participants
  addVideoStream('student1Video', 'Student 1');
  addVideoStream('student2Video', 'Student 2');
  
  // Add welcome message
  addSystemMessage("Welcome to the Virtual Classroom!");
  addSystemMessage("Class will begin shortly.");
  
  // Set up whiteboard
  resizeCanvas();
});

// Student Media Controls
let studentStream = null;
let studentMicEnabled = false;
let studentCamEnabled = false;

async function toggleStudentMic(participantId) {
  const participant = participants.get(participantId);
  if (!participant) return;

  try {
    if (!studentStream) {
      studentStream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: studentCamEnabled
      });
    }

    const audioTrack = studentStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      studentMicEnabled = audioTrack.enabled;
      
      // Update UI
      const micBtn = document.querySelector(`#${participantId} .control-btn:nth-child(1)`);
      if (micBtn) {
        micBtn.classList.toggle('active', studentMicEnabled);
      }
      
      // Update status
      const status = document.querySelector(`#${participantId} .participant-status`);
      if (status) {
        status.innerHTML = studentMicEnabled ? 
          '<i class="fas fa-microphone"></i> Speaking' : 
          '<i class="fas fa-microphone-slash"></i> Muted';
      }
    }
  } catch (error) {
    console.error('Error toggling microphone:', error);
    alert('Could not access microphone');
  }
}

async function toggleStudentCam(participantId) {
  const participant = participants.get(participantId);
  if (!participant) return;

  try {
    if (!studentStream) {
      studentStream = await navigator.mediaDevices.getUserMedia({ 
        audio: studentMicEnabled,
        video: true
      });
    }

    const videoTrack = studentStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      studentCamEnabled = videoTrack.enabled;
      
      // Update UI
      const camBtn = document.querySelector(`#${participantId} .control-btn:nth-child(2)`);
      if (camBtn) {
        camBtn.classList.toggle('active', studentCamEnabled);
      }
      
      // Update video element
      const video = document.querySelector(`#${participantId} video`);
      if (video) {
        video.style.opacity = studentCamEnabled ? '1' : '0.5';
      }
    }
  } catch (error) {
    console.error('Error toggling camera:', error);
    alert('Could not access camera');
  }
}

async function toggleStudentScreenShare(participantId) {
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
      video: true,
      audio: false
    });
    
    const video = document.querySelector(`#${participantId} video`);
    if (video) {
      video.srcObject = screenStream;
    }
    
    screenStream.getVideoTracks()[0].onended = () => {
      if (studentStream) {
        video.srcObject = studentStream;
      }
    };
  } catch (error) {
    console.error('Error sharing screen:', error);
  }
}

function leaveStudentCall(participantId) {
  const participant = participants.get(participantId);
  if (participant) {
    if (studentStream) {
      studentStream.getTracks().forEach(track => track.stop());
      studentStream = null;
    }
    
    // Remove from video grid
    const videoBox = document.getElementById(participantId);
    if (videoBox) {
      videoBox.remove();
    }
    
    // Remove from participants list
    const participantElement = document.querySelector(`.participant:has(.participant-name:contains('${participant.name}'))`);
    if (participantElement) {
      participantElement.remove();
    }
    
    // Remove from participants map
    participants.delete(participantId);
    
    // Add system message
    addSystemMessage(`${participant.name} has left the classroom`);
  }
}

async function toggleMic() {
  const micBtn = document.getElementById("micBtn");

  if (!micOn) {
    try {
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true,
          video: cameraOn
        });
        if (cameraOn) {
          document.getElementById("teacherVideo").srcObject = stream;
        }
      } else {
        stream.addTrack((await navigator.mediaDevices.getUserMedia({ audio: true })).getAudioTracks()[0]);
      }
      micOn = true;
      micBtn.classList.add('active');
    } catch (error) {
      alert("Could not access microphone: " + error.message);
    }
  } else {
    stream.getAudioTracks().forEach(track => track.stop());
    micOn = false;
    micBtn.classList.remove('active');
    
    if (!cameraOn) {
      stream = null;
    }
  }
}

async function toggleCam() {
  const videoElement = document.getElementById("teacherVideo");
  const camBtn = document.getElementById("camBtn");

  if (!cameraOn) {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: micOn
      });
      videoElement.srcObject = stream;
      cameraOn = true;
      camBtn.classList.add('active');
      
      // Add teacher video to the grid
      addVideoStream('teacherVideo', 'Teacher', true);
      
    } catch (error) {
      alert("Could not access camera: " + error.message);
    }
  } else {
    stream.getVideoTracks().forEach(track => track.stop());
    videoElement.srcObject = null;
    cameraOn = false;
    camBtn.classList.remove('active');
    
    // Remove teacher video from grid
    removeVideoStream('teacherVideo');
  }
}

async function toggleScreenShare() {
  const videoGrid = document.getElementById("videoGrid");
  
  if (!screenShareActive) {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true,
        audio: false
      });
      
      // Add screen share video to the grid
      const screenShareBox = document.createElement('div');
      screenShareBox.className = 'video-box';
      screenShareBox.id = 'screenShareBox';
      
      const screenVideo = document.createElement('video');
      screenVideo.autoplay = true;
      screenVideo.playsInline = true;
      screenVideo.srcObject = screenStream;
      
      const screenLabel = document.createElement('div');
      screenLabel.className = 'video-label';
      screenLabel.innerHTML = '<i class="fas fa-desktop"></i> <span>Screen Share</span>';
      
      screenShareBox.appendChild(screenVideo);
      screenShareBox.appendChild(screenLabel);
      videoGrid.appendChild(screenShareBox);
      
      screenShareActive = true;
      
      // Handle when user stops screen sharing
      screenStream.getVideoTracks()[0].onended = () => {
        toggleScreenShare();
      };
      
    } catch (error) {
      console.error("Screen sharing error:", error);
    }
  } else {
    // Remove screen share video
    const screenShareBox = document.getElementById("screenShareBox");
    if (screenShareBox) {
      screenShareBox.remove();
    }
    screenShareActive = false;
  }
}

function leaveCall() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  cameraOn = false;
  micOn = false;
  
  document.getElementById("camBtn").classList.remove('active');
  document.getElementById("micBtn").classList.remove('active');
  
  // Clear all video streams
  document.getElementById("videoGrid").innerHTML = '';
  
  // Add system message to chat
  addSystemMessage("You have left the classroom");
}