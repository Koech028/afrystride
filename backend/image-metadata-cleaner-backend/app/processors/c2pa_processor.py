"""
C2PA (Content Authenticity Initiative) processor
Detects Content Credentials manifests in images
"""
import io
import json
from typing import Dict, Any, List
from PIL import Image as PILImage

from .base import BaseProcessor, AISignature


class C2paProcessor(BaseProcessor):
    """Processor for C2PA Content Credentials manifests"""

    # C2PA box type identifier
    C2PA_BOX_TYPE = b"uuid\x05\xa6\xba\x82\xa7\x08\x47\x84\xb7\x94\x91\x63\x6b\x58\x53"
    # Alternative: look for "c2pa" in raw bytes
    C2PA_SIGNATURES = [b"c2pa.", b"C2PA", b"contentauth", b"content_credentials"]

    # Known C2PA tool indicators
    C2PA_TOOLS = [
        "adobe", "photoshop", "lightroom", "firefly",
        "openai", "dall-e", "chatgpt",
        "microsoft", "bing", "designer",
        "truepic", "leica", "sony", "canon", "nikon",
    ]

    @property
    def name(self) -> str:
        return "c2pa"

    def extract(self, image: PILImage.Image, raw_bytes: bytes) -> Dict[str, Any]:
        """Extract C2PA manifest information"""
        result = {
            "manifest_present": False,
            "manifest_version": None,
            "generator": None,
            "claims": [],
            "raw_detected": False,
        }

        # Check for C2PA signatures in raw bytes
        raw_lower = raw_bytes.lower()
        for sig in self.C2PA_SIGNATURES:
            if sig.lower() in raw_lower:
                result["raw_detected"] = True
                break

        # Try to find C2PA manifest box in PNG/JPEG
        if image.format == "PNG":
            manifest_data = self._find_png_c2pa(raw_bytes)
            if manifest_data:
                result["manifest_present"] = True
                result.update(manifest_data)
        elif image.format in ("JPEG", "JPG"):
            manifest_data = self._find_jpeg_c2pa(raw_bytes)
            if manifest_data:
                result["manifest_present"] = True
                result.update(manifest_data)

        # Try python-c2pa if available
        try:
            import c2pa
            # Attempt to read C2PA data
            reader = c2pa.Reader("image/jpeg", io.BytesIO(raw_bytes))
            manifest_store = reader.get_manifest_store()
            if manifest_store and manifest_store.manifests:
                result["manifest_present"] = True
                result["manifest_version"] = "2.0"
                result["manifests_count"] = len(manifest_store.manifests)

                for manifest in manifest_store.manifests:
                    if hasattr(manifest, 'claim_generator'):
                        result["generator"] = manifest.claim_generator
                    if hasattr(manifest, 'title'):
                        result["title"] = manifest.title
        except ImportError:
            result["python_c2pa_available"] = False
        except Exception:
            pass

        return result

    def _find_png_c2pa(self, raw_bytes: bytes) -> Dict[str, Any]:
        """Find C2PA data in PNG chunks"""
        result = {}

        # Look for caBX chunk (C2PA box)
        pos = 8  # Skip PNG signature
        while pos < len(raw_bytes) - 12:
            length = int.from_bytes(raw_bytes[pos:pos+4], "big")
            chunk_type = raw_bytes[pos+4:pos+8]

            if chunk_type == b"caBX":
                result["chunk_type"] = "caBX"
                result["chunk_size"] = length
                # Try to extract some info
                chunk_data = raw_bytes[pos+8:pos+8+length]
                if b'{"' in chunk_data:
                    try:
                        json_start = chunk_data.find(b"{\"")
                        if json_start > 0:
                            json_data = chunk_data[json_start:].decode("utf-8", errors="ignore")
                            parsed = json.loads(json_data[:2000])
                            if "claim_generator" in parsed:
                                result["generator"] = parsed["claim_generator"]
                    except:
                        pass
                break

            pos += 12 + length

        return result

    def _find_jpeg_c2pa(self, raw_bytes: bytes) -> Dict[str, Any]:
        """Find C2PA data in JPEG APP11 segments"""
        result = {}

        pos = 0
        while pos < len(raw_bytes) - 4:
            if raw_bytes[pos] == 0xFF:
                marker = raw_bytes[pos+1]

                # APP11 marker (0xEB) is used for C2PA
                if marker == 0xEB:
                    length = int.from_bytes(raw_bytes[pos+2:pos+4], "big")
                    segment_data = raw_bytes[pos+4:pos+2+length]

                    # Check for C2PA identifier
                    if b"C2PA" in segment_data or b"c2pa" in segment_data:
                        result["segment_found"] = True
                        result["segment_size"] = length

                        # Try to extract generator info
                        for tool in self.C2PA_TOOLS:
                            if tool.encode() in segment_data.lower():
                                result["generator"] = tool.title()
                                break
                        break

                # Skip padding
                if marker == 0x00:
                    pos += 1
                    continue

                # Skip markers without length
                if marker in (0x01, 0xD0, 0xD1, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8, 0xD9):
                    pos += 2
                    continue

                # Read segment length
                if pos + 4 <= len(raw_bytes):
                    length = int.from_bytes(raw_bytes[pos+2:pos+4], "big")
                    pos += 2 + length
                else:
                    break
            else:
                pos += 1

        return result

    def detect_ai_signatures(self, metadata: Dict[str, Any]) -> List[AISignature]:
        """Detect AI generation from C2PA data"""
        signatures = []

        if not metadata.get("manifest_present") and not metadata.get("raw_detected"):
            return signatures

        generator = metadata.get("generator")

        if metadata.get("manifest_present"):
            sig_detail = "C2PA Content Credentials manifest detected"
            if generator:
                sig_detail += f" — Generator: {generator}"

            signatures.append(AISignature(
                type="C2PA Manifest",
                detail=sig_detail,
                confidence="high"
            ))
        elif metadata.get("raw_detected"):
            signatures.append(AISignature(
                type="C2PA Signature",
                detail="C2PA signatures found in image data (manifest may be incomplete)",
                confidence="medium"
            ))

        # Check if generator is a known AI tool
        if generator:
            gen_lower = generator.lower()
            ai_tools = ["firefly", "openai", "dall-e", "bing", "designer"]
            for tool in ai_tools:
                if tool in gen_lower:
                    signatures.append(AISignature(
                        type="C2PA AI Generator",
                        detail=f"C2PA manifest generated by AI tool: {generator}",
                        confidence="high"
                    ))
                    break

        return signatures

    def strip(self, image: PILImage.Image, raw_bytes: bytes) -> bytes:
        """
        C2PA stripping requires removing the manifest box/segment.
        Re-encoding the image is the safest approach.
        """
        output = io.BytesIO()
        clean_image = image.copy()

        if image.format == "PNG":
            clean_image.save(output, format="PNG", optimize=True)
        elif image.format in ("JPEG", "JPG"):
            clean_image.save(output, format="JPEG", quality=95, optimize=True, exif=b"")
        elif image.format == "WEBP":
            clean_image.save(output, format="WEBP", quality=95, exif=b"")
        else:
            clean_image.save(output, format=image.format)

        return output.getvalue()
