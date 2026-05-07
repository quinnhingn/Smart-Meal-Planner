from pydantic import BaseModel, EmailStr, Field

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, description="Tên hiển thị (ít nhất 2 ký tự)")
    email: EmailStr = Field(..., description="Email đăng ký")
    password: str = Field(..., min_length=6, description="Mật khẩu (ít nhất 6 ký tự)")

class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Email đăng nhập")
    password: str = Field(..., min_length=6, description="Mật khẩu (ít nhất 6 ký tự)")
