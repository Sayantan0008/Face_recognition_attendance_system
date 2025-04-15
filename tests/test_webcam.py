import cv2

def test_webcam():
    video_capture = cv2.VideoCapture(0)
    
    if not video_capture.isOpened():
        print("Error: Could not open webcam")
        return
    
    try:
        while True:
            ret, frame = video_capture.read()
            if not ret:
                print("Error: Failed to capture frame")
                break
            
            cv2.imshow('Webcam Test', frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    finally:
        video_capture.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    test_webcam()