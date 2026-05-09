import sqlite3
import os
from pathlib import Path

def get_db_path():
    db_path = os.getenv("DB_PATH", "~/.memos/memos_prod.db")
    return str(Path(db_path).expanduser())

def get_random_memo_uid(tags: list[str] | None = None) -> str | None:
    db_path = get_db_path()
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        query = "SELECT uid FROM memo WHERE row_status = 'NORMAL'"
        params = []

        if tags:
            tag_conditions = []
            for tag in tags:
                tag_conditions.append("json_extract(payload, '$.tags') LIKE ?")
                params.append(f'%{tag}%')
            query += f" AND ({' AND '.join(tag_conditions)})"

        query += " ORDER BY RANDOM() LIMIT 1"

        cursor.execute(query, params)
        result = cursor.fetchone()
        return result[0] if result else None
    except sqlite3.Error as e:
        raise
    finally:
        if conn:
            conn.close()
