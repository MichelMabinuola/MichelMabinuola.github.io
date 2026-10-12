// Build step: save star counts for the GitHub projects in resume.json → openSource.
// The site itself never calls GitHub; if this fetch fails, the last saved numbers are kept.
import { readFileSync, writeFileSync } from 'node:fs'

const OUT = 'content/github-stats.json'
const resume = JSON.parse(readFileSync('content/resume.json', 'utf8'))
let stats = {}
try {
  stats = JSON.parse(readFileSync(OUT, 'utf8'))
} catch {
  // First run: start empty.
}

const repos = [
  ...new Set(
    (resume.openSource ?? [])
      .map((e) => e.url?.match(/^https:\/\/github\.com\/([^/]+\/[^/]+)/)?.[1])
      .filter(Boolean),
  ),
]
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-build' }
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

for (const repo of repos) {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, { headers, signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const { stargazers_count } = await res.json()
    stats[repo] = { stars: stargazers_count, fetchedAt: new Date().toISOString().slice(0, 10) }
    console.log(`github-stats: ${repo} ★ ${stargazers_count}`)
  } catch (err) {
    console.warn(`github-stats: kept saved value for ${repo} (${err.message})`)
  }
}
writeFileSync(OUT, JSON.stringify(stats, null, 2) + '\n')
