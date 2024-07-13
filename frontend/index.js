const projectTitle = "MotionTutor"
const mainHeading = "Record poses easily with MotionTutor,"
const mainDescription = "Revolutionize choreography with our innovative app! Transform human poses from videos into intricate stick figure animations, simplifying complex movements into easy-to-follow steps."
const footerDescription = "MotionTutor - Record easy, with MotionTutor"

document.title = projectTitle

const logo = document.querySelectorAll(".logo")
if(logo){
  logo.forEach((item)=>{
    item.innerHTML = projectTitle
  })
}

if(document.querySelector("#main-description")){
  document.querySelector("#main-description").innerHTML = mainDescription
}

if(document.querySelector("#footer-description")){
  document.querySelector("#footer-description").innerHTML = footerDescription
}

if(document.querySelector("#main-heading")){
  document.querySelector("#main-heading").innerHTML = mainHeading
}

