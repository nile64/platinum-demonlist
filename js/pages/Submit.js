import { store } from "../main.js";
import { embed } from "../util.js";
import { fetchEditors } from "../content.js";

import Spinner from "../components/Spinner.js";

export default {
    components: { Spinner },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-form">
            <div class="form-container">
                <h1>Submit a New Demon Level</h1>
                <form @submit.prevent="submitLevel">
                    <div class="form-group">
                        <label for="levelName">Level Name</label>
                        <input type="text" id="levelName" v-model="levelName" required>
                    </div>
                    <div class="form-group">
                        <label for="author">Author</label>
                        <input type="text" id="author" v-model="author" required>
                    </div>
                    <div class="form-group">
                        <label for="levelId">Level ID</label>
                        <input type="number" id="levelId" v-model="levelId" required>
                    </div>
                    <div class="form-group">
                        <label for="verificationVideo">Verification Video Link</label>
                        <input type="url" id="verificationVideo" v-model="verificationVideo" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password (if any)</label>
                        <input type="number" id="password" v-model="password">
                    </div>
                    <button type="submit" class="submit-button">Submit Level</button>
                </form>
                <div class="errors" v-if="errors.length > 0">
                    <p class="error" v-for="error in errors">{{ error }}</p>
                </div>
                <div class="meta">
                    <h3>Submission Requirements</h3>
                    <ul>
                        <li>Achieved the record without using hacks (FPS bypass allowed, up to 360fps).</li>
                        <li>Achieved the record on the level listed on the site - check the level ID before submitting.</li>
                        <li>Have either source audio or clicks/taps in the video. Edited audio only does not count.</li>
                        <li>Recording must show a previous attempt and entire death animation before the completion unless on the first attempt.</li>
                        <li>Recording must show the player hitting the endwall; otherwise, the completion is invalidated.</li>
                        <li>No secret or bug routes allowed.</li>
                        <li>No easy modes; only the unmodified level qualifies.</li>
                        <li>Once a level falls onto the Legacy List, records are accepted for 24 hours after it falls off; after that, no records are accepted.</li>
                    </ul>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        loading: true,
        levelName: '',
        author: '',
        levelId: '',
        verificationVideo: '',
        password: '',
        errors: [],
        store
    }),
    async mounted() {
        this.editors = await fetchEditors();
        if (!this.editors) {
            this.errors.push("Failed to load list editors.");
        }
        this.loading = false;
    },
    methods: {
        async submitLevel() {
            const formData = new FormData();
            formData.append('levelName', this.levelName);
            formData.append('author', this.author);
            formData.append('levelId', this.levelId);
            formData.append('verificationVideo', this.verificationVideo);
            formData.append('password', this.password);

            try {
                const response = await fetch('https://pnmgd.alwaysdata.net/submitDemonlistLevel.php', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`Failed to submit level, status code: ${response.status}`);
                }

                const result = await response.text();
                alert(result); // Display the response from PHP script (e.g., success message)

            } catch (error) {
                this.errors.push("Failed to submit the level. Please try again later.");
                console.error('Error submitting level:', error);
            }
        },
    },
};
