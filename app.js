// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCCAsCJky9mDd5yhGcIlhPV-j_6kXbxsuA",
  authDomain: "elixirlauncher.firebaseapp.com",
  databaseURL: "https://elixirlauncher-default-rtdb.firebaseio.com",
  projectId: "elixirlauncher"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

const authContainer = document.getElementById("auth-container");
const mainContainer = document.getElementById("main-container");
const userEmailSpan = document.getElementById("user-email");
const authMessage = document.getElementById("auth-message");
const gameList = document.getElementById("game-list");

let currentUser = null;

// ==========================
// DOWNLOAD LAUNCHER BUTTON
// ==========================
function downloadLauncher() {
  window.open(
    "https://drive.google.com/drive/folders/1smSItox6kqFD6Gj5jmnjLvyLI__eAy_a?usp=sharing",
    "_blank"
  );
}

// ==========================
// REGISTER
// ==========================
function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(userCred => {
      currentUser = userCred.user;
      showMainUI();
    })
    .catch(err => authMessage.textContent = err.message);
}

// ==========================
// LOGIN
// ==========================
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(userCred => {
      currentUser = userCred.user;
      showMainUI();
    })
    .catch(err => authMessage.textContent = err.message);
}

// ==========================
// SHOW MAIN UI
// ==========================
function showMainUI() {
  authContainer.style.display = "none";
  mainContainer.style.display = "block";
  userEmailSpan.textContent = currentUser.email;
  loadGames();
}

// ==========================
// UPLOAD GAME
// ==========================
function uploadGame() {
  const name = document.getElementById("game-name").value;
  const link = document.getElementById("game-link").value;
  const exeName = document.getElementById("game-exe").value;

  if (!name || !link || !exeName) {
    alert("Fill in all fields");
    return;
  }

  db.ref("games").push({
    name: name,
    link: link,
    exe: exeName,
    author: currentUser.uid
  }).then(() => {
    loadGames();
    document.getElementById("game-name").value = "";
    document.getElementById("game-link").value = "";
    document.getElementById("game-exe").value = "";
  });
}

// ==========================
// LOAD GAMES
// ==========================
function loadGames() {
  db.ref("games")
    .orderByChild("author")
    .equalTo(currentUser.uid)
    .once("value")
    .then(snapshot => {
      gameList.innerHTML = "";

      snapshot.forEach(child => {
        const game = child.val();
        const li = document.createElement("li");

        // Inputs
        const nameInput = document.createElement("input");
        nameInput.value = game.name;

        const linkInput = document.createElement("input");
        linkInput.value = game.link;

        const exeInput = document.createElement("input");
        exeInput.value = game.exe;
        exeInput.placeholder = "EXE Name";

        // Save button
        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Save";
        saveBtn.onclick = () => {
          db.ref("games/" + child.key).update({
            name: nameInput.value,
            link: linkInput.value,
            exe: exeInput.value
          }).then(loadGames);
        };

        // Download button
        const downloadBtn = document.createElement("button");
        downloadBtn.textContent = "Download";
        downloadBtn.onclick = () => {
          window.open(game.link, "_blank");
        };

        // Delete button
        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.onclick = () => {
          db.ref("games/" + child.key).remove().then(loadGames);
        };

        li.appendChild(nameInput);
        li.appendChild(linkInput);
        li.appendChild(exeInput);
        li.appendChild(saveBtn);
        li.appendChild(downloadBtn);
        li.appendChild(delBtn);

        gameList.appendChild(li);
      });
    });
}

// ==========================
// LOGOUT
// ==========================
function logout() {
  auth.signOut().then(() => {
    currentUser = null;
    mainContainer.style.display = "none";
    authContainer.style.display = "block";
  });
}

// ==========================
// AUTO LOGIN CHECK
// ==========================
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    showMainUI();
  }
});

