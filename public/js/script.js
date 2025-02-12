const showPswBtn = document.querySelector("#showPswBtn")
showPswBtn.addEventListener("click", function() {
    const pswInput = document.getElementById("account_password")
    const type = pswInput.getAttribute("type")
    if (type == "password") {
        pswInput.setAttribute("type", "text")
        showPswBtn.innerHTML = "Hide Password"
    } else {
        pswInput.setAttribute("type", "password")
        showPswBtn.innerHTML = "Show Password"
    }
})