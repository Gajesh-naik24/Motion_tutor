import math
from flask import Flask, request, jsonify,send_file
from werkzeug.utils import secure_filename
from process_video import process_video_func
from flask_cors import CORS, cross_origin # type: ignore
from flask_socketio import SocketIO, emit # type: ignore
import cv2 # type: ignore
import mediapipe as mp # type: ignore
import numpy as np # type: ignore
import os


import os

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
socketio = SocketIO(app,cors_allowed_origins="*")


current_directory = os.path.dirname(__file__)

VIDEO_UPLOAD_FOLDER = os.path.join(current_directory, 'static', 'videos')
app.config['UPLOAD_FOLDER'] = VIDEO_UPLOAD_FOLDER

VIDEO_PROCESS_FOLDER = os.path.join(current_directory,'static','processed_videos')
app.config['PROCESS_FOLDER'] = VIDEO_PROCESS_FOLDER

if not os.path.exists(VIDEO_UPLOAD_FOLDER):
    os.makedirs(VIDEO_UPLOAD_FOLDER)

if not os.path.exists(VIDEO_PROCESS_FOLDER):
    os.makedirs(VIDEO_PROCESS_FOLDER)    


@socketio.on("connect")
def connected():
    """event listener when client connects to the server"""
    print(request.sid)
    print("client has connected")


@app.route('/videoprocess', methods=['POST'])
@cross_origin()
def handle_video():
    if 'video' not in request.files:
        return jsonify({'error': 'No file part'})
    
    file = request.files['video']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    allowed_extensions = {'mp4', 'avi', 'mov', 'mkv', 'wmv'}
    if '.' not in file.filename or file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return jsonify({'error': 'Unsupported file type'})
    
    filename = secure_filename("input.mp4")
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

    processed_videos_folder_path = os.path.join(current_directory,'static','processed_videos')
    processed_video_output_path = process_video_func(file_path, processed_videos_folder_path)
    
    return send_file(processed_video_output_path,as_attachment=False)
    

@app.route("/")
@cross_origin()
def hello_world():
    return "<p>Hello, World!</p>"

@app.route('/animatevideo', methods=['POST'])
def animate_video():
    input_video_path = os.path.join(app.config['UPLOAD_FOLDER'], "imgs","jump.jpg")

    mp_drawing = mp.solutions.drawing_utils
    mp_pose = mp.solutions.pose

    cap = cv2.VideoCapture(input_video_path)

    with mp_pose.Pose(
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
        model_complexity = 1,
        smooth_landmarks = True,
        enable_segmentation = True,
        smooth_segmentation = True,
        static_image_mode = True,
    ) as pose:
        while cap.isOpened():
            ret, image = cap.read()

            if not ret:
                break

            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            result = pose.process(image)

            # Check if pose landmarks are detected
            if result.pose_world_landmarks is not None:
                # Extract and format keypoints data
                keypoints = extract_keypoints(result.pose_world_landmarks)
                
                # Send keypoints data to frontend
                socketio.emit('keypoints_data', keypoints)

    cap.release()

    return jsonify({'message': 'Video processing completed'})


def extract_keypoints(pose_landmarks):
    # Extract and format keypoints data
    keypoints = []
    for landmark in pose_landmarks.landmark:
        keypoints.append({
            'x': landmark.x,
            'y': landmark.y,
            'z': landmark.z if landmark.HasField('z') else None  # Add z coordinate if available
        })
    return keypoints



if __name__ == '__main__':
    socketio.run(app, debug=True,port=5000)
