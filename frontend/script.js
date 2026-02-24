const API = "http://localhost:5000/api";

let token = localStorage.getItem("token");

// ================= GET USER ID FROM TOKEN =================
function getUserIdFromToken() {
  if (!token) return null;
  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload.id;
}

const currentUserId = getUserIdFromToken();

// ================= AUTO LOGIN =================
if (token) {
  document.getElementById("authSection").style.display = "none";
  document.getElementById("appSection").style.display = "block";
  loadPosts();
}

// ================= REGISTER =================
async function register() {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  await fetch(`${API}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password })
  });

  alert("Registered successfully! Now login.");
}

// ================= LOGIN =================
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    location.reload();
  } else {
    alert("Login failed ❌");
  }
}

// ================= LOGOUT =================
function logout() {
  localStorage.clear();
  location.reload();
}

// ================= CREATE POST =================
async function createPost() {
  const content = document.getElementById("postContent").value;

  if (!content.trim()) return;

  await fetch(`${API}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ content })
  });

  document.getElementById("postContent").value = "";
  loadPosts();
}

// ================= LOAD POSTS =================
async function loadPosts() {
  const res = await fetch(`${API}/posts`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const posts = await res.json();
  const postsDiv = document.getElementById("posts");
  postsDiv.innerHTML = "";

  posts.forEach(post => {

    const likedByUser = post.likes.some(
      like => like._id === currentUserId || like === currentUserId
    );

    const isOwnPost = post.user._id === currentUserId;

    postsDiv.innerHTML += `
      <div class="post card">
        <h4>
          ${post.user.username}
          ${
            !isOwnPost
              ? `<button onclick="followUser('${post.user._id}')">Follow</button>`
              : ""
          }
        </h4>

        <p>${post.content}</p>

        <small>
          ${post.likes.length} Likes
        </small>
        <br>

        <button onclick="likePost('${post._id}')">
          ${likedByUser ? "Unlike 💔" : "Like ❤️"}
        </button>

        <hr>

        <div class="comments">
          ${post.comments.map(comment => `
            <p>
              <strong>${comment.user.username}:</strong> ${comment.text}
              ${
                comment.user._id === currentUserId
                  ? `<button onclick="deleteComment('${comment._id}')">❌</button>`
                  : ""
              }
            </p>
          `).join("")}
        </div>

        <input type="text" id="comment-${post._id}" placeholder="Write a comment...">
        <button onclick="addComment('${post._id}')">Comment</button>

      </div>
    `;
  });
}

// ================= FOLLOW USER =================
async function followUser(userId) {
  const res = await fetch(`${API}/users/follow/${userId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();
  alert(data.message);

  loadPosts();
}

// ================= LIKE POST =================
async function likePost(id) {
  await fetch(`${API}/posts/like/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` }
  });

  loadPosts();
}

// ================= ADD COMMENT =================
async function addComment(postId) {
  const input = document.getElementById(`comment-${postId}`);
  const text = input.value;

  if (!text.trim()) {
    alert("Comment cannot be empty");
    return;
  }

  await fetch(`${API}/comments/${postId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ text })
  });

  input.value = "";
  loadPosts();
}

// ================= DELETE COMMENT =================
async function deleteComment(commentId) {
  await fetch(`${API}/comments/${commentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  loadPosts();
}

// ================= AUTO REFRESH =================
setInterval(() => {
  if (localStorage.getItem("token")) {
    loadPosts();
  }
}, 5000);