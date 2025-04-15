from fastapi import FastAPI, Request, Response
from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.routes.api import router
from app.models.database import create_tables
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Code to run on startup
    create_tables()
    yield
    # Code to run on shutdown
    pass

app = FastAPI(lifespan=lifespan)

# Mount the templates directory as static files
app.mount("/templates", StaticFiles(directory="templates"), name="templates")

# Create a static directory if it doesn't exist
os.makedirs("static", exist_ok=True)
# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Set up templates
templates = Jinja2Templates(directory="templates")

# Include API routes
app.include_router(router, prefix="/api/v1")

@app.get("/favicon.ico")
async def get_favicon():
    # Generate a simple favicon on the fly
    # This is a 1x1 transparent pixel in ICO format
    favicon_data = b'\x00\x00\x01\x00\x01\x00\x01\x01\x00\x00\x01\x00\x18\x00\x0A\x00\x00\x00\x16\x00\x00\x00\x28\x00\x00\x00\x01\x00\x00\x00\x01\x00\x00\x00\x01\x00\x18\x00\x00\x00\x00\x00\x04\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xFF\x00\x00\x00\x00\x00'
    return Response(content=favicon_data, media_type="image/x-icon")

@app.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)