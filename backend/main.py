import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import httpx

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CommentRequest(BaseModel):
    memo_uid: str
    comment: str

@app.get("/api/tags")
async def get_tags():
    memos_api_base = os.getenv("MEMOS_API_BASE")
    memos_token = os.getenv("MEMOS_TOKEN")

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{memos_api_base}/api/v1/memos",
            headers={"Authorization": f"Bearer {memos_token}"}
        )
        data = response.json()
        memos = data.get("memos", []) if isinstance(data, dict) else data

    tag_counts = {}
    for memo in memos:
        tags = memo.get("tags", [])
        for tag in tags:
            tag_counts[tag] = tag_counts.get(tag, 0) + 1

    return [{"id": tag, "name": tag, "count": count} for tag, count in tag_counts.items()]

@app.get("/api/memos/random")
async def get_random_memo(tag_ids: str = None):
    memos_api_base = os.getenv("MEMOS_API_BASE")
    memos_token = os.getenv("MEMOS_TOKEN")

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{memos_api_base}/api/v1/memos",
            headers={"Authorization": f"Bearer {memos_token}"}
        )
        data = response.json()
        memos = data.get("memos", []) if isinstance(data, dict) else data

    if tag_ids:
        tag_list = [t.strip() for t in tag_ids.split(",")]
        memos = [m for m in memos if any(tag in m.get("tags", []) for tag in tag_list)]

    if not memos:
        return None

    import random
    selected = random.choice(memos)

    # Transform to frontend format
    return {
        "id": selected.get("name", "").split("/")[-1],
        "content": selected.get("content", ""),
        "created_at": selected.get("createTime", ""),
        "tags": [{"id": tag, "name": tag} for tag in selected.get("tags", [])],
        "comments": []
    }

@app.post("/api/memos/{uid}/comments")
async def add_comment(uid: str, request: CommentRequest):
    memos_api_base = os.getenv("MEMOS_API_BASE")
    memos_token = os.getenv("MEMOS_TOKEN")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{memos_api_base}/api/v1/memos/{uid}/comments",
            headers={"Authorization": f"Bearer {memos_token}"},
            json={"content": request.comment}
        )
        return response.json()

# Static file serving
static_dir = os.path.join(os.path.dirname(__file__), "..", "client", "dist")
if os.path.exists(static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/"):
            return {"error": "Not found"}
        return FileResponse(os.path.join(static_dir, "index.html"))
