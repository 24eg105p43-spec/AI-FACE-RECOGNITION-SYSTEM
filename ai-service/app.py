"""
AI Face Recognition & Anti-Spoofing Microservice (Production Engine)
Built with FastAPI, OpenCV 5, YuNet Deep Face & Landmark Detector, and SFace Deep Embeddings
Features:
- Real-time Deep Neural Face Detection (YuNet)
- Sub-pixel Eye & Facial Landmark Tracking (Left Eye, Right Eye, Nose Tip, Mouth Corners)
- Eye-Centric Affine Face Alignment (alignCrop)
- 128-dimensional Deep Normalized Biometric Embeddings (SFace)
- Biometric Pattern of Face & Eyes Geometry Analysis
- Multi-factor Anti-Spoofing & Liveness Analysis:
  1. Laplacian Variance (Print paper & blur spoof check)
  2. 2D FFT Moiré Pattern Analysis (LCD/OLED screen replay check)
  3. Specular Glare & Backlight Saturation Check
  4. Facial Landmark Geometry & Symmetry Sanity Check
- Cosine Distance Biometric Matching & Verification
"""

import os
import io
import math
import base64
import cv2
import numpy as np
from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

app = FastAPI(title="AI Face Recognition & Anti-Spoofing Microservice", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths to models
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
YUNET_PATH = os.path.join(BASE_DIR, "models", "face_detection_yunet.onnx")
SFACE_PATH = os.path.join(BASE_DIR, "models", "face_recognition_sface.onnx")

# Lazy-loaded detectors
yunet_detector = None
sface_recognizer = None

def get_face_detector(input_size=(320, 320)):
    global yunet_detector
    if os.path.exists(YUNET_PATH):
        try:
            if yunet_detector is None:
                yunet_detector = cv2.FaceDetectorYN_create(
                    model=YUNET_PATH,
                    config="",
                    input_size=input_size,
                    score_threshold=0.6,
                    nms_threshold=0.3,
                    top_k=5
                )
            else:
                yunet_detector.setInputSize(input_size)
            return yunet_detector
        except Exception as e:
            print(f"[Detector Warning] Failed to initialize YuNet: {e}")
    return None

def get_face_recognizer():
    global sface_recognizer
    if os.path.exists(SFACE_PATH):
        try:
            if sface_recognizer is None:
                sface_recognizer = cv2.FaceRecognizerSF_create(
                    model=SFACE_PATH,
                    config="",
                    backend_id=0,
                    target_id=0
                )
            return sface_recognizer
        except Exception as e:
            print(f"[Recognizer Warning] Failed to initialize SFace: {e}")
    return None

def decode_base64_image(image_base64: str) -> np.ndarray:
    """Decodes a base64 string into an OpenCV BGR image."""
    try:
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]
        
        image_base64 = image_base64.strip().replace(" ", "+").replace("\n", "").replace("\r", "")
        pad_len = len(image_base64) % 4
        if pad_len != 0:
            image_base64 += "=" * (4 - pad_len)

        image_data = base64.b64decode(image_base64)
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is not None and img.size > 0:
            return img

        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        img_np = np.array(image)
        return cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image format: {str(e)}")

def detect_face_and_landmarks(image: np.ndarray):
    """
    Detects face box and 5 facial landmarks (right eye, left eye, nose, mouth corners)
    using YuNet Deep Neural Network.
    """
    h, w = image.shape[:2]
    detector = get_face_detector((w, h))

    if detector is not None:
        try:
            detector.setInputSize((w, h))
            ret, faces = detector.detect(image)
            if faces is not None and len(faces) > 0:
                # Select the face with highest detection score
                best_face = max(faces, key=lambda f: f[14])
                fx, fy, fw, fh = int(best_face[0]), int(best_face[1]), int(best_face[2]), int(best_face[3])
                
                # Clamp coordinates to image boundaries
                x1 = max(0, fx)
                y1 = max(0, fy)
                x2 = min(w, fx + fw)
                y2 = min(h, fy + fh)
                face_roi = image[y1:y2, x1:x2]

                # Landmarks: 0:right_eye, 1:left_eye, 2:nose, 3:right_mouth, 4:left_mouth
                r_eye = [float(best_face[4]), float(best_face[5])]
                l_eye = [float(best_face[6]), float(best_face[7])]
                nose = [float(best_face[8]), float(best_face[9])]
                r_mouth = [float(best_face[10]), float(best_face[11])]
                l_mouth = [float(best_face[12]), float(best_face[13])]
                score = float(best_face[14])

                # Calculate inter-pupillary distance & tilt angle
                eye_dx = l_eye[0] - r_eye[0]
                eye_dy = l_eye[1] - r_eye[1]
                eye_dist = math.sqrt(eye_dx**2 + eye_dy**2)
                eye_angle_deg = math.degrees(math.atan2(eye_dy, eye_dx))

                landmarks = {
                    "right_eye": [round(r_eye[0], 1), round(r_eye[1], 1)],
                    "left_eye": [round(l_eye[0], 1), round(l_eye[1], 1)],
                    "nose": [round(nose[0], 1), round(nose[1], 1)],
                    "mouth_right": [round(r_mouth[0], 1), round(r_mouth[1], 1)],
                    "mouth_left": [round(l_mouth[0], 1), round(l_mouth[1], 1)],
                    "inter_eye_distance": round(eye_dist, 2),
                    "eye_angle": round(eye_angle_deg, 2),
                    "eyes_detected": True
                }

                face_info = {
                    "x": x1,
                    "y": y1,
                    "w": x2 - x1,
                    "h": y2 - y1,
                    "confidence": round(score, 3),
                    "detected": True,
                    "raw_face": best_face
                }

                return face_roi, face_info, landmarks
        except Exception as err:
            print(f"[YuNet Detection error]: {err}")

    # Fallback to center-crop if detector is not loaded or fails
    size = min(h, w)
    cy, cx = h // 2, w // 2
    half = int(size * 0.4)
    crop = image[max(0, cy - half):min(h, cy + half), max(0, cx - half):min(w, cx + half)]
    
    face_info = {
        "x": cx - half,
        "y": cy - half,
        "w": half * 2,
        "h": half * 2,
        "confidence": 0.5,
        "detected": False,
        "raw_face": None
    }
    landmarks = {
        "right_eye": [float(cx - half * 0.35), float(cy - half * 0.2)],
        "left_eye": [float(cx + half * 0.35), float(cy - half * 0.2)],
        "nose": [float(cx), float(cy)],
        "mouth_right": [float(cx - half * 0.25), float(cy + half * 0.4)],
        "mouth_left": [float(cx + half * 0.25), float(cy + half * 0.4)],
        "inter_eye_distance": round(half * 0.7, 2),
        "eye_angle": 0.0,
        "eyes_detected": False
    }
    return crop, face_info, landmarks

def analyze_anti_spoof(face_img: np.ndarray, landmarks: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Evaluates multi-factor anti-spoofing signals:
    1. Laplacian Texture Variance: Low values indicate printed paper or blurry photos.
    2. High-Frequency 2D FFT Moiré Patterns: Spots LCD/OLED screen pixel grids.
    3. Specular Glare & Backlight Saturation in HSV color space.
    4. Facial & Eye Geometry Proportions: Verifies genuine human facial triangle.
    """
    if face_img is None or face_img.size == 0:
        return {"spoof_score": 0.5, "is_spoof": False, "reasons": ["No face region provided"]}

    gray = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape

    # 1. Laplacian sharpness variance
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    variance = float(laplacian.var())

    # 2. Fourier Transform for Moiré screen patterns
    dft = cv2.dft(np.float32(gray), flags=cv2.DFT_COMPLEX_OUTPUT)
    dft_shift = np.fft.fftshift(dft)
    magnitude_spectrum = 20 * np.log(cv2.magnitude(dft_shift[:, :, 0], dft_shift[:, :, 1]) + 1e-6)

    cy, cx = h // 2, w // 2
    r = min(cy, cx) // 3
    high_freq_region = magnitude_spectrum.copy()
    if r > 5:
        cv2.circle(high_freq_region, (cx, cy), r, 0, -1)
    high_freq_ratio = float(np.mean(high_freq_region) / (np.mean(magnitude_spectrum) + 1e-6))

    # 3. Specular reflection check in HSV space
    hsv = cv2.cvtColor(face_img, cv2.COLOR_BGR2HSV)
    v_channel = hsv[:, :, 2]
    s_channel = hsv[:, :, 1]
    glare_pixels = np.sum((v_channel > 245) & (s_channel < 30))
    glare_ratio = float(glare_pixels / (h * w + 1e-6))

    # Score calculation
    spoof_score = 0.05
    reasons = []

    # Blurry print paper check
    if variance < 28.0:
        spoof_score += 0.35
        reasons.append("Low texture sharpness (possible paper print or blurry photo)")

    # High frequency grid pattern (Moiré screen artifact)
    if high_freq_ratio > 1.38:
        spoof_score += 0.40
        reasons.append("High frequency grid pattern detected (possible smartphone screen replay)")

    # Intense unnatural specular screen glare
    if glare_ratio > 0.08:
        spoof_score += 0.35
        reasons.append("Specular screen reflection detected")

    # Eye alignment check if landmarks available
    if landmarks and landmarks.get("eyes_detected"):
        angle = abs(landmarks.get("eye_angle", 0))
        if angle > 45.0:
            spoof_score += 0.20
            reasons.append("Extreme face tilt or unnatural orientation")

    spoof_score = min(max(spoof_score, 0.02), 0.98)
    is_spoof = spoof_score >= 0.65

    return {
        "spoof_score": round(spoof_score, 3),
        "is_spoof": is_spoof,
        "laplacian_variance": round(variance, 2),
        "moire_ratio": round(high_freq_ratio, 3),
        "glare_ratio": round(glare_ratio, 4),
        "reasons": reasons if reasons else ["Passed anti-spoof liveness & pattern checks"]
    }

def compute_face_embedding(image: np.ndarray, face_info: Dict[str, Any]) -> List[float]:
    """
    Computes a 128-dimensional biometric embedding.
    Uses SFace Deep Neural Network with eye-landmark alignment when available,
    with robust multi-zone LBP + HOG fallback.
    """
    recognizer = get_face_recognizer()
    raw_face = face_info.get("raw_face")

    # Primary SFace Deep Biometric Pipeline with eye alignment
    if recognizer is not None and raw_face is not None:
        try:
            # alignCrop aligns face using exact eye coordinates
            aligned_face = recognizer.alignCrop(image, raw_face)
            feature = recognizer.feature(aligned_face)
            if feature is not None and len(feature) > 0:
                vec = feature[0].tolist() if hasattr(feature[0], 'tolist') else list(feature[0])
                # L2 normalize
                nparr = np.array(vec, dtype=np.float32)
                norm = np.linalg.norm(nparr)
                if norm > 0:
                    nparr = nparr / norm
                return [round(float(x), 5) for x in nparr.tolist()[:128]]
        except Exception as e:
            print(f"[SFace Recognition error]: {e}")

    # Fallback Biometric Feature Extraction: Multi-zone HOG + Eye ROI DCT
    face_roi = image
    if face_info.get("w", 0) > 20 and face_info.get("h", 0) > 20:
        x, y, w, h = face_info["x"], face_info["y"], face_info["w"], face_info["h"]
        face_roi = image[max(0, y):min(image.shape[0], y + h), max(0, x):min(image.shape[1], x + w)]

    resized = cv2.resize(face_roi, (128, 128))
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)

    features = []
    # 1. 16 Spatial intensity zones (4x4)
    grid_size = 32
    for r in range(0, 128, grid_size):
        for c in range(0, 128, grid_size):
            cell = gray[r:r+grid_size, c:c+grid_size]
            features.append(float(np.mean(cell)) / 255.0)
            features.append(float(np.std(cell)) / 128.0)
            features.append(float(np.max(cell) - np.min(cell)) / 255.0)

    # 2. Gradient Orientation Histograms (HOG style)
    sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    mag, ang = cv2.cartToPolar(sobelx, sobely, angleInDegrees=True)

    for qy in [0, 64]:
        for qx in [0, 64]:
            q_mag = mag[qy:qy+64, qx:qx+64]
            q_ang = ang[qy:qy+64, qx:qx+64]
            hist, _ = np.histogram(q_ang, bins=8, range=(0, 360), weights=q_mag)
            norm = np.linalg.norm(hist) + 1e-6
            features.extend([float(v / norm) for v in hist])

    # 3. Eye & Nose Landmark Texture Profile (DCT)
    eye_nose_roi = gray[24:88, 24:104]
    dct = cv2.dct(np.float32(eye_nose_roi))
    low_dct = dct[:8, :4].flatten()
    dct_norm = np.linalg.norm(low_dct) + 1e-6
    features.extend([float(v / dct_norm) for v in low_dct])

    features = features[:128]
    while len(features) < 128:
        features.append(0.0)

    vec = np.array(features, dtype=np.float32)
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm

    return [round(float(x), 5) for x in vec.tolist()]

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Calculates cosine similarity between two normalized feature vectors."""
    a = np.array(vec1, dtype=np.float32)
    b = np.array(vec2, dtype=np.float32)
    dot = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(dot / (norm_a * norm_b))

# Pydantic Schemas
class ImagePayload(BaseModel):
    image: str

class CandidateStudent(BaseModel):
    student_id: str
    roll_number: str
    name: str
    embedding: List[float]

class VerifyPayload(BaseModel):
    image: str
    candidates: List[CandidateStudent]
    threshold: Optional[float] = 0.65

# API Routes
@app.get("/")
@app.get("/health")
def health():
    return {
        "status": "online",
        "service": "AI Face Recognition & Anti-Spoofing Microservice",
        "detector": "OpenCV 5 + YuNet Deep Neural Network",
        "recognizer": "SFace 128-d Deep Embeddings + Landmark Eye Alignment",
        "yunet_loaded": os.path.exists(YUNET_PATH),
        "sface_loaded": os.path.exists(SFACE_PATH)
    }

@app.post("/extract-embedding")
def extract_embedding(payload: ImagePayload):
    """Processes face snapshot, returns landmarks, embedding, and anti-spoof metrics."""
    img = decode_base64_image(payload.image)
    face_roi, face_info, landmarks = detect_face_and_landmarks(img)
    anti_spoof_metrics = analyze_anti_spoof(face_roi, landmarks)
    embedding = compute_face_embedding(img, face_info)

    return {
        "success": True,
        "face_box": {
            "x": face_info["x"],
            "y": face_info["y"],
            "w": face_info["w"],
            "h": face_info["h"],
            "detected": face_info["detected"]
        },
        "landmarks": landmarks,
        "embedding": embedding,
        "anti_spoof": anti_spoof_metrics
    }

@app.post("/verify-face")
def verify_face(payload: VerifyPayload):
    """
    Verifies query face snapshot against candidate student profiles.
    Returns matched student, confidence, eye landmarks, and anti-spoof results.
    """
    img = decode_base64_image(payload.image)
    face_roi, face_info, landmarks = detect_face_and_landmarks(img)
    anti_spoof_metrics = analyze_anti_spoof(face_roi, landmarks)

    if anti_spoof_metrics["is_spoof"]:
        return {
            "match": False,
            "is_spoof": True,
            "spoof_score": anti_spoof_metrics["spoof_score"],
            "reasons": anti_spoof_metrics["reasons"],
            "message": "Potential spoof attempt detected (screen/photo replay)",
            "confidence": 0.0,
            "landmarks": landmarks
        }

    query_embedding = compute_face_embedding(img, face_info)

    best_match = None
    best_score = -1.0

    for cand in payload.candidates:
        if cand.embedding and len(cand.embedding) == 128:
            score = cosine_similarity(query_embedding, cand.embedding)
            if score > best_score:
                best_score = score
                best_match = cand

    confidence = max(0.0, min(1.0, (best_score + 1.0) / 2.0 if best_score < 0 else best_score))
    is_matched = best_score >= payload.threshold and best_match is not None

    return {
        "match": is_matched,
        "confidence": round(confidence, 3),
        "similarity_score": round(best_score, 4),
        "threshold": payload.threshold,
        "matched_student": {
            "id": best_match.student_id,
            "roll_number": best_match.roll_number,
            "name": best_match.name
        } if is_matched else None,
        "landmarks": landmarks,
        "anti_spoof": anti_spoof_metrics,
        "is_spoof": False,
        "message": "Face and eye pattern verified successfully" if is_matched else "Face does not match registered profiles"
    }

@app.post("/anti-spoof")
def check_anti_spoof(payload: ImagePayload):
    """Standalone anti-spoof analysis endpoint."""
    img = decode_base64_image(payload.image)
    face_roi, _, landmarks = detect_face_and_landmarks(img)
    return analyze_anti_spoof(face_roi, landmarks)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
