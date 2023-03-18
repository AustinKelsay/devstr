import { useState, useEffect } from 'react';

const Recent = () => {
  const [data, setData] = useState(null);
  const username = 'AustinKelsay';
//   const access_token = 'your_access_token_here';
  const url = `https://api.github.com/users/${username}/events`;

  useEffect(() => {
    fetch(url
    )
      .then((response) => response.json())
      .then((data) => setData(data),
      console.log(setData))
      .catch((error) => console.error(error));
  }, [url]);

  if (!data) {
    return <div>Loading...</div>;
  }

  if (data.message) {
    return <div>Error: {data.message}</div>;
  }

  // do something with the data
  return <div>{JSON.stringify(data)}</div>;
};

export default Recent;
