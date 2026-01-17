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

// Register
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

// Login
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

// Show main UI
function showMainUI() {
  authContainer.style.display = "none";
  mainContainer.style.display = "block";
  userEmailSpan.textContent = currentUser.email;
  loadGames();
}

// Upload game
function uploadGame() {
  const name = document.getElementById("game-name").value;
  const link = document.getElementById("game-link").value;
  const exeName = document.getElementById("game-exe")?.value || "";

  if (!name || !link || !exeName) return alert("Fill in all fields");

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

// Load user's games
function loadGames() {
  db.ref("games").orderByChild("author").equalTo(currentUser.uid).once("value")
    .then(snapshot => {
        gameList.innerHTML = "";
        snapshot.forEach(child => {
            const game = child.val();

            const li = document.createElement("li");

            // Editable fields
            const nameInput = document.createElement("input");
            nameInput.value = game.name;

            const linkInput = document.createElement("input");
            linkInput.value = game.link;

            const exeInput = document.createElement("input");
            exeInput.value = game.exe || "";
            exeInput.placeholder = "EXE Name";

            // Buttons
            const saveBtn = document.createElement("button");
            saveBtn.textContent = "Save";
            saveBtn.onclick = () => {
                db.ref("games/" + child.key).update({
                    name: nameInput.value,
                    link: linkInput.value,
                    exe: exeInput.value
                }).then(loadGames);
            };

            const delBtn = document.createElement("button");
            delBtn.textContent = "Delete";
            delBtn.onclick = () => {
                db.ref("games/" + child.key).remove().then(loadGames);
            };

            li.appendChild(nameInput);
            li.appendChild(linkInput);
            li.appendChild(exeInput);
            li.appendChild(saveBtn);
            li.appendChild(delBtn);

            gameList.appendChild(li);
        });
    });
}

// Logout
function logout() {
  auth.signOut().then(() => {
      currentUser = null;
      mainContainer.style.display = "none";
      authContainer.style.display = "block";
  });
}

// Auto check if user is logged in
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        showMainUI();
    }
});
