# Face Recognition Attendance System

## Overview

A modern attendance tracking solution that uses facial recognition technology to automate the attendance process. This system provides a seamless way to register users, recognize faces, log attendance records, and generate reports.

## Features

- **Face Registration**: Register new users with their facial data
- **Face Recognition**: Identify registered users through webcam
- **Attendance Logging**: Automatically record attendance with timestamps
- **Report Generation**: Export attendance data to CSV format
- **Real-time Interface**: User-friendly webcam integration
- **Cloud Storage**: Google Cloud Storage integration for face data
- **API Authentication**: Secure API endpoints with key authentication
- **Database Management**: Proper session handling and data persistence
- **Error Handling**: Robust validation for all inputs

## Technology Stack

- **Backend**: FastAPI (Python)
- **Face Recognition**: face_recognition library (built on dlib)
- **Database**: SQLAlchemy with SQLite (local) or PostgreSQL (production)
- **Frontend**: HTML, CSS, JavaScript
- **Cloud Integration**: Google Cloud Storage
- **Authentication**: API key-based security

## Installation

### Prerequisites

- Python 3.8+
- pip package manager
- Virtual environment (recommended)
- C++ compiler (for dlib installation)

### Setup

1. Clone the repository
2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Create `.env` file in the project root:
   ```
   API_KEY=your-secret-key
   GCS_BUCKET_NAME=your-bucket-name
   DATABASE_URL=sqlite:///./attendance.db  # For local development
   # DATABASE_URL=postgresql://user:password@host/dbname  # For production
   ```

## Running Locally

1. Start the application:
   ```
   uvicorn main:app --reload --port 8000
   ```
2. Access the web interface at `http://localhost:8000`
3. API documentation is available at `http://localhost:8000/docs`

## Usage Guide

### User Registration

1. Navigate to the "Register" tab
2. Enter the user's full name
3. Capture a clear facial image using the webcam
4. Submit the registration form

### Face Recognition

1. Navigate to the "Recognize" tab
2. Position your face in front of the webcam
3. The system will identify registered users and log attendance

### Attendance Reports

1. Navigate to the "Attendance Report" tab
2. Select date range for the report
3. View attendance records or export as CSV

## API Endpoints

- `POST /api/v1/register`: Register a new user with face data
- `POST /api/v1/recognize`: Recognize a face and log attendance
- `GET /api/v1/attendance`: Get attendance records
- `GET /api/v1/attendance/report`: Generate attendance report (CSV)

## Cloud Deployment

### Google Cloud Setup

1. Enable required APIs:
   - Cloud Storage
   - Cloud Run
   - Cloud SQL
2. Create a PostgreSQL database instance
3. Configure Cloud SQL connection
4. Deploy using the provided Dockerfile:
   ```
   gcloud builds submit --tag gcr.io/your-project/face-recognition
   gcloud run deploy --image gcr.io/your-project/face-recognition
   ```

## Security Considerations

- Face data is securely stored and encrypted
- API endpoints are protected with API key authentication
- Database connections use proper session management
- Input validation prevents common security vulnerabilities

## Troubleshooting

- If face recognition fails, ensure proper lighting and camera positioning
- For dlib installation issues, refer to the official documentation
- Database connection errors may require checking credentials in `.env`

## License

MIT

---

This implementation includes all necessary components for a production-ready face recognition attendance system with proper security, scalability, and cloud integration.
