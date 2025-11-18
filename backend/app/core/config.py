from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENV: str = "dev"
    DATABASE_URL: str
    ALLOWED_ORIGINS: list[str] = []
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 100
    JWT_ALGORITHM: str = "HS256"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
