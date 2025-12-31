import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OWNER = 'jason-ruis';
const REPO = 'thoughts';

async function fetchNotes() {
  // Use GitHub Actions token or personal token
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.error('GITHUB_TOKEN environment variable is required');
    console.error('For local development, set it with: export GITHUB_TOKEN=your_pat_here');
    process.exit(1);
  }

  const octokit = new Octokit({ auth: token });

  console.log(`Fetching repository contents from ${OWNER}/${REPO}...`);

  const notes = [];

  async function fetchDirectory(dirPath = '') {
    try {
      const { data: contents } = await octokit.repos.getContent({
        owner: OWNER,
        repo: REPO,
        path: dirPath
      });

      // Handle single file response
      const items = Array.isArray(contents) ? contents : [contents];

      for (const item of items) {
        if (item.type === 'dir' && !item.name.startsWith('.')) {
          // Recursively fetch subdirectories
          await fetchDirectory(item.path);
        } else if (item.type === 'file' && item.name.endsWith('.md')) {
          // Fetch file content
          const { data: fileData } = await octokit.repos.getContent({
            owner: OWNER,
            repo: REPO,
            path: item.path
          });

          if (fileData.content) {
            const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
            notes.push({
              path: item.path,
              name: item.name,
              content: content
            });
            console.log(`  Fetched: ${item.path}`);
          }
        }
      }
    } catch (error) {
      if (error.status === 404) {
        console.warn(`  Warning: Path not found: ${dirPath}`);
      } else {
        throw error;
      }
    }
  }

  try {
    await fetchDirectory();

    // Write to data file
    const outputPath = path.join(__dirname, '..', 'src', 'data', 'notes.json');

    // Ensure directory exists
    const dataDir = path.dirname(outputPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(notes, null, 2));
    console.log(`\nSuccessfully fetched ${notes.length} notes to ${outputPath}`);

  } catch (error) {
    console.error('Error fetching notes:', error.message);
    if (error.status === 401) {
      console.error('Authentication failed. Please check your GITHUB_TOKEN.');
    } else if (error.status === 403) {
      console.error('Access forbidden. Make sure your token has repo access.');
    }
    process.exit(1);
  }
}

fetchNotes();
