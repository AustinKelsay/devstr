import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { useSession } from "next-auth/react";
import { Spinner } from "@chakra-ui/react";
import useSWR from "swr";

const ContributionCalendar = () => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const tooltipRef = useRef(null);
  const { data: session, status } = useSession();
  const user = session?.token?.login;
  const accessToken = session?.token?.accessToken;

  const headers = {
    headers: {
      Authorization: `token ${accessToken}`,
    },
  };

  const today = new Date();
  const sixMonthsAgo = new Date(
    today.getFullYear(),
    today.getMonth() - 6,
    1
  ).toISOString();

  const fetcher = (url) => axios.get(url, headers).then((res) => res.data);

  const { data: repos } = useSWR(
    `https://api.github.com/users/${user}/repos?per_page=100`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const fetchCommitsForRepo = async (repoName) => {
    const { data } = await axios.get(
      `https://api.github.com/repos/${user}/${repoName}/commits?since=${sixMonthsAgo}&per_page=100`,
      headers
    );
    return data;
  };

  const fetchCommits = async () => {
    if (!repos) return [];

    const allResults = [];

    for (const repo of repos) {
      const commits = await fetchCommitsForRepo(repo.name);
      allResults.push(...commits);
    }

    return allResults;
  };

  const fetchRepoCreationEvents = async () => {
    if (!repos) return [];

    return repos.filter((repo) => {
      const repoCreatedAt = new Date(repo.created_at);
      return repoCreatedAt >= new Date(sixMonthsAgo);
    });
  };

  const fetchPullRequestEvents = async (repoName, event) => {
    const { data } = await axios.get(
      `https://api.github.com/repos/${user}/${repoName}/pulls?state=all&per_page=100`,
      headers
    );
    return data.filter((pr) => {
      const eventDate = new Date(
        event === "open" ? pr.created_at : pr.merged_at
      );
      return eventDate >= new Date(sixMonthsAgo);
    });
  };

  const fetchPullRequestOpens = async () => {
    if (!repos) return [];

    const allResults = [];

    for (const repo of repos) {
      const prs = await fetchPullRequestEvents(repo.name, "open");
      allResults.push(...prs);
    }

    return allResults;
  };

  const fetchPullRequestMerges = async () => {
    if (!repos) return [];

    const allResults = [];

    for (const repo of repos) {
      const prs = await fetchPullRequestEvents(repo.name, "merged");
      allResults.push(...prs.filter((pr) => pr.merged_at));
    }

    return allResults;
  };

  const formatEvents = (allResults, eventType) => {
    const events = allResults.reduce((acc, event) => {
      const date = new Date(
        eventType === "commit"
          ? event.commit.committer.date
          : eventType === "repo"
          ? event.created_at
          : eventType === "open"
          ? event.created_at
          : event.merged_at
      );
      const key = `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`;

      if (!acc[key]) {
        acc[key] = { date: key, count: 0 };
      }

      acc[key].count += 1;

      return acc;
    }, {});

    return Object.values(events);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!repos) return;

      const commits = await fetchCommits();
      const repoCreationEvents = await fetchRepoCreationEvents();
      const pullRequestOpens = await fetchPullRequestOpens();
      const pullRequestMerges = await fetchPullRequestMerges();

      const formattedCommits = formatEvents(commits, "commit");
      const formattedRepoCreationEvents = formatEvents(
        repoCreationEvents,
        "repo"
      );
      const formattedPullRequestOpens = formatEvents(pullRequestOpens, "open");
      const formattedPullRequestMerges = formatEvents(
        pullRequestMerges,
        "merged"
      );

      const allContributions = [
        ...formattedCommits,
        ...formattedRepoCreationEvents,
        ...formattedPullRequestOpens,
        ...formattedPullRequestMerges,
      ];

      const contributions = allContributions.reduce((acc, contribution) => {
        if (!acc[contribution.date]) {
          acc[contribution.date] = { date: contribution.date, count: 0 };
        }
        acc[contribution.date].count += contribution.count;

        return acc;
      }, {});

      const earliestDate = new Date(Object.values(contributions)[0]?.date);
      const latestDate = new Date(today); // Use 'today' as the latest date

      setStartDate(sixMonthsAgo);
      setEndDate(latestDate);

      setContributions(Object.values(contributions));
      setLoading(false);
    };

    fetchData();
  }, [repos]);

  const handleMouseOver = (event, value) => {
    const tooltip = tooltipRef.current;
    const cell = event.target;
    const cellRect = cell.getBoundingClientRect();
    const x = cellRect.left + cellRect.width / 2 - tooltip.offsetWidth / 2;
    const y = cellRect.top - tooltip.offsetHeight - 10;
    tooltip.style.display = "block";
    tooltip.style.top = `${y}px`;
    tooltip.style.left = `${x}px`;
    tooltip.innerHTML = `${value.date}: ${value.count} contribution${
      value.count !== 1 ? "s" : ""
    }`;
  };

  const handleMouseLeave = () => {
    const tooltip = tooltipRef.current;
    tooltip.style.display = "none";
  };

  return loading ? (
    <Spinner color="gray.50" />
  ) : (
    <div className="contributionChart">
      <CalendarHeatmap
        startDate={startDate}
        endDate={endDate}
        values={contributions}
        classForValue={(value) => {
          if (!value) {
            return "color-empty";
          }
          if (value.count > 8) {
            return "colorScale8";
          } else {
            return `colorScale${value.count}`;
          }
        }}
        onMouseOver={(event, value) => {
          if (value) {
            handleMouseOver(event, value);
          } else {
            handleMouseLeave(event, {});
          }
        }}
        onMouseLeave={handleMouseLeave}
      />
      <div ref={tooltipRef} className="tooltip"></div>
    </div>
  );
};

export default ContributionCalendar;
