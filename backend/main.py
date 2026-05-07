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
        memos = response.json()

    tag_counts = {}
    for memo in memos:
        tags = memo.get("tags", [])
        for tag in tags:
            tag_counts[tag] = tag_counts.get(tag, 0) + 1

    return {"tags": [{"name": tag, "count": count} for tag, count in tag_counts.items()]}
