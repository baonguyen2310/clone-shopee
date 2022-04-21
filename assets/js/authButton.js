const registers = document.getElementsByClassName("register");
for (let i in registers) {
    registers[i].onclick = handleRegister;
}

function handleRegister() {
    document.getElementsByClassName("modal")[0].style.display = "block";
    document.getElementsByClassName("register-form")[0].style.display = "block";
    document.getElementsByClassName("login-form")[0].style.display = "none";
};

const logins = document.getElementsByClassName("login");
for (let i in logins) {
    logins[i].onclick = handleLogin;
}

function handleLogin() {
    document.getElementsByClassName("modal")[0].style.display = "block";
    document.getElementsByClassName("login-form")[0].style.display = "block";
    document.getElementsByClassName("register-form")[0].style.display = "none";
};

const modalOverlay = document.getElementsByClassName("modal__overlay")[0];
modalOverlay.addEventListener("click", exitModal);

const backBtns = document.getElementsByClassName("back-btn");
for (let i in backBtns) {
    backBtns[i].onclick = exitModal;
}

function exitModal(){
    document.getElementsByClassName("modal")[0].style.display = "none";
}