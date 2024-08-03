import { store } from "../main.js";

export default {
  template: `
    <main class="submissions">
      <h1>Review Submissions</h1>
      <div v-if="!loggedIn">
        <p>Please log in to view submissions.</p>
        <input type="text" v-model="username" placeholder="Username" />
        <input type="password" v-model="password" placeholder="Password" />
        <button @click="login">Log In</button>
      </div>
      <div v-else>
        <div v-if="submissions.levels.length">
          <h2>Levels</h2>
          <div v-for="submission in submissions.levels" :key="submission.id">
            <p>{{ submission.name }}</p>
            <p>{{ submission.details }}</p>
            <button @click="approve('levels', submission.id)">Approve</button>
            <button @click="reject('levels', submission.id)">Reject</button>
          </div>
        </div>
        <div v-if="submissions.records.length">
          <h2>Records</h2>
          <div v-for="submission in submissions.records" :key="submission.id">
            <p>{{ submission.name }}</p>
            <p>{{ submission.details }}</p>
            <button @click="approve('records', submission.id)">Approve</button>
            <button @click="reject('records', submission.id)">Reject</button>
          </div>
        </div>
      </div>
    </main>
  `,
  data: () => ({
    loggedIn: false,
    username: "",
    password: "",
    submissions: { levels: [], records: [] },
    store,
  }),
  async mounted() {
    if (this.loggedIn) {
      this.submissions = await fetch("/data/_submissions.json").then((res) =>
        res.json(),
      );
    }
  },
  methods: {
    login() {
      if (this.username === "admin" && this.password === "password") {
        // Replace with your own credentials
        this.loggedIn = true;
        this.mounted(); // Fetch submissions after login
      } else {
        alert("Invalid login credentials");
      }
    },
    async approve(type, id) {
      // Implement your approve logic here
      this.submissions[type] = this.submissions[type].filter(
        (submission) => submission.id !== id,
      );
      await this.saveSubmissions();
    },
    async reject(type, id) {
      // Implement your reject logic here
      this.submissions[type] = this.submissions[type].filter(
        (submission) => submission.id !== id,
      );
      await this.saveSubmissions();
    },
    async saveSubmissions() {
      await fetch("/data/_submissions.json", {
        method: "POST", // Use appropriate method as per your server configuration
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.submissions),
      });
    },
  },
};
