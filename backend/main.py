import os
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import httpx
from db import get_random_memo_uid

load_dotenv()

app = FastAPI()

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

MEMOS_TOKEN = os.getenv("MEMOS_TOKEN")
MEMOS_USER = os.getenv("MEMOS_USER")
MEMOS_API_BASE = os.getenv("MEMOS_API_BASE")

if not all([MEMOS_TOKEN, MEMOS_USER, MEMOS_API_BASE]):
    raise ValueError("Missing required environment variables: MEMOS_TOKEN, MEMOS_USER, or MEMOS_API_BASE")

@app.get("/api/tags")
async def get_tags():
    url = f"{MEMOS_API_BASE}/api/v1/users/{MEMOS_USER}:getStats"
    headers = {"Authorization": f"Bearer {MEMOS_TOKEN}"}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        if response.status_code != 200:
            raise HTTPException(status_code=502, detail="Failed to fetch tags")

        data = response.json()
        return data.get("tagCount", {})

@app.get("/api/memos/random")
async def get_random_memo(tag_ids: str = Query(None, max_length=500)):
    tag_list = None
    if tag_ids:
        tag_list = [tag.strip() for tag in tag_ids.split(",") if tag.strip()]

    uid = get_random_memo_uid(tag_list)

    if not uid:
        raise HTTPException(status_code=404, detail="No memo found")

    url = f"{MEMOS_API_BASE}/api/v1/memos/{uid}"
    headers = {"Authorization": f"Bearer {MEMOS_TOKEN}"}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        if response.status_code != 200:
            raise HTTPException(status_code=502, detail="Failed to fetch memo")

        memo_data = response.json()

        # 获取引用的完整信息
        references = []
        for relation in memo_data.get("relations", []):
            if relation["type"] != "REFERENCE":
                continue
            ref_id = relation["memo"]["name"].split("/")[-1]
            ref_url = f"{MEMOS_API_BASE}/api/v1/memos/{ref_id}"
            ref_response = await client.get(ref_url, headers=headers)
            if ref_response.status_code == 200:
                references.append(ref_response.json())

        if references:
            memo_data["references"] = references

        return memo_data

# Static file serving
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")