from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    upstage_api_key: str
    upstage_chat_model: str = "solar-pro3"

    upstage_passage_embedding_model: str = (
        "solar-embedding-1-large-passage"
    )
    upstage_query_embedding_model: str = (
        "solar-embedding-1-large-query"
    )
    chroma_db_path: str = "./chroma_db"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()