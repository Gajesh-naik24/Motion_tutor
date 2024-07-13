// import { setLoader } from "./loader";

const fileUpload = document.getElementById("video-upload");
const dropzone = document.getElementById("drag-zone");
const videoName = document.getElementById("video-name");
const uploadedVideo = document.getElementById("uploaded-video");
const uploadedSection = document.getElementById("uploaded-section");
const transferBtn = document.getElementById("transfer-btn");
const beforeUpload = document.getElementById("before-upload");
const output = document.getElementById("output-video");
const outputSection = document.getElementById("outputVideo");

const videoUpload = () => {
  fileUpload.click();
};
const handleChange = () => {
  const file = fileUpload.files[0];
  handleFileUpload(file);
};
fileUpload.addEventListener("change", handleChange);
dropzone.addEventListener("dragenter", (e) => {
  e.preventDefault();
  dropzone.style.backgroundColor = "rgb(209 213 219)";
});

dropzone.addEventListener("dragleave", () => {
  dropzone.style.backgroundColor = "transparent";
});
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.style.backgroundColor = "transparent";
  const file = e.dataTransfer.files[0];
  handleFileUpload(file);
});
transferBtn.addEventListener("click", () => {
  let file = fileUpload.files[0];
  handleTransfer(file);
});

const handleFileUpload = (file) => {
  if (file.type !== "video/mp4") {
    alert("Please select an MP4 video file.");
    return;
  }

  videoName.innerText = `Uploading: ${file.name}`;

  const videoURL = URL.createObjectURL(file);
  uploadedVideo.src = videoURL;
  uploadedSection.classList.remove("hidden");
  uploadedSection.classList.add("flex");
  beforeUpload.classList.remove("flex");
  beforeUpload.classList.add("hidden");
};

const handleCancel = () => {
  videoName.innerText = ``;
  uploadedVideo.src = "";
  uploadedSection.classList.remove("flex");
  uploadedSection.classList.add("hidden");
  beforeUpload.classList.remove("hidden");
  beforeUpload.classList.add("flex");
  window.location.reload();
  return;
};

const handleTransfer = (file) => {
  setLoader(true)
  const formData = new FormData();

  formData.append("video", file);

  fetch("http://127.0.0.1:5000/videoprocess", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        alert("Network error");
      }
      return response.blob();
    })
    .then((data) => {
      setLoader(false)
      console.log("Video uploaded successfully");
      const url = URL.createObjectURL(data);
      outputSection.classList.remove("invisible")
      outputSection.classList.add("visible")
      output.src = url
      output.play()
      // const a = document.createElement("a")
      // a.download = "stick_figure.avi"
      // a.href = url
      // document.body.append(a)
      // a.click()
    })
    .catch((error) => {
      console.error(error);
      setLoader(false)
      alert("Error uploading video:");
    });
};