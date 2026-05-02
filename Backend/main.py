from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, reminders
from contextlib import asynccontextmanager
from scheduler import start_scheduler, shutdown_scheduler, load_existing_reminders
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
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

app = FastAPI(lifespan=lifespan, docs_url=None, redoc_url=None, openapi_url=None)

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

app.include_router(prefix="/api/auth", router=auth.router)
app.include_router(prefix="/api/reminders", router=reminders.router)

# Health check endpoint
@app.api_route("/health",methods=["GET","HEAD"])
async def health_check():
    return {
        "status": "ok",
        "message": "MedRed API is running"
    }


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse({"error": exc.detail}, status_code=exc.status_code)

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse({"error": "Something went wrong 😞", "details": str(exc)}, status_code=500)

def verify_admin_key(admin_key: str):
    if admin_key != "secret123":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

@app.get("/secret-docs", dependencies=[Depends(lambda: verify_admin_key("secret123"))])
async def get_documentation():
    return get_swagger_ui_html(openapi_url="/openapi.json", title="Secret Docs")

@app.get("/openapi.json", dependencies=[Depends(lambda: verify_admin_key("secret123"))])
async def openapi():
    return get_openapi(title="Hidden API", version="1.0.0", routes=app.routes)
