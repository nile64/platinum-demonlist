import { store } from "../main.js";

export default {
  template: `
    <main class="submit-record">
      <h1>Submit Level or Record</h1>
      <form @submit.prevent="submitSubmission">
        <label for="type">Submission Type:</label>
        <select v-model="type" id="type" required>
          <option value="record">Record</option>
          <option value="level">Level</option>
        </select>

        <input v-if="type === 'record'" type="text" v-model="levelName" placeholder="Level Name" required />
        <input v-if="type === 'record'" type="text" v-model="playerName" placeholder="Player Name" required />
        <input v-if="type === 'level'" type="number" v-model.number="id" placeholder="Level ID" required />
        <input v-if="type === 'level'" type="text" v-model="name" placeholder="Level Name" required />
        <textarea v-if="type === 'level'" v-model="creators" placeholder="Creators (comma-separated)" required></textarea>
        <input v-if="type === 'level'" type="text" v-model="verifier" placeholder="Verifier" required />
        <input v-if="type === 'level'" type="url" v-model="verification" placeholder="Verification Video URL" required />
        <input v-if="type === 'record'" type="number" v-model.number="percentage" placeholder="Percentage" required />
        <input v-if="type === 'record'" type="number" v-model.number="hz" placeholder="Hz" required />
        <input v-if="type === 'record'" type="url" v-model="video" placeholder="YouTube Video URL" required />

        <button type="submit">Submit</button>
      </form>
    </main>
  `,
  data: () => ({
    type: "record", // Default to 'record'
    playerName: "",
    levelName: "",
    id: null, // Only used for level submissions
    name: "", // Only used for level submissions
    creators: "", // Only used for level submissions, comma-separated
    verifier: "", // Only used for level submissions
    verification: "", // Only used for level submissions
    percentage: "",
    video: "",
    hz: NaN,
    store,
  }),
  methods: {
    async submitSubmission() {
      if (this.type === "record" && !this.validateYouTubeURL(this.video)) {
        alert("Please enter a valid YouTube URL.");
        return;
      }

      if (this.type === "level" && !this.validateYouTubeURL(this.verification)) {
        alert("Please enter a valid YouTube URL.");
        return;
      }

      if (this.type === "record" && (isNaN(this.hz) || this.hz <= 0)) {
        alert("Please enter a valid Hz value.");
        return;
      }

      // Convert creators to an array
      const creatorsArray = this.creators
        .split(",")
        .map((creator) => creator.trim());

      const response = await fetch(
        "https://platinum.141412.xyz/uploadSubmission.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: this.type,
            playerName: this.playerName,
            levelName: this.levelName,
            id: this.id,
            name: this.name,
            creators: creatorsArray,
            verifier: this.verifier,
            verification: this.verification,
            percentage: this.percentage,
            video: this.video,
            hz: this.hz,
          }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        this.playerName = "";
        (this.levelName = ""), (this.id = null);
        this.name = "";
        this.creators = "";
        this.verifier = "";
        this.verification = "";
        this.percentage = "";
        this.video = "";
        this.hz = NaN;
        alert(result.message || "Submission successful!");
      } else {
        alert(result.error || "Failed to submit");
      }
    },
    validateYouTubeURL(url) {
      const pattern = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
      return pattern.test(url);
    },
  },
};
