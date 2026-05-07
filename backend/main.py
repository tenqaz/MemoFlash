import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

    return {"tags": [{"name": tag, "count": count} for tag, count in tag_counts.items()]}

@app.get("/api/random-memo")
async def get_random_memo(tags: str = None):
    memos_api_base = os.getenv("MEMOS_API_BASE")
    memos_token = os.getenv("MEMOS_TOKEN")

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{memos_api_base}/api/v1/memos",
            headers={"Authorization": f"Bearer {memos_token}"}
        )
        data = response.json()
        memos = data.get("memos", []) if isinstance(data, dict) else data

    if tags:
        tag_list = [t.strip() for t in tags.split(",")]
        memos = [m for m in memos if any(tag in m.get("tags", []) for tag in tag_list)]

    if not memos:
        return None

    import random
    return random.choice(memos)

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
