import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { bodySkeleton, readyMeDefaultPositions, readyMePlayerDefaultSize } from "../utils/constants.js";
import { getDistance } from "../utils/utils.js";

const canvas = document.getElementById("render-canvas");
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ 
  canvas: canvas,
  alpha: true,
  antialias: true,
 });
const loader = new GLTFLoader();
renderer.setPixelRatio(window.devicePixelRatio);


const socket = io("http://localhost:5000");
socket.on('connect', function() {
    console.log('Socket connected to the backend.');
});


const animate = () => {
    fetch("http://127.0.0.1:5000/animatevideo", {
      method: "POST",
    })
      .then((response) => {
        if (!response.ok) {
          alert("Network error");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error(error);
        alert("Error uploading video:");
      });
  };
document.getElementById("animate-btn").addEventListener('click',animate)

loader.load('../assets/input.glb', function (gltf) {
    renderer.setSize(canvas.getBoundingClientRect().width, canvas.getBoundingClientRect().height);
    renderer.outputEncoding = THREE.sRGBEncoding;

    scene.background = new THREE.Color(0xffffff);
    const axis = new THREE.AxesHelper(2)

    const light = new THREE.AmbientLight(0xffffff);
    scene.add(light);

    const camera = new THREE.PerspectiveCamera(60, canvas.getBoundingClientRect().width / canvas.getBoundingClientRect().height, 0.1, 1000);
    camera.position.set(0, 0, 4);
    // camera.lookAt(new THREE.Vector3());
    scene.add(camera);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    gltf.scene.scale.set(1, 1, 1)
    gltf.scene.position.set(0,0,0)
    gltf.scene.add(axis)
    scene.add(gltf.scene);

    socket.on('keypoints_data', function (keypoints) {
      updateCharacterPose(keypoints);
    });
    function updateCharacterPose(keypoints) {
        keypoints.map((firstitem,index)=>{
            const jointName = Object.entries(bodySkeleton).find(item => item[1] === index)
            if(!jointName || jointName === undefined) return
            gltf.scene.traverse((item)=>{
                if(item.name === jointName[0] && item.type === "Bone"){
                    const vectors = new THREE.Vector3(firstitem.x,firstitem.y,firstitem.z)
                    item.position.set(...vectors)
                }
            })
        })
    }

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    animate();
}, undefined, function (error) {
    console.error(error);
});

