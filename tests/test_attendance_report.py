import pytest
from fastapi.testclient import TestClient
from app.main import app
from datetime import datetime, timedelta

client = TestClient(app)

def test_attendance_report():
    # Define the date range for the report
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=1)  # Last 24 hours

    response = client.get(f"/attendance-report?start_date={start_date.isoformat()}&end_date={end_date.isoformat()}")
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv"
    assert response.headers["content-disposition"] == 'attachment; filename="attendance_report.csv"'
    
    # Check if the CSV content is valid
    csv_content = response.content.decode("utf-8")
    assert csv_content.startswith("ID,User ID,Name,Timestamp")
