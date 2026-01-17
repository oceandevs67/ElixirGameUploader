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

  if (!name || !link) return alert("Fill in all fields");

  db.ref("games").push({
      name: name,
      link: link,
      author: currentUser.uid
  }).then(() => {
      loadGames();
      document.getElementById("game-name").value = "";
      document.getElementById("game-link").value = "";
  });
}

// Load user's games
function loadGames() {
  db.ref("games").orderByChild("author").equalTo(currentUser.uid).once("value")
    .then(snapshot => {
        gameList.innerHTML = "";
        snapshot.forEach(child => {
            const li = document.createElement("li");
            li.textContent = child.val().name + " → " + child.val().link;

            const delBtn = document.createElement("button");
            delBtn.textContent = "Delete";
            delBtn.onclick = () => {
                db.ref("games/" + child.key).remove().then(loadGames);
            };

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
