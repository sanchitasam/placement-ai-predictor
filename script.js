// Beginner-friendly prototype: this is a weighted formula, not machine learning.
const form = document.querySelector('#predictor-form');
const results = document.querySelector('#results');
const toggle = document.querySelector('.menu');
const links = document.querySelector('#links');
const againButton = document.querySelector('#predict-again');

toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
links.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  links.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

// Scale experience counts to 0–100 with clear caps.
function calculateProfile(data) {
  const categories = [
    { name: 'CGPA', score: data.cgpa * 10, weight: .18 },
    { name: '10th percentage', score: data.tenth, weight: .08 },
    { name: '12th percentage', score: data.twelfth, weight: .08 },
    { name: 'Projects', score: Math.min(data.projects / 4, 1) * 100, weight: .10 },
    { name: 'Internships', score: Math.min(data.internships / 2, 1) * 100, weight: .08 },
    { name: 'Certifications', score: Math.min(data.certifications / 5, 1) * 100, weight: .05 },
    { name: 'Programming skill', score: data.programming * 10, weight: .12 },
    { name: 'DSA skill', score: data.dsa * 10, weight: .12 },
    { name: 'Communication skill', score: data.communication * 10, weight: .09 },
    { name: 'Aptitude score', score: data.aptitude, weight: .10 },
  ]; // Weights add to 100%. This is a demonstration scoring choice.
  const score = Math.round(categories.reduce((sum, item) => sum + item.score * item.weight, 0));
  const ranked = [...categories].sort((a, b) => b.score - a.score);
  const strong = ranked.filter((item) => item.score >= 60).slice(0, 3);
  const improve = [...ranked].reverse().filter((item) => item.score < 60).slice(0, 3);
  return { score, categories, strong, improve, data };
}

function makeList(selector, items, emptyMessage) {
  const list = document.querySelector(selector);
  list.replaceChildren();
  (items.length ? items : [emptyMessage]).forEach((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    list.append(li);
  });
}

function getRoles(data) {
  const roles = [];
  if (data.programming >= 6 && data.dsa >= 6) roles.push('Software Developer');
  if (data.programming >= 6 && data.projects >= 2) roles.push('Frontend / Web Developer');
  if (data.aptitude >= 65 && data.communication >= 6) roles.push('Business or Systems Analyst');
  if (data.communication >= 7 && data.aptitude >= 55) roles.push('Customer Success Associate');
  if (data.projects >= 2 && data.certifications >= 2) roles.push('QA / Test Engineer');
  return roles.length ? roles.slice(0, 3) : ['Explore entry-level roles that offer structured training'];
}

function getSuggestions(profile) {
  const suggestions = [];
  if (profile.data.projects < 2) suggestions.push('Build a small project and add it to your portfolio.');
  if (profile.data.internships < 1) suggestions.push('Look for an internship, campus project, or volunteer experience.');
  if (profile.data.programming < 6) suggestions.push('Practice programming fundamentals with short coding exercises.');
  if (profile.data.dsa < 6) suggestions.push('Set a regular routine for data structures and problem solving.');
  if (profile.data.communication < 6) suggestions.push('Practice explaining a project clearly in a short mock interview.');
  if (profile.data.aptitude < 60) suggestions.push('Try timed aptitude questions and review the answers you miss.');
  if (profile.data.certifications < 2) suggestions.push('Choose one relevant course and finish it with a practical mini project.');
  if (suggestions.length < 2 && profile.improve.length) {
    suggestions.push(`Keep strengthening ${profile.improve[0].name.toLowerCase()} with a weekly practice goal.`);
  }
  if (!suggestions.length) suggestions.push('Keep your skills fresh and practice explaining your recent work.');
  return suggestions.slice(0, 3);
}

function showResults(profile) {
  const { score } = profile;
  document.querySelector('#readiness-score').textContent = `${score}%`;
  document.querySelector('#result-ring').style.background =
    `conic-gradient(var(--purple) ${score * 3.6}deg, #e7e3f2 0deg)`;
  const label = document.querySelector('#readiness-label');
  const status = document.querySelector('#result-status');
  const description = document.querySelector('#result-description');
  if (score >= 80) {
    label.textContent = 'Excellent';
    status.textContent = 'A well-rounded starting point';
    description.textContent = 'Your profile shows several areas of preparation. Keep learning and tailoring your applications.';
  } else if (score >= 65) {
    label.textContent = 'Good';
    status.textContent = 'You are building momentum';
    description.textContent = 'You have useful strengths to build on. A few focused steps can help round out your profile.';
  } else if (score >= 45) {
    label.textContent = 'Moderate';
    status.textContent = 'Room to build your profile';
    description.textContent = 'You have a starting point. Work on a couple of practical skills and experiences next.';
  } else {
    label.textContent = 'Needs Improvement';
    status.textContent = 'Your preparation is underway';
    description.textContent = 'Start with one manageable goal. Consistent practice and experience can build your profile over time.';
  }
  makeList('#strong-areas', profile.strong.map((item) => item.name), 'Your strengths will become clearer as you build experience.');
  makeList('#improve-areas', profile.improve.map((item) => item.name), 'Keep practicing across your profile.');
  makeList('#job-roles', getRoles(profile.data), 'Explore roles that match your interests.');
  makeList('#suggestions', getSuggestions(profile), 'Keep learning and set a new goal.');
  results.hidden = false;
  results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, Number(value)]));
  showResults(calculateProfile(data));
});

// Reset the form and return to the start of the predictor for another try.
againButton.addEventListener('click', () => {
  results.hidden = true;
  form.reset();
  document.querySelector('#predictor').scrollIntoView({ behavior: 'smooth' });
  form.querySelector('input').focus({ preventScroll: true });
});

