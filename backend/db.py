import sqlite3
import os
from pathlib import Path

def get_db_path():
    db_path = os.getenv("DB_PATH", "~/.memos/memos_prod.db")
    return str(Path(db_path).expanduser())

def get_random_memo_uid(tags: list[str] | None = None) -> str | None:
    db_path = get_db_path()
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    query = "SELECT uid FROM memo WHERE row_status = 'NORMAL'"

    if tags:
        tag_conditions = " AND ".join(
            f"json_extract(payload, '$.tags') LIKE '%{tag}%'"
            for tag in tags
        )
        query += f" AND ({tag_conditions})"

    query += " ORDER BY RANDOM() LIMIT 1"

    cursor.execute(query)
    result = cursor.fetchone()
    conn.close()

    return result[0] if result else None
