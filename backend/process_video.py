import cv2
import mediapipe as mp
import numpy as np
import os

def process_video_func(input_video_path, output_video_folder_path):
    mp_drawing = mp.solutions.drawing_utils
    mp_holistic = mp.solutions.holistic
    mp_drawing_styles = mp.solutions.drawing_styles

    process_video_path = os.path.join(output_video_folder_path,'stick_dance.mp4')

    cap = cv2.VideoCapture(input_video_path)

    # Get video properties
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # Define the codec and create VideoWriter object
    fourcc = cv2.VideoWriter_fourcc('V','P','8','0')
    out = cv2.VideoWriter(process_video_path, fourcc, fps, (width, height))

    with mp_holistic.Holistic(
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ) as holistic:
        while cap.isOpened():
            ret, image = cap.read()

            if not ret:
                break

            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            result = holistic.process(image)

            # Check if pose landmarks are detected
            if result.pose_landmarks is not None:
                # Create a blank image to draw only the stick figure
                stick_figure_image = np.zeros_like(image)

                # Draw only the pose landmarks (stick figure)
                mp_drawing.draw_landmarks(
                    stick_figure_image,
                    result.pose_landmarks,
                    mp_holistic.POSE_CONNECTIONS,
                    landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style()
                )

                # Write the stick figure frame to the output video
                out.write(stick_figure_image)

    cap.release()
    out.release()
    cv2.destroyAllWindows()

    return process_video_path
