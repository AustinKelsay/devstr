import styles from "./languages.module.css"
import { useState, useEffect } from 'react';

function LanguagesUsed() {
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    const username = 'AustinKelsay'; // Replace with the GitHub username you want to fetch
    const url = `https://api.github.com/users/${username}/repos`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        // Extract the language used in each repository and count their frequency
        const languages = data.map(repo => repo.language);
        const languageCount = languages.reduce((acc, language) => {
          acc[language] = (acc[language] || 0) + 1;
          return acc;
        }, {});

        // Sort the languages by frequency and return the top 5
        const topLanguages = Object.entries(languageCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([language, count]) => ({ language, count }));

        setLanguages(topLanguages);
      })
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <h1>Most Used Programming Languages</h1>
      <ul>
        {languages.map(language => (
          <li key={language.language}>
            {language.language}: {language.count}
          </li>
        ))}
      </ul>
    </div>
  );
}




export default LanguagesUsed;