import os
import uuid


def current_user_id() -> uuid.UUID:
    # por enquanto, 1 único usuário fixo (modo de teste local)
    return uuid.UUID("00000000-0000-0000-0000-000000000001")
