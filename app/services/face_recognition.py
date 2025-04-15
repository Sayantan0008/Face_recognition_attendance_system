import face_recognition
import numpy as np
from datetime import datetime
from app.models.database import SessionLocal
from app.models.database import User, Attendance

def recognize_face(image_path):
    db = SessionLocal()
    try:
        unknown_image = face_recognition.load_image_file(image_path)
        unknown_encoding = face_recognition.face_encodings(unknown_image)
        
        if not unknown_encoding:
            return None
            
        users = db.query(User).all()
        
        for user in users:
            stored_encoding = np.frombuffer(user.face_encoding, dtype=np.float64)
            results = face_recognition.compare_faces(
                [stored_encoding], 
                unknown_encoding[0],
                tolerance=0.4
            )
            
            if results[0]:
                attendance = Attendance(
                    user_id=user.id,
                    timestamp=datetime.utcnow()
                )
                db.add(attendance)
                db.commit()
                return user
                
        return None
    finally:
        db.close()