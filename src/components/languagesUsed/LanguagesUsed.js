import styles from "./languages.module.css";
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Spinner } from '@chakra-ui/react'



function LanguagesUsed() {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const username = "medranomiler"// Replace with the GitHub username you want to fetch
    const url = `https://api.github.com/users/${username}/repos`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        // Extract the language used in each repository and count their frequency
        const languages = data.map((repo) => repo.language);
        const languageCount = languages.reduce((acc, language) => {
          if (language) {
            acc[language] = (acc[language] || 0) + 1;
          }
          return acc;
        }, {});

        // Sort the languages by frequency and return the top 5
        const topLanguages = Object.entries(languageCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([language, count]) => ({ language, count }));

        setLanguages(topLanguages);
        setLoading(false);
      })
      .catch((error) => console.error(error));
  }, []);

  return loading ? (
    <Spinner color='gray.50' />
  ) :(
    <div className={styles.container}>
      <h1 className={styles.h1}>Most Used Programming Languages</h1>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={languages}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percent, language }) =>
                `${language}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {languages.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default LanguagesUsed;
