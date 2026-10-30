"""
PNG text chunk processor - detects Stable Diffusion/Automatic1111 parameters
"""
import io
import zlib
from typing import Dict, Any, List
from PIL import Image as PILImage

from .base import BaseProcessor, AISignature


class PngProcessor(BaseProcessor):
    """Processor for PNG text chunks (tEXt, zTXt, iTXt)"""

    # Known PNG text chunk keys used by AI tools
    AI_CHUNK_KEYS = [
        "parameters",           # Stable Diffusion / Automatic1111
        "prompt",               # Generic AI prompt
        "negative_prompt",      # SD negative prompt
        "sd-metadata",          # Stable Diffusion metadata
        "dream",                # WOMBO Dream
        "ai-generated",         # Generic AI marker
        "generated-by",         # Generic generator marker
        "model",                # Model name
        "sampling_method",      # SD sampling
        "steps",                # SD steps
        "cfg_scale",            # SD CFG scale
        "seed",                 # SD seed
        "sampler",              # SD sampler
        "model_hash",           # SD model hash
        "ensd",                 # SD eta noise seed delta
    ]

    # Keywords that indicate AI generation in chunk values
    AI_VALUE_KEYWORDS = [
        "stable diffusion", "automatic1111", "auto1111", "a1111",
        "comfyui", "invokeai", "sdxl", "sd 1.5", "sd 2.1",
        "checkpoint", "vae", "clip", "unet", "diffusion",
        "denoising", "latent", "embedding", "lora", "lycoris",
        "controlnet", "img2img", "txt2img", "inpaint",
        "dpm++", "euler a", "euler", "heun", "dpm2", "dpm",
        "karras", "exponential", "restart", "ddim",
    ]

    @property
    def name(self) -> str:
        return "png_chunks"

    def extract(self, image: PILImage.Image, raw_bytes: bytes) -> Dict[str, Any]:
        """Extract PNG text chunks"""
        if image.format != "PNG":
            return {}

        chunks = {}

        # Method 1: Via PIL info dict
        if hasattr(image, "info"):
            for key, value in image.info.items():
                if key in ("srgb", "gamma", "transparency", "aspect"):
                    # Skip non-text chunks
                    continue
                if isinstance(value, bytes):
                    try:
                        value = value.decode("utf-8", errors="ignore")
                    except:
                        value = str(value)
                chunks[key] = str(value)[:5000]  # Limit length

        # Method 2: Manual PNG chunk parsing for more detail
        manual_chunks = self._parse_png_chunks(raw_bytes)
        if manual_chunks:
            # Merge, preferring manual parse for text chunks
            for key, value in manual_chunks.items():
                if key not in chunks or len(value) > len(chunks.get(key, "")):
                    chunks[key] = value

        return {"chunks": chunks} if chunks else {}

    def _parse_png_chunks(self, raw_bytes: bytes) -> Dict[str, str]:
        """Manually parse PNG chunks to extract text data"""
        chunks = {}

        if raw_bytes[:8] != b"\x89PNG\r\n\x1a\n":
            return chunks

        pos = 8  # Skip PNG signature

        while pos < len(raw_bytes):
            if pos + 8 > len(raw_bytes):
                break

            # Read chunk length (4 bytes) and type (4 bytes)
            length = int.from_bytes(raw_bytes[pos:pos+4], "big")
            chunk_type = raw_bytes[pos+4:pos+8].decode("ascii", errors="ignore")

            if pos + 12 + length > len(raw_bytes):
                break

            chunk_data = raw_bytes[pos+8:pos+8+length]

            # Parse text chunks
            if chunk_type == "tEXt":
                try:
                    # tEXt: key\0value (Latin-1)
                    null_pos = chunk_data.find(b"\x00")
                    if null_pos > 0:
                        key = chunk_data[:null_pos].decode("latin-1", errors="ignore")
                        value = chunk_data[null_pos+1:].decode("latin-1", errors="ignore")
                        chunks[key] = value[:5000]
                except:
                    pass

            elif chunk_type == "zTXt":
                try:
                    # zTXt: key\0compression_method\0compressed_value
                    null_pos = chunk_data.find(b"\x00")
                    if null_pos > 0:
                        key = chunk_data[:null_pos].decode("latin-1", errors="ignore")
                        rest = chunk_data[null_pos+1:]
                        # Skip compression method byte
                        if len(rest) > 1:
                            compressed = rest[1:]
                            value = zlib.decompress(compressed).decode("latin-1", errors="ignore")
                            chunks[key] = value[:5000]
                except:
                    pass

            elif chunk_type == "iTXt":
                try:
                    # iTXt: key\0compression_flag\0compression_method\0language\0translated_key\0value
                    parts = chunk_data.split(b"\x00")
                    if len(parts) >= 3:
                        key = parts[0].decode("utf-8", errors="ignore")
                        # Check if compressed
                        if len(parts) > 2 and parts[1] == b"1":
                            # Compressed text
                            try:
                                value = zlib.decompress(parts[-1]).decode("utf-8", errors="ignore")
                            except:
                                value = parts[-1].decode("utf-8", errors="ignore")
                        else:
                            value = parts[-1].decode("utf-8", errors="ignore")
                        chunks[key] = value[:5000]
                except:
                    pass

            # Move to next chunk (length + type + data + CRC)
            pos += 12 + length

        return chunks

    def detect_ai_signatures(self, metadata: Dict[str, Any]) -> List[AISignature]:
        """Detect AI generation signatures in PNG chunks"""
        signatures = []

        chunks = metadata.get("chunks", {})

        # Check for known AI chunk keys
        for key in chunks.keys():
            key_lower = key.lower()
            for ai_key in self.AI_CHUNK_KEYS:
                if ai_key.lower() in key_lower:
                    value = chunks[key]
                    signatures.append(AISignature(
                        type="PNG Text Chunk",
                        detail=f"Key '{key}': {value[:150]}...",
                        confidence="high"
                    ))
                    break

        # Check chunk values for AI keywords
        for key, value in chunks.items():
            value_lower = value.lower()
            for keyword in self.AI_VALUE_KEYWORDS:
                if keyword in value_lower:
                    # Avoid duplicates
                    already_found = any(s.detail.startswith(f"Key '{key}'") for s in signatures)
                    if not already_found:
                        signatures.append(AISignature(
                            type="PNG AI Content",
                            detail=f"In '{key}': found '{keyword}' — {value[:150]}...",
                            confidence="high"
                        ))
                    break

        # Special detection: Full SD parameter block
        for key, value in chunks.items():
            if "steps" in value.lower() and "cfg" in value.lower() and "sampler" in value.lower():
                signatures.append(AISignature(
                    type="Stable Diffusion Parameters",
                    detail=f"Complete generation parameters found in '{key}'",
                    confidence="high"
                ))
                break

        return signatures

    def strip(self, image: PILImage.Image, raw_bytes: bytes) -> bytes:
        """Strip PNG text chunks while preserving image data"""
        if image.format != "PNG":
            return super().strip(image, raw_bytes)

        # Re-save the image - PIL will drop text chunks when saving without them
        output = io.BytesIO()

        # Convert to RGB if necessary (removes some metadata)
        clean_image = image.copy()

        # Save without any info dict entries (which contain text chunks)
        clean_image.save(
            output,
            format="PNG",
            optimize=True,
        )

        return output.getvalue()
