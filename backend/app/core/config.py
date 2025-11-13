from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENV: str = "dev"
    DATABASE_URL: str
    ALLOWED_ORIGINS: str = "http://localhost:5173"
    AUTH_MODE: str = "demo"  # demo | jwt
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 100
    JWT_ALGORITHM: str = "HS256"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
