#app/utils/image_upload.py
import io
import uuid
import boto3
from botocore.config import Config as BotoConfig
from PIL import Image
from fastapi import UploadFile, HTTPException
from app.core.config import get_settings

settings = get_settings()


def get_r2_client():
    return boto3.client(
        "s3",
        endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        config=BotoConfig(signature_version="s3v4"),
        region_name="auto",
    )


def _process_image(contents: bytes) -> tuple[bytes, str]:
    """Resize to fit within 1200x1200 and compress, mirroring the old Cloudinary transform"""
    img = Image.open(io.BytesIO(contents))
    img = img.convert("RGB") if img.mode in ("RGBA", "P") else img
    img.thumbnail((1200, 1200), Image.LANCZOS)

    buffer = io.BytesIO()
    img.save(buffer, format="JPEG", quality=85, optimize=True)
    return buffer.getvalue(), "image/jpeg"


async def upload_image(file: UploadFile, folder: str = "afrystride/products") -> dict:
    """Upload image to Cloudflare R2 and return public URL + object key"""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large (max 5MB)")

    try:
        processed, content_type = _process_image(contents)
    except Exception:
        raise HTTPException(status_code=400, detail="Could not process image file")

    key = f"{folder}/{uuid.uuid4().hex}.jpg"

    try:
        client = get_r2_client()
        client.put_object(
            Bucket=settings.R2_BUCKET_NAME,
            Key=key,
            Body=processed,
            ContentType=content_type,
        )
        url = f"{settings.R2_PUBLIC_URL.rstrip('/')}/{key}"
        return {"url": url, "key": key}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")


async def delete_image(key: str) -> bool:
    """Delete image from Cloudflare R2 by object key"""
    try:
        client = get_r2_client()
        client.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=key)
        return True
    except Exception:
        return False