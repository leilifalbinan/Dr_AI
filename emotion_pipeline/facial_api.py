from flask import Flask, jsonify, Response
from flask_cors import CORS
import cv2
import time
from collections import Counter

app = Flask(__name__)
CORS(app)

cap = None
running = False
latest_emotion = "No Face"
emotion_history = []

# OpenCV Haar cascade for basic face detection
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

def classify_placeholder(face_roi):
    """
    Simple placeholder classifier so the GUI works reliably.
    Replace this with your real model later.
    """
    gray = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
    mean_val = gray.mean()

    if mean_val > 150:
        return "Happy"
    elif mean_val > 110:
        return "Neutral"
    elif mean_val > 80:
        return "Low Affect"
    else:
        return "Sad"

def generate_frames():
    global cap, running, latest_emotion, emotion_history

    while running:
        if cap is None:
            break

        ok, frame = cap.read()
        if not ok:
            break

        display = frame.copy()
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(80, 80)
        )

        detected_emotion = "No Face"

        if len(faces) > 0:
            # pick largest face
            x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
            face_roi = frame[y:y+h, x:x+w]

            detected_emotion = classify_placeholder(face_roi)

            cv2.rectangle(display, (x, y), (x+w, y+h), (0, 255, 0), 2)
            cv2.putText(
                display,
                detected_emotion,
                (x, max(y - 10, 20)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 255, 0),
                2
            )

            emotion_history.append({
                "emotion": detected_emotion,
                "time": time.time()
            })
            emotion_history = emotion_history[-300:]

        latest_emotion = detected_emotion

        cv2.putText(
            display,
            f"Emotion: {latest_emotion}",
            (20, 35),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.9,
            (255, 255, 255),
            2
        )

        ret, buffer = cv2.imencode(".jpg", display)
        if not ret:
            continue

        frame_bytes = buffer.tobytes()

        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
        )

@app.route("/api/facial/start", methods=["GET"])
def start_facial():
    global cap, running, latest_emotion, emotion_history

    if running:
        return jsonify({"status": "already running"})

    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    if not cap.isOpened():
        cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        return jsonify({"status": "error", "message": "Could not open webcam"}), 500

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    running = True
    latest_emotion = "No Face"
    emotion_history = []

    return jsonify({"status": "started"})

@app.route("/api/facial/stop", methods=["GET"])
def stop_facial():
    global cap, running, latest_emotion

    running = False
    latest_emotion = "Stopped"

    if cap is not None:
        cap.release()
        cap = None

    return jsonify({"status": "stopped"})

@app.route("/api/facial/live", methods=["GET"])
def facial_live():
    return Response(
        generate_frames(),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )

@app.route("/api/facial/emotion", methods=["GET"])
def facial_emotion():
    return jsonify({"emotion": latest_emotion})

@app.route("/api/facial/history", methods=["GET"])
def facial_history():
    counts = Counter([item["emotion"] for item in emotion_history])
    return jsonify({
        "history": emotion_history,
        "counts": dict(counts)
    })

@app.route("/api/facial/status", methods=["GET"])
def facial_status():
    global running
    return jsonify({"running": running})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5002, debug=True)