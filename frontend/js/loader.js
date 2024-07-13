const setLoader = (value)=>{
    const loader = document.getElementById("loader")
    if(value){
        loader.classList.remove("hidden")
        loader.classList.add("flex")
    }else{
        loader.classList.remove("flex")
        loader.classList.add("hidden")
    }
}