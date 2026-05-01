from fastapi import FastAPI,Request
from fastapi.middleware.cors import CORSMiddleware
from routers import render, auth, reminders
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from scheduler import start_scheduler, shutdown_scheduler, load_existing_reminders
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from starlette.exceptions import HTTPException as StarletteHTTPException

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting MedRed application...")
    start_scheduler()
    
    # Load existing reminders
    reminder_count = load_existing_reminders()
    print(f"✅ Application started with {reminder_count} reminders scheduled")
    
    yield
    
    # Shutdown
    shutdown_scheduler()
    print("👋 Application shutdown complete")

app = FastAPI(lifespan=lifespan)

# CORS Configuration
origins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://medred.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(render.router)  
app.include_router(prefix="/api", router=auth.router)
app.include_router(prefix="/api/reminders", router=reminders.router)

# Health check endpoint
@app.api_route("/health",methods=["GET","HEAD"])
async def health_check():
    return {
        "status": "ok",
        "message": "MedRed API is running"
    }


templates = Jinja2Templates(directory="templates")

def wants_html(request: Request):
    return "text/html" in request.headers.get("accept", "")

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    if wants_html(request):
        return templates.TemplateResponse("error.html", {"request": request}, status_code=exc.status_code)
    return JSONResponse({"error": "Something went wrong 😞"}, status_code=exc.status_code)

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    if wants_html(request):
        return templates.TemplateResponse("error.html", {"request": request}, status_code=500)
    return JSONResponse({"error": "Something went wrong 😞"}, status_code=500)

from fastapi import FastAPI, Depends, HTTPException, status

def verify_admin_key(admin_key: str):
    if admin_key != "secret123":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)

# Re-enable docs at a secret path
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi

@app.get("/secret-docs", dependencies=[Depends(lambda: verify_admin_key("secret123"))])
async def get_documentation():
    return get_swagger_ui_html(openapi_url="/openapi.json", title="Secret Docs")

@app.get("/openapi.json", dependencies=[Depends(lambda: verify_admin_key("secret123"))])
async def openapi():
    return get_openapi(title="Hidden API", version="1.0.0", routes=app.routes)
