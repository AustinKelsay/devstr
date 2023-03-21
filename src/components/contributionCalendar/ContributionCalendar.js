import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { useSession } from "next-auth/react";
import { Spinner } from '@chakra-ui/react'

const ContributionCalendar = () => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const tooltipRef = useRef(null);
  const { data: session, status } = useSession();
  const user = session?.token?.login

  const today = new Date();
  const lastYear = new Date(
    today.getFullYear() - 1,
    today.getMonth(),
    today.getDate()
  ).toISOString();
  const sixMonths = new Date(
    today.getFullYear(),
    today.getMonth() - 6,
    today.getDate()
  ).toISOString();

  useEffect(() => {
    const fetchData = async () => {
      const allResults = [];

      let result = null;
      let page = 1;
      do {
        result = await axios.get(
          `https://api.github.com/users/${user}/events?per_page=100&since=${lastYear}&page=${page}`
        );
        allResults.push(...result.data);
        page++;
      } while (
        result.headers.link &&
        result.headers.link.includes('rel="next"')
      );

      console.log(allResults);

      const commits = allResults
        .filter((event) => event.type === "PushEvent")
        .reduce((acc, pushEvent) => {
          const date = new Date(pushEvent.created_at);
          pushEvent.payload.commits.forEach((commit) => {
            const key = `${date.getFullYear()}-${
              date.getMonth() + 1
            }-${date.getDate()}`;

            if (!acc[key]) {
              acc[key] = { date: key, count: 0 };
            }

            acc[key].count += 1;
          });

          return acc;
        }, {});

      const contributions = Object.values(commits);
      const earliestDate = new Date(contributions[0].date);
      const latestDate = new Date(contributions[contributions.length - 1].date);

      if (earliestDate > latestDate) {
        setStartDate(sixMonths);
        setEndDate(earliestDate);
      } else {
        setStartDate(lastYear);
        setEndDate(latestDate);
      }

      setContributions(contributions);
      setLoading(false);
    };

    fetchData();
  }, []);

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
    <Spinner color='gray.50' />
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
      />
        <div ref={tooltipRef} className="tooltip"></div>
    </div>
  );
};

export default ContributionCalendar;
