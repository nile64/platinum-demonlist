import { store } from "../main.js";

export default {
  template: `
    <div>
      <main class="login-page" v-if="!loggedIn">
        <h1>Login</h1>
        <form @submit.prevent="handleLogin">
          <label for="username">Username</label>
          <input
            v-model="username"
            id="username"
            type="text"
            placeholder="Enter your username"
            required
          />
          <label for="password">Password</label>
          <input
            v-model="password"
            id="password"
            type="password"
            placeholder="Enter your password"
            required
          />
          <button type="submit">Login</button>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </form>
      </main>
      <main class="submissions-page" v-else>
        <h1>Submissions</h1>
        <section v-if="sortedSubmissions.length" class="submissions-list">
          <div v-for="submission in sortedSubmissions" :key="submission.id" class="submission-card">
            <h2>{{ submission.type === 'record' ? 'Record Submission' : 'Level Submission' }}</h2>
            <p :class="getStatusClass(submission.state)">
              {{ getStatusText(submission.state) }}
            </p>
            <p v-if="submission.type === 'record'"><strong>Player Name:</strong> {{ submission.playerName }}</p>
            <p v-if="submission.type === 'record' && submission.percentage"><strong>Percentage:</strong> {{ submission.percentage }}%</p>
            <p v-if="submission.type === 'record' && submission.hz"><strong>Hz:</strong> {{ submission.hz }}</p>
            <p v-if="submission.type === 'record' && submission.levelName"><strong>Level Name:</strong> {{ submission.levelName }}</p>
            <p v-if="submission.type === 'level'"><strong>Creators:</strong> {{ formatCreators(submission.creators) }}</p>
            <p v-if="submission.type === 'level'"><strong>Percentage to Qualify:</strong> {{ submission.percentToQualify }}%</p>
            <p v-if="submission.type === 'level'"><strong>Verifier:</strong> {{ submission.verifier }}</p>
            <p v-if="submission.type === 'level'"><strong>Verification:</strong> <a :href="submission.verification" target="_blank">Watch</a></p>
            <p v-if="submission.type === 'record'"><strong>Video:</strong> <a :href="submission.video" target="_blank">Watch</a></p>
            <p><strong>Submission Date:</strong> {{ formatDate(submission.submissionDate) }}</p>
            <div class="submission-actions">
              <button @click="acceptSubmission(submission)" class="accept-button">Accept</button>
              <button @click="denySubmission(submission)" class="deny-button">Deny</button>
            </div>
          </div>
        </section>
        <p v-else>No submissions found.</p>
      </main>
    </div>
  `,
  data() {
    return {
      username: "",
      password: "",
      loggedIn: false,
      errorMessage: "",
      submissions: [],
    };
  },
  computed: {
    sortedSubmissions() {
      let ret = this.submissions
        .slice()
        .sort((a, b) => a.state - b.state);
      return ret;
    },
  },
  methods: {
    getStatusText(state) {
      return state === 0 ? "Unread" : state === 1 ? "Accepted" : "Denied";
    },
    getStatusClass(state) {
      return state === 0
        ? "status-unread"
        : state === 1
          ? "status-accepted"
          : "status-denied";
    },
    formatDate(dateString) {
      const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      };
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, options);
    },
    formatCreators(creators) {
      try {
        return JSON.parse(creators).join(", ");
      } catch (e) {
        console.error("Failed to parse creators:", e);
        return creators;
      }
    },
    async handleLogin() {
      try {
        const response = await fetch(
          `https://platinum.141412.xyz/demonlistLogin.php?username=${this.username}&password=${this.password}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        const data = await response.json();
        if (data.message === "Login successful.") {
          this.loggedIn = true;
          this.errorMessage = "";
          await this.fetchSubmissions();
        } else {
          this.errorMessage = data.error;
        }
      } catch (error) {
        console.error("Failed to login:", error);
        this.errorMessage = "An error occurred. Please try again.";
      }
    },
    async fetchSubmissions() {
      try {
        const response = await fetch(
          "https://platinum.141412.xyz/getSubmissions.php",
        );
        const data = await response.json();
        if (!data.message === "No submissions found." || data.message == undefined) {
          this.submissions = data.submissions;
        } else {
          this.submissions = [];
        }
      } catch (error) {
        console.error("Failed to fetch submissions:", error);
      }
    },
    async acceptSubmission(submission) {
      let type = submission.type;
      let id = type === "record" ? submission.id : submission.submissionId;
      let name = type === "record" ? submission.levelName : submission.name;
      try {
        const response = await fetch(
          "https://platinum.141412.xyz/updateSubmission.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              raw: submission,
              name: name,
              type: type,
              id: id,
              state: 1,
            }),
          },
        );
        console.log("Accepted:", submission);
      } catch (error) {
        console.error("Failed to accept submission:", error);
      }
    },
    async denySubmission(submission) {
      let type = submission.type;
      let id = type === "record" ? submission.id : submission.submissionId;
      let name = type === "record" ? submission.levelName : submission.name;
      try {
        const response = await fetch(
          "https://platinum.141412.xyz/updateSubmission.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              raw: submission,
              name: name,
              type: type,
              id: id,
              state: 2,
            }),
          },
        );
        console.log("Denied:", submission);
      } catch (error) {
        console.error("Failed to deny submission:", error);
      }
    },
  },
  async created() {
    // Check if the user is already logged in
    try {
      const response = await fetch("https://platinum.141412.xyz/checkAuth.php");
      const data = await response.json();
      if (data.loggedIn) {
        this.loggedIn = true;
        await this.fetchSubmissions();
      }
    } catch (error) {
      console.error("Failed to check authentication:", error);
    }
  },
};
