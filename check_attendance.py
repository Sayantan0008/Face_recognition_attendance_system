from sqlalchemy.orm import Session
from app.models.database import SessionLocal, Attendance

def check_attendance_records():
    db: Session = SessionLocal()
    try:
        records = db.query(Attendance).all()
        for record in records:
            print(f"ID: {record.id}, User ID: {record.user_id}, Timestamp: {record.timestamp}")
    finally:
        db.close()

if __name__ == "__main__":
    check_attendance_records()
