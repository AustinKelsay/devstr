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

  const fetchPushEvents = async () => {
    const { data } = await axios.get(
      `https://api.github.com/users/${user}/events/public?per_page=100`,
      headers
    );
    return data.filter((event) => {
      const eventDate = new Date(event.created_at);
      return event.type === "PushEvent" && eventDate >= new Date(sixMonthsAgo);
    });
  };

  const fetchCommitsForRepo = async (repoName) => {
    const { data } = await axios.get(
      `https://api.github.com/repos/${user}/${repoName}/commits?since=${sixMonthsAgo}&per_page=100`,
      headers
    );
    return data;
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
          : eventType === "merged"
          ? event.merged_at
          : event.created_at // For PushEvent
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

  const fetchDataAndUpdate = async (fetchFunc, args, eventType) => {
    try {
      const data = await fetchFunc(...args);
      updateContributions(data, eventType);
    } catch (error) {
      console.error(`Error fetching ${eventType} data:`, error);
    }
  };

  const updateContributions = (newData, eventType) => {
    const formattedData = formatEvents(newData, eventType);

    setContributions((prevContributions) => {
      const updatedContributions = { ...prevContributions };

      formattedData.forEach((data) => {
        if (!updatedContributions[data.date]) {
          updatedContributions[data.date] = {
            date: data.date,
            count: 0,
          };
        }

        updatedContributions[data.date].count += data.count;
      });

      return Object.values(updatedContributions);
    });

    if (loading) {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!repos) return;

      setLoading(true);

      // Set startDate and endDate
      setStartDate(new Date(today.getFullYear(), today.getMonth() - 6, 1));
      setEndDate(today);

      const fetchFuncs = [
        { func: fetchPushEvents, args: [], eventType: "push" },
        ...repos.map((repo) => ({
          func: fetchCommitsForRepo,
          args: [repo.name],
          eventType: "commit",
        })),
        { func: fetchRepoCreationEvents, args: [], eventType: "repo" },
        ...repos.map((repo) => ({
          func: fetchPullRequestEvents,
          args: [repo.name, "open"],
          eventType: "open",
        })),
        ...repos.map((repo) => ({
          func: fetchPullRequestEvents,
          args: [repo.name, "merged"],
          eventType: "merged",
        })),
      ];

      const fetchPromises = fetchFuncs.map(
        async ({ func, args, eventType }) => {
          try {
            const data = await func(...args);
            updateContributions(data, eventType);
          } catch (error) {
            console.error(`Error fetching ${eventType} data:`, error);
          }
        }
      );

      await Promise.allSettled(fetchPromises);
      setLoading(false);
    };

    fetchData();
  }, [repos]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString(undefined, options);
  };

  const handleMouseOver = (event, value) => {
    const tooltip = tooltipRef.current;
    const cell = event.target;
    const cellRect = cell.getBoundingClientRect();
    const x =
      cellRect.left +
      window.scrollX +
      cellRect.width / 2 -
      tooltip.offsetWidth / 2;
    const y = cellRect.top + window.scrollY - tooltip.offsetHeight - 10;
    tooltip.style.display = "block";
    tooltip.style.opacity = "0";
    tooltip.style.transform = "translateY(10px)";
    tooltip.style.top = `${y}px`;
    tooltip.style.left = `${x}px`;
    tooltip.innerHTML = `${formatDate(value.date)}: ${
      value.count
    } contribution${value.count !== 1 ? "s" : ""}`;

    setTimeout(() => {
      tooltip.style.opacity = "1";
      tooltip.style.transform = "translateY(0)";
    }, 100);
  };

  const handleMouseLeave = () => {
    const tooltip = tooltipRef.current;
    tooltip.style.display = "none";
  };

  return (
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
            return "colorScale8 cellFadeIn";
          } else {
            return `colorScale${value.count} cellFadeIn`;
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
