from fastapi import HTTPException, status

class SentinelException(HTTPException):
    def __init__(self, status_code: int, detail: str, code: str = "SENTINEL_ERROR"):
        super().__init__(status_code=status_code, detail={"code": code, "message": detail})

class ResourceNotFoundException(SentinelException):
    def __init__(self, resource: str, resource_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} with identifier '{resource_id}' was not found.",
            code="RESOURCE_NOT_FOUND"
        )

class UnauthorizedException(SentinelException):
    def __init__(self, detail: str = "Invalid or expired credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            code="UNAUTHORIZED"
        )

class ForbiddenException(SentinelException):
    def __init__(self, detail: str = "Insufficient permissions for this action"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            code="FORBIDDEN"
        )
