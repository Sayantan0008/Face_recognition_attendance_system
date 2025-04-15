// Face Recognition Attendance System - Main JavaScript

// DOM Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Register elements
const registerVideo = document.getElementById('registerVideo');
const registerCanvas = document.getElementById('registerCanvas');
const registerOverlay = document.getElementById('registerOverlay');
const registerName = document.getElementById('registerName');
const captureBtn = document.getElementById('captureBtn');
const registerBtn = document.getElementById('registerBtn');
const registerStatus = document.getElementById('registerStatus');
const registerLoading = document.getElementById('registerLoading');
const imageUpload = document.getElementById('imageUpload');

// Recognize elements
const recognizeVideo = document.getElementById('recognizeVideo');
const recognizeCanvas = document.getElementById('recognizeCanvas');
const recognizeOverlay = document.getElementById('recognizeOverlay');
const recognizeBtn = document.getElementById('recognizeBtn');
const recognizeStatus = document.getElementById('recognizeStatus');
const recognizeLoading = document.getElementById('recognizeLoading');

// Report elements
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const generateReportBtn = document.getElementById('generateReportBtn');
const reportLoading = document.getElementById('reportLoading');
const attendanceData = document.getElementById('attendanceData');

// Tab switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        
        // Update active tab button
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active tab content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
            }
        });
        
        // Start camera for the active tab
        if (tabId === 'register') {
            startCamera(registerVideo);
            stopCamera(recognizeVideo);
        } else if (tabId === 'recognize') {
            startCamera(recognizeVideo);
            stopCamera(registerVideo);
        } else {
            stopCamera(registerVideo);
            stopCamera(recognizeVideo);
        }
    });
});

// Start camera function
function startCamera(videoElement) {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Set 4:3 aspect ratio constraints (e.g., 640x480)
        const constraints = {
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                aspectRatio: { ideal: 4/3 }
            }
        };
        
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                videoElement.srcObject = stream;
                // Set the video element dimensions to maintain 4:3 ratio
                videoElement.style.width = '100%';
                videoElement.style.height = 'auto';
            })
            .catch(err => {
                console.error('Error accessing camera:', err);
                showStatus(registerStatus, 'Camera access denied. Please enable camera permissions.', 'error');
            });
    } else {
        showStatus(registerStatus, 'Your browser does not support camera access.', 'error');
    }
}

// Stop camera function
function stopCamera(videoElement) {
    if (videoElement.srcObject) {
        const tracks = videoElement.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoElement.srcObject = null;
    }
}

// Capture image from video
function captureImage(videoElement, canvasElement) {
    const context = canvasElement.getContext('2d');
    // Set canvas dimensions to match 4:3 aspect ratio
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    // Ensure the canvas maintains 4:3 aspect ratio
    if (canvasElement.width / canvasElement.height !== 4/3) {
        // Adjust dimensions to force 4:3 ratio while preserving width
        canvasElement.height = canvasElement.width * (3/4);
    }
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    return canvasElement.toDataURL('image/jpeg');
}

// Show status message with animation
function showStatus(element, message, type) {
    element.textContent = message;
    element.className = 'status-message';
    element.classList.add(type);
    setTimeout(() => {
        element.style.display = 'block';
    }, 100);
}

// Create face detection box with animation
function createFaceBox(overlayElement) {
    const faceBox = document.createElement('div');
    faceBox.className = 'face-box';
    faceBox.style.width = '150px';
    faceBox.style.height = '200px';
    faceBox.style.top = '50%';
    faceBox.style.left = '50%';
    faceBox.style.transform = 'translate(-50%, -50%)';
    overlayElement.innerHTML = '';
    overlayElement.appendChild(faceBox);
}

// Register a new user
async function registerUser() {
    const name = registerName.value.trim();
    if (!name) {
        showStatus(registerStatus, 'Please enter a name', 'error');
        return;
    }
    
    // Check if canvas has image data
    if (registerCanvas.style.display !== 'block') {
        showStatus(registerStatus, 'Please capture or upload an image', 'error');
        return;
    }
    
    const imageData = registerCanvas.toDataURL('image/jpeg');
    const blob = await fetch(imageData).then(res => res.blob());
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', blob, 'face.jpg');
    
    registerLoading.style.display = 'block';
    
    try {
        const response = await fetch('/api/v1/register', {
            method: 'POST',
            headers: {
                'X-API-Key': 'local-test-key' // Using the same key as defined in .env
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showStatus(registerStatus, `User ${name} registered successfully!`, 'success');
            registerName.value = '';
            registerCanvas.style.display = 'none';
            registerBtn.disabled = true;
            registerOverlay.innerHTML = '';
            // Reset file input
            imageUpload.value = '';
        } else {
            showStatus(registerStatus, data.detail || 'Registration failed', 'error');
        }
    } catch (error) {
        showStatus(registerStatus, 'Error connecting to server', 'error');
        console.error('Registration error:', error);
    } finally {
        registerLoading.style.display = 'none';
    }
}

// Recognize a user
async function recognizeUser() {
    const imageData = captureImage(recognizeVideo, recognizeCanvas);
    const blob = await fetch(imageData).then(res => res.blob());
    const formData = new FormData();
    formData.append('file', blob, 'face.jpg');
    
    recognizeLoading.style.display = 'block';
    recognizeCanvas.style.display = 'block';
    
    // Add face detection animation
    createFaceBox(recognizeOverlay);
    
    try {
        const response = await fetch('/api/v1/recognize', {
            method: 'POST',
            headers: {
                'X-API-Key': 'local-test-key' // Using the same key as defined in .env
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            showStatus(recognizeStatus, `Welcome, ${data.name}! Attendance recorded.`, 'success');
        } else if (data.status === 'unknown') {
            showStatus(recognizeStatus, 'Face not recognized. Please register first.', 'warning');
        } else {
            showStatus(recognizeStatus, data.detail || 'Recognition failed', 'error');
        }
    } catch (error) {
        showStatus(recognizeStatus, 'Error connecting to server', 'error');
        console.error('Recognition error:', error);
    } finally {
        recognizeLoading.style.display = 'none';
    }
}

// Generate attendance report
async function generateReport() {
    const start = startDate.value;
    const end = endDate.value;
    
    if (!start || !end) {
        alert('Please select both start and end dates');
        return;
    }
    
    reportLoading.style.display = 'block';
    attendanceData.innerHTML = '';
    
    try {
        const response = await fetch(`/api/v1/report?start=${start}T00:00:00&end=${end}T23:59:59`, {
            headers: {
                'X-API-Key': 'local-test-key' // Using the same key as defined in .env
            }
        });
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
            if (data.length === 0) {
                attendanceData.innerHTML = '<tr><td colspan="3">No attendance records found</td></tr>';
            } else {
                data.forEach(record => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${record.id}</td>
                        <td>${record.name}</td>
                        <td>${new Date(record.timestamp).toLocaleString()}</td>
                    `;
                    attendanceData.appendChild(row);
                });
            }
        } else {
            attendanceData.innerHTML = '<tr><td colspan="3">Error loading attendance data</td></tr>';
        }
    } catch (error) {
        attendanceData.innerHTML = '<tr><td colspan="3">Error connecting to server</td></tr>';
        console.error('Report error:', error);
    } finally {
        reportLoading.style.display = 'none';
    }
}

// Download attendance report as CSV
async function downloadReport() {
    const start = startDate.value;
    const end = endDate.value;
    
    if (!start || !end) {
        alert('Please select both start and end dates');
        return;
    }
    
    reportLoading.style.display = 'block';
    
    try {
        // Create the URL with the date parameters
        const url = `/api/v1/attendance-report?start_date=${start}T00:00:00&end_date=${end}T23:59:59`;
        
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = url;
        
        // Add the API key as a custom header using fetch
        const response = await fetch(url, {
            headers: {
                'X-API-Key': 'local-test-key'
            }
        });
        
        // Get the blob from the response
        const blob = await response.blob();
        
        // Create a URL for the blob
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Set the link's href to the blob URL
        link.href = blobUrl;
        
        // Set the download attribute with filename
        link.download = 'attendance_report.csv';
        
        // Append the link to the body
        document.body.appendChild(link);
        
        // Click the link to start the download
        link.click();
        
        // Remove the link from the document
        document.body.removeChild(link);
        
        // Revoke the blob URL to free up memory
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Download error:', error);
        alert('Error downloading the report. Please try again.');
    } finally {
        reportLoading.style.display = 'none';
    }
}

// Initialize the app
function init() {
    // Set default dates for report
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    
    startDate.valueAsDate = oneMonthAgo;
    endDate.valueAsDate = today;
    
    // Start camera for register tab (active by default)
    startCamera(registerVideo);
    
    // Event listeners
    captureBtn.addEventListener('click', () => {
        if (registerVideo.srcObject) {
            registerCanvas.style.display = 'block';
            captureImage(registerVideo, registerCanvas);
            createFaceBox(registerOverlay);
            registerBtn.disabled = false;
        } else {
            showStatus(registerStatus, 'Camera not started', 'error');
        }
    });
    
    // Handle image upload
    imageUpload.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    registerCanvas.style.display = 'block';
                    const context = registerCanvas.getContext('2d');
                    
                    // Set canvas dimensions to maintain 4:3 aspect ratio
                    registerCanvas.width = img.width;
                    registerCanvas.height = img.height;
                    
                    // Ensure the canvas maintains 4:3 aspect ratio
                    if (registerCanvas.width / registerCanvas.height !== 4/3) {
                        // Adjust dimensions to force 4:3 ratio while preserving width
                        registerCanvas.height = registerCanvas.width * (3/4);
                    }
                    
                    context.drawImage(img, 0, 0, registerCanvas.width, registerCanvas.height);
                    createFaceBox(registerOverlay);
                    registerBtn.disabled = false;
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    registerBtn.addEventListener('click', registerUser);
    recognizeBtn.addEventListener('click', recognizeUser);
    generateReportBtn.addEventListener('click', generateReport);
    document.getElementById('downloadReportBtn').addEventListener('click', downloadReport);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);