from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext


# JWT configuration
SECRET_KEY = "drishtiai-development-secret-key-change-later"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


# Password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str) -> str:
    """Convert a plain password into a secure hash."""
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    """Check whether a password matches its stored hash."""
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


def create_access_token(
    user_id: int,
    email: str
) -> str:
    """Create JWT access token for authenticated user."""

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": expire
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def decode_access_token(token: str):
    """Decode and validate JWT token."""

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            return None

        return payload

    except JWTError:
        return None