from fastapi import APIRouter, Depends, HTTPException, Request, status, Response, Cookie, Body
from fastapi.responses import JSONResponse
from controller.auth import verifyPassword, createAccessToken, getCurrentUserFromCookie
from models import database as db
from controller import auth
from typing import Optional
from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class UpdateUserRequest(BaseModel):
    mobileNumber: str
    emergencyContactNumber: str
    birthDate: str
    city: str
    gender: str
    streetAddress: str
    state: str
    pinCode: str
    country: str
    bloodGroup: str
    medicalConditions: Optional[str] = ""
    allergies: Optional[str] = ""

router = APIRouter(tags=["auth"])

@router.post("/login")
async def login(req: LoginRequest):
    user = db.getUser(req.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="user not found")
    if not verifyPassword(req.password, user["password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="incorrect password")
    del user["password"]  # Remove password before creating token
    token = createAccessToken(data={"sub": user["userId"], "user": user}, expires_delta=None)

    response = JSONResponse(content={"success": True, "message": "Login successful", "user": user})
    response.set_cookie(
        key="token",
        value=token,
        httponly=True,
        secure=True,  # ⚠️ Use False locally if needed
        samesite="Strict"
    )
    return response

@router.post("/register/")
def register(req: RegisterRequest):
    existing_user = db.getUser(req.email)
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    try:
        parts = req.username.split(" ", 1)
        fname = parts[0]
        lname = parts[1] if len(parts) > 1 else ""
        hashed_password = auth.getPasswordHash(req.password)
        mess = db.createUser(fname, lname, req.email, hashed_password)
        print(mess)
        token = createAccessToken(data={"sub": mess["userId"], "user": {"email": req.email, "fname": fname, "lname": lname}}, expires_delta=None)
        response = JSONResponse(content={"success": True, "message": "Registration successful"})
        response.set_cookie(
            key="token",
            value=token,
            httponly=True,
            secure=False,  # ⚠️ Use False locally if needed
            samesite="Strict"
        )
        return response
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})  
    
@router.put("/updateUser/")
async def updateUser(
    request: Request,
    req: UpdateUserRequest
):
    # Validate token first
    data = getCurrentUserFromCookie(request.cookies.get("token"))
    if not data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Not authenticated - No token provided"
        )
    
    # try:
    #     data = getCurrentUserFromCookie(token)
    # except Exception as e:
    #     raise HTTPException(
    #         status_code=status.HTTP_401_UNAUTHORIZED, 
    #         detail=f"Invalid token: {str(e)}"
    #     )
    
    user = data.get("user")
    sub = data.get("sub")
    
    if not user or not sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Not authenticated - Invalid user data"
        )

    # Validate mobile numbers
    if not req.mobileNumber or len(req.mobileNumber) != 10 or not req.mobileNumber.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mobile number must be exactly 10 digits"
        )
    
    if req.emergencyContactNumber and (len(req.emergencyContactNumber) != 10 or not req.emergencyContactNumber.isdigit()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Emergency contact number must be exactly 10 digits"
        )

    # Convert pinCode to int and validate
    try:
        pin_code_int = int(req.pinCode)
        if pin_code_int < 100000 or pin_code_int > 999999:
            raise ValueError("PIN code must be 6 digits")
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid PIN code: {str(e)}"
        )

    try:
        result = db.updateUser(
            userId=sub,
            mobileNumber=req.mobileNumber,
            gender=req.gender,
            bloodGroup=req.bloodGroup,
            emergencyContactNumber=req.emergencyContactNumber,
            allergies=req.allergies,
            medicalConditions=req.medicalConditions,
            birthDate=req.birthDate,
            streetAddress=req.streetAddress,
            city=req.city,
            state=req.state,
            pinCode=pin_code_int,  # Pass as int
            country=req.country
        )
        
        print(f"Update result: {result}")
        
        if "error" in result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail=result["error"]
            )
        
        # Return JSON response instead of redirect for AJAX
        return {
            "success": True,
            "message": "User information updated successfully",
            "data": result
        }
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        print(f"Error updating user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to update user information: {str(e)}"
        )


@router.get("/info")
async def getUserInfo(token: str = Cookie(None)):
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Not authenticated - No token provided"
        )
    
    try:
        data = getCurrentUserFromCookie(token)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail=f"Invalid token: {str(e)}"
        )
    
    userId = data.get("sub")    
    if not userId:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Not authenticated - Invalid user data"
        )
    try:
        user_info = db.getUserForDashboard(userId)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Error retrieving user info: {str(e)}"
        )
    # user_info = db.getUserForDashboard(userId)
    return user_info


@router.get("/me")
async def get_me(token: str = Cookie(None)):
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Not authenticated - No token provided"
        )
    
    try:
        data = getCurrentUserFromCookie(token)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail=f"Invalid token: {str(e)}"
        )
    
    user = data.get("user")
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Not authenticated - Invalid user data"
        )
    
    return {
        "email": user.get("email"),
        "fname": user.get("fname"),
        "lname": user.get("lname"),
    }

@router.get("/logout")
async def logout():
    response = JSONResponse(content={"success": True, "message": "Logged out successfully"})
    response.delete_cookie(key="token")
    return response

