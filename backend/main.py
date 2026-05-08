import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import httpx
from db import get_random_memo_uid

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MEMOS_TOKEN = os.getenv("MEMOS_TOKEN")
MEMOS_USER = os.getenv("MEMOS_USER")
MEMOS_API_BASE = os.getenv("MEMOS_API_BASE")

class CommentRequest(BaseModel):
    content: str

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
async def get_random_memo(tag_ids: str = None):
    tag_list = tag_ids.split(",") if tag_ids else None
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

        # 获取评论和引用的完整信息
        if memo_data.get("relations"):
            comments = []
            references = []

            for relation in memo_data["relations"]:
                if relation["type"] == "COMMENT":
                    comment_id = relation["memo"]["name"].split("/")[-1]
                    comment_url = f"{MEMOS_API_BASE}/api/v1/memos/{comment_id}"
                    comment_response = await client.get(comment_url, headers=headers)
                    if comment_response.status_code == 200:
                        comments.append(comment_response.json())
                elif relation["type"] == "REFERENCE":
                    ref_id = relation["memo"]["name"].split("/")[-1]
                    ref_url = f"{MEMOS_API_BASE}/api/v1/memos/{ref_id}"
                    ref_response = await client.get(ref_url, headers=headers)
                    if ref_response.status_code == 200:
                        references.append(ref_response.json())

            memo_data["comments"] = comments
            memo_data["references"] = references

        return memo_data

@app.post("/api/memos/{uid}/comments")
async def add_comment(uid: str, request: CommentRequest):
    url = f"{MEMOS_API_BASE}/api/v1/memos/{uid}/comments"
    headers = {"Authorization": f"Bearer {MEMOS_TOKEN}"}
    body = {
        "state": "NORMAL",
        "content": request.content,
        "visibility": "PRIVATE"
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=body)
        if response.status_code != 200:
            raise HTTPException(status_code=502, detail="Failed to create comment")

        return response.json()

# Static file serving
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/"):
            return {"error": "Not found"}
        return FileResponse(os.path.join(static_dir, "index.html"))
