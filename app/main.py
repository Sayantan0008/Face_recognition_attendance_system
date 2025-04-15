from fastapi import FastAPI, Form, UploadFile, File
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.routes.api import router as api_router

app = FastAPI()

# Register the API router
app.include_router(api_router)

# Serve static files (CSS, JS)
app.mount("/templates", StaticFiles(directory="templates"), name="static")

# Serve the main HTML page
@app.get("/", response_class=HTMLResponse)
async def read_index():
    with open("templates/index.html") as f:
        return f.read()

# Handle registration form submission
@app.post("/register")
async def register(name: str = Form(...), image: UploadFile = File(...)):
    # Save the uploaded image and process the registration
    # For demonstration purposes, we'll just return a success message
    return {"message": f"User {name} registered successfully!"}
