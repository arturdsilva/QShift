from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError, IntegrityError, DataError
from fastapi import HTTPException, status

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


def get_session():
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except (IntegrityError, DataError) as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or conflicting data"
        ) from e
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error") from e
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
