import uuid

DEMO_USER_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")


def current_user_id() -> uuid.UUID:
    # Por enquanto, modo de desenvolvimento: usuário único fixo (demo).
    return DEMO_USER_ID
