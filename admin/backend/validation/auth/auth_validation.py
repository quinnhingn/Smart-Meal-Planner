from pydantic import BaseModel, EmailStr, Field

class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Email đăng nhập của Admin")
    password: str = Field(..., min_length=6, description="Mật khẩu (ít nhất 6 ký tự)")
