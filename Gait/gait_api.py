import os
import time
import json
import threading
import cv2
from flask import Flask, jsonify, request, send_from_directory, Response
from flask_cors import CORS

from gait_capture_realsense_advanced import capture_motion_realsense, request_stop

app = Flask(__name__)
CORS(app)

OUTPUT_DIR = os.path.abspath("./gait_outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

_frame_lock = threading.Lock()
_latest_jpeg = None


def _update_latest_frame_bgr(frame_bgr):
    global _latest_jpeg
    ok, buf = cv2.imencode(".jpg", frame_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
    if not ok:
        return
    with _frame_lock:
        _latest_jpeg = buf.tobytes()


def _mjpeg_generator():
    global _latest_jpeg
    while True:
        with _frame_lock:
            jpg = _latest_jpeg
        if jpg is None:
            time.sleep(0.02)
            continue

        yield (b"--frame\r\n"
               b"Content-Type: image/jpeg\r\n\r\n" + jpg + b"\r\n")
        time.sleep(1 / 30.0)


@app.route("/api/gait/live", methods=["GET"])
def api_gait_live():
    return Response(
        _mjpeg_generator(),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )


@app.route("/api/gait", methods=["GET"])
def api_gait():
    try:
        duration = request.args.get("duration", default=0.0, type=float)
        max_duration_s = None if duration <= 0 else float(duration)

        ts = time.strftime("%Y%m%d_%H%M%S")
        video_name = f"gait_overlay_{ts}.mp4"
        video_path = os.path.join(OUTPUT_DIR, video_name)

        json_name = f"gait_summary_{ts}.json"
        json_path = os.path.join(OUTPUT_DIR, json_name)

        summary = capture_motion_realsense(
            max_duration_s=max_duration_s,
            export_overlay_video=True,
            overlay_out_path=video_path,
            show_window=False,
            frame_callback=_update_latest_frame_bgr,
        )

        overlay_video_url = f"/api/gait/video/{video_name}"
        summary_json_url = f"/api/gait/summary/{json_name}"

        summary["overlay_video_url"] = overlay_video_url
        summary["summary_json_url"] = summary_json_url

        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2)

        return jsonify({"ok": True, "summary": summary})

    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/api/gait/stop", methods=["POST"])
def api_gait_stop():
    request_stop()
    return jsonify({"ok": True})


@app.route("/api/gait/video/<path:filename>", methods=["GET"])
def api_gait_video(filename):
    return send_from_directory(OUTPUT_DIR, filename, as_attachment=False)


@app.route("/api/gait/summary/<path:filename>", methods=["GET"])
def api_gait_summary(filename):
    return send_from_directory(OUTPUT_DIR, filename, as_attachment=False)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True, threaded=True)
