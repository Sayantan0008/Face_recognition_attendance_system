from fastapi import APIRouter, UploadFile, Depends, HTTPException, File, Response, Form
from fastapi.responses import StreamingResponse, FileResponse
from datetime import datetime
import cv2
import csv
import os
import numpy as np
import face_recognition
import tempfile
from app.models.database import User, Attendance
from sqlalchemy.orm import Session

from app.models.database import SessionLocal, User, Attendance
from app.services.face_encoding import generate_face_encoding
from app.utils.security import api_key_auth

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", dependencies=[Depends(api_key_auth)])
async def register_user(
    name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Save the uploaded file temporarily
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
    try:
        contents = await file.read()
        with open(temp_file.name, 'wb') as f:
            f.write(contents)
        
        # Generate face encoding
        face_encoding = generate_face_encoding(temp_file.name)
        if face_encoding is None:
            raise HTTPException(status_code=400, detail="No face detected in the image")
        
        # Create new user
        user = User(name=name, face_encoding=face_encoding.tobytes())
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return {"user_id": user.id, "name": user.name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        temp_file.close()
        os.unlink(temp_file.name)

@router.post("/recognize", dependencies=[Depends(api_key_auth)])
async def recognize_user(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        unknown_image = face_recognition.load_image_file(tmp_path)
        unknown_encoding = face_recognition.face_encodings(unknown_image)
        
        if not unknown_encoding:
            return {"status": "error", "detail": "No face detected in the image"}
        
        users = db.query(User).all()
        for user in users:
            stored_encoding = np.frombuffer(user.face_encoding, dtype=np.float64)
            results = face_recognition.compare_faces([stored_encoding], unknown_encoding[0], tolerance=0.6)
            
            if results[0]:
                attendance = Attendance(user_id=user.id, timestamp=datetime.utcnow())
                db.add(attendance)
                db.commit()
                return {"status": "success", "user_id": user.id, "name": user.name}
        
        return {"status": "unknown", "detail": "Face not recognized in the system"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}
    finally:
        if 'tmp_path' in locals():
            os.unlink(tmp_path)

# Add a JSON report endpoint that matches the frontend expectations
@router.get("/report", dependencies=[Depends(api_key_auth)])
async def generate_attendance_report_json(
    start: str, 
    end: str, 
    db: Session = Depends(get_db)
):
    try:
        # Convert string dates to datetime objects
        start_datetime = datetime.fromisoformat(start)
        end_datetime = datetime.fromisoformat(end)
        
        # Query attendance records within the date range
        query = db.query(Attendance, User.name).join(
            User, User.id == Attendance.user_id
        ).filter(
            Attendance.timestamp >= start_datetime,
            Attendance.timestamp <= end_datetime
        ).order_by(Attendance.timestamp.desc())
        
        records = query.all()
        
        # Format for JSON response
        result = []
        for record, name in records:
            result.append({
                "id": record.id,
                "user_id": record.user_id,
                "name": name,
                "timestamp": record.timestamp.isoformat()
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add a CSV report endpoint for downloading attendance data
@router.get("/attendance-report", dependencies=[Depends(api_key_auth)])
async def generate_attendance_report_csv(
    start_date: str, 
    end_date: str, 
    db: Session = Depends(get_db)
):
    try:
        # Convert string dates to datetime objects
        start_datetime = datetime.fromisoformat(start_date)
        end_datetime = datetime.fromisoformat(end_date)
        
        # Query attendance records within the date range
        query = db.query(Attendance, User.name, User.id).join(
            User, User.id == Attendance.user_id
        ).filter(
            Attendance.timestamp >= start_datetime,
            Attendance.timestamp <= end_datetime
        ).order_by(Attendance.timestamp.desc())
        
        records = query.all()
        
        # Create a CSV in memory
        def generate_csv():
            # Create a StringIO object
            import io
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write header
            writer.writerow(["ID", "User ID", "Name", "Timestamp"])
            
            # Write data
            for record, name, user_id in records:
                writer.writerow([
                    record.id,
                    user_id,
                    name,
                    record.timestamp.isoformat()
                ])
            
            # Get the CSV content
            output.seek(0)
            return output.read()
        
        # Return the CSV as a streaming response
        return StreamingResponse(
            iter([generate_csv()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": 'attachment; filename="attendance_report.csv"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))