from fastapi import HTTPException, Header
import os

async def api_key_auth(api_key: str = Header(..., alias="X-API-Key")):
    valid_api_key = os.getenv("API_KEY", "local-test-key")
    if api_key != valid_api_key:
        raise HTTPException(
            status_code=401,
            detail="Invalid API Key"
        )
    return True