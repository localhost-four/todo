// Replace with your GitHub username and the repository name
const USERNAME = "localhost-four"; // e.g., "octocat"
const REPO_NAME = "TODO"; // e.g., "your-repo-name"

// Function to fetch repository information
async function fetchRepoInfo() {
    try {
        const response = await fetch(`https://api.github.com/repos/${USERNAME}/${REPO_NAME}`);
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        
        document.getElementById('repo-name').textContent = data.name || "Unknown";
        document.getElementById('repo-created').textContent = new Date(data.created_at).toLocaleDateString() || "Unknown";
        document.getElementById('repo-stars').textContent = data.stargazers_count || 0;
        document.getElementById('repo-forks').textContent = data.forks_count || 0;
        document.getElementById('repo-last-commit').textContent = data.pushed_at ? new Date(data.pushed_at).toLocaleString() : "Unknown";
        document.getElementById('current-url').textContent = window.location.href; // Current page URL
    } catch (error) {
        console.error('Failed to fetch repository info:', error);
    }
}

// Function to fetch recent commits
async function fetchRecentCommits() {
    try {
        const response = await fetch(`https://api.github.com/repos/${USERNAME}/${REPO_NAME}/commits`);
        if (!response.ok) throw new Error('Network response was not ok');

        const commits = await response.json();
        
        const commitsList = document.getElementById('commits-list');
        commitsList.innerHTML = ""; // Clear "Loading..." message

        commits.forEach(commit => {
            const listItem = document.createElement('li');
            listItem.textContent = `${commit.commit.message} - ${commit.commit.author.name} on ${new Date(commit.commit.author.date).toLocaleString()}`;
            commitsList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Failed to fetch commits:', error);
        document.getElementById('commits-list').textContent = 'Failed to fetch commits.';
    }
}

// Fetch repository info and recent commits on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchRepoInfo();
    fetchRecentCommits();
});

// Fetch repository info on page load
document.addEventListener('DOMContentLoaded', fetchRepoInfo);